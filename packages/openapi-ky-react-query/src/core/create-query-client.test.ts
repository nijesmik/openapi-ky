import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

// vitest의 기본 node 환경에선 `isServer`가 true라 매 호출마다 새 QueryClient를 만든다.
// 브라우저 싱글턴 동작을 검증하려면 `isServer`를 false로 강제해야 한다.
vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual<typeof import("@tanstack/react-query")>();
  return { ...actual, isServer: false };
});

import { createQueryClient } from "./create-query-client";

type TestPaths = {
  "/posts": {
    get: {
      responses: { 200: { content: { "application/json": { id: number; title: string }[] } } };
    };
  };
  "/posts/{postId}": {
    get: {
      responses: { 200: { content: { "application/json": { id: number; title: string } } } };
    };
  };
};

describe("createQueryClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getQueryClient", () => {
    it("브라우저에서 동일 인스턴스를 재사용한다 (싱글턴)", () => {
      const factory = createQueryClient<TestPaths>();

      expect(factory.getQueryClient()).toBe(factory.getQueryClient());
    });
  });

  describe("팩토리 callable", () => {
    it("팩토리 자체를 호출하면 getQueryClient와 동일한 인스턴스를 반환한다", () => {
      const factory = createQueryClient<TestPaths>();

      expect(factory()).toBe(factory.getQueryClient());
    });
  });

  describe("setQueryData", () => {
    it("setQueryData를 dispatch하며 updater를 그대로 전달한다", () => {
      const setSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
      const factory = createQueryClient<TestPaths>();
      const updater = (prev: { id: number; title: string } | undefined) => prev;

      factory.setQueryData({
        path: "/posts/{postId}",
        params: { postId: 1 },
        updater,
      });

      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(setSpy.mock.calls[0]?.[1]).toBe(updater);
    });

    it("[회귀 테스트] QueryClient.setQueryData의 리턴 값을 그대로 전파한다", () => {
      const sentinel = Symbol("setQueryData result");
      const setSpy = vi
        .spyOn(QueryClient.prototype, "setQueryData")
        .mockReturnValue(sentinel as never);
      const factory = createQueryClient<TestPaths>();

      const result = factory.setQueryData({ path: "/posts", updater: [] });

      expect(result).toBe(sentinel);
      expect(setSpy).toHaveBeenCalled();
    });
  });

  describe("invalidateQueries", () => {
    it("invalidateQueries를 dispatch한다", () => {
      const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
      const factory = createQueryClient<TestPaths>();

      factory.invalidateQueries({ path: "/posts" });

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });

    it("filter 옵션과 invalidate 옵션을 분리해 전달한다", () => {
      const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
      const factory = createQueryClient<TestPaths>();

      factory.invalidateQueries(
        {
          path: "/posts/{postId}",
          params: { postId: 1 },
          exact: true,
        },
        { cancelRefetch: false, throwOnError: true },
      );

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ exact: true, queryKey: expect.any(Array) }),
        { cancelRefetch: false, throwOnError: true },
      );
    });
  });

  describe("method 분리 매칭", () => {
    it("invalidateQueries({ method: 'post', path })는 같은 path의 GET query를 매칭하지 않는다", async () => {
      type Paths = {
        "/items": {
          get: { responses: { 200: { content: { "application/json": never[] } } } };
          post: {
            requestBody: { content: { "application/json": { x: string } } };
            responses: { 200: { content: { "application/json": never[] } } };
          };
        };
      };

      const queryClient = createQueryClient<Paths>();
      const client = queryClient.getQueryClient();

      // GET cache, POST cache 둘 다 미리 채움.
      client.setQueryData(["/items"], ["GET-DATA"]);
      client.setQueryData(["/items", "post"], ["POST-DATA"]);

      await queryClient.invalidateQueries({ method: "post", path: "/items" });

      // POST 캐시는 invalidated, GET은 그대로
      const getQuery = client.getQueryState(["/items"]);
      const postQuery = client.getQueryState(["/items", "post"]);

      expect(getQuery?.isInvalidated).toBe(false);
      expect(postQuery?.isInvalidated).toBe(true);
    });
  });
});
