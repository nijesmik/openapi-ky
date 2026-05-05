import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `isServer` is a module-level constant that drives the browser/server branch
// in `getQueryClient`. Vitest's default node environment exposes it as `true`,
// so a `vi.hoisted` + getter mock is used to flip the branch per test.
const mocks = vi.hoisted(() => ({ isServer: false }));

vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    get isServer() {
      return mocks.isServer;
    },
  };
});

import { createQueryClient } from "./create-query-client";

type TestPaths = {
  "/posts": {
    get: {
      responses: { 200: { content: { "application/json": { id: number; title: string }[] } } };
    };
  };
  "/posts/{postId}": {
    parameters: { path: { postId: number } };
    get: {
      parameters: { path: { postId: number } };
      responses: { 200: { content: { "application/json": { id: number; title: string } } } };
    };
  };
};

describe("createQueryClient", () => {
  beforeEach(() => {
    mocks.isServer = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getQueryClient", () => {
    it("브라우저에서 동일 인스턴스를 재사용한다 (싱글턴)", () => {
      const factory = createQueryClient<TestPaths>();

      expect(factory.getQueryClient()).toBe(factory.getQueryClient());
    });

    it("서버에서는 매 호출마다 새 인스턴스를 반환한다 (SSR state leak 방지)", () => {
      mocks.isServer = true;
      const factory = createQueryClient<TestPaths>();

      expect(factory.getQueryClient()).not.toBe(factory.getQueryClient());
    });
  });

  describe("팩토리 callable", () => {
    it("팩토리 자체를 호출하면 getQueryClient와 동일한 인스턴스를 반환한다", () => {
      const factory = createQueryClient<TestPaths>();

      expect(factory()).toBe(factory.getQueryClient());
    });
  });

  describe("setQueryData", () => {
    it("setQueryData를 dispatch하며 queryKey와 updater를 그대로 전달한다", () => {
      const setSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
      const factory = createQueryClient<TestPaths>();
      const updater = (prev: { id: number; title: string } | undefined) => prev;

      factory.setQueryData({
        path: "/posts/{postId}",
        params: { postId: 1 },
        updater,
      });

      expect(setSpy).toHaveBeenCalledTimes(1);
      expect(setSpy.mock.calls[0]?.[0]).toEqual(["/posts/{postId}", { postId: 1 }]);
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
});
