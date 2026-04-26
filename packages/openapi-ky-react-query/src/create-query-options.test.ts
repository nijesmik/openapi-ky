import { skipToken } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { createQueryOptions } from "./create-query-options";
import { createFakeCallableClient, getCallableMock } from "./__fixtures__/fake-client";

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

const createFakeApi = () =>
  createFakeCallableClient<TestPaths>({ id: 1, title: "test" });

describe("createQueryOptions", () => {
  describe("callable / structure", () => {
    it("리턴값은 호출 가능하고 .suspense / .infinite 메서드를 노출한다", () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      expect(typeof queryOptions).toBe("function");
      expect(typeof queryOptions.suspense).toBe("function");
      expect(typeof queryOptions.infinite).toBe("function");
    });

  });

  describe("params: null → skipToken", () => {
    it("params: null이면 queryFn이 skipToken이다", () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({ path: "/posts/{postId}", params: null });

      expect(opts.queryFn).toBe(skipToken);
    });

    it.each([
      ["없을 때", { path: "/posts" }, "/posts", undefined],
      [
        "있을 때",
        { path: "/posts/{postId}", params: { postId: 1 } },
        "/posts/{postId}",
        { postId: 1 },
      ],
    ] as const)(
      "params가 %s queryFn이 api를 호출한다",
      async (_label, input, expectedPath, expectedParams) => {
        const api = createFakeApi();
        const queryOptions = createQueryOptions(api);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const opts = queryOptions(input as any);

        const queryFn = opts.queryFn;
        if (typeof queryFn !== "function") throw new Error("expected function queryFn");
        await queryFn({} as never);

        expect(getCallableMock(api)).toHaveBeenCalledWith(expectedPath, {
          method: undefined,
          params: expectedParams,
          searchParams: undefined,
        });
      },
    );

    it("[회귀 테스트] queryFn은 .json()으로 파싱된 본문을 반환한다", async () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({
        path: "/posts/{postId}",
        params: { postId: 1 },
      });

      const queryFn = opts.queryFn;
      if (typeof queryFn !== "function") throw new Error("expected function queryFn");
      await expect(queryFn({} as never)).resolves.toEqual({ id: 1, title: "test" });
    });
  });

  describe("infinite query — pageParam spread", () => {
    it("기본 pageParamKey('cursor')로 pageParam을 searchParams에 주입한다", async () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions.infinite({
        path: "/posts",
        searchParams: { size: 10 },
        initialPageParam: undefined,
        getNextPageParam: () => undefined,
      });

      await opts.queryFn?.({ pageParam: "abc" } as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith("/posts", {
        method: undefined,
        params: undefined,
        searchParams: { size: 10, cursor: "abc" },
      });
    });

    it("커스텀 pageParamKey를 사용해 pageParam을 searchParams에 주입한다", async () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions.infinite({
        path: "/posts",
        searchParams: { size: 10 },
        pageParamKey: "page",
        initialPageParam: 0 as number,
        getNextPageParam: () => undefined,
      });

      await opts.queryFn?.({ pageParam: 2 } as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith("/posts", {
        method: undefined,
        params: undefined,
        searchParams: { size: 10, page: 2 },
      });
    });

    it("기존 searchParams의 pageParamKey 값을 pageParam이 덮어쓴다", async () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions.infinite({
        path: "/posts",
        searchParams: { cursor: "stale", size: 10 },
        initialPageParam: undefined,
        getNextPageParam: () => undefined,
      });

      await opts.queryFn?.({ pageParam: "fresh" } as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith("/posts", {
        method: undefined,
        params: undefined,
        searchParams: { cursor: "fresh", size: 10 },
      });
    });
  });

  describe("비-GET method 지원", () => {
    it("method: 'post'를 명시하면 callable 본체로 dispatch된다", async () => {
      type PostPaths = {
        "/search": {
          post: {
            requestBody: { content: { "application/json": { criteria: string } } };
            responses: { 200: { content: { "application/json": { items: number[] } } } };
          };
        };
      };
      const api = createFakeCallableClient<PostPaths>({ items: [1, 2] });
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({
        method: "post",
        path: "/search",
        json: { criteria: "ts" },
      });

      // queryFn 실행 → callable 본체 호출 형태 검증
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (opts.queryFn as any)?.({} as never);

      const callArgs = getCallableMock(api).mock.calls[0];
      expect(callArgs?.[0]).toBe("/search");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs?.[1] as any)?.method).toBe("post");
    });

    it("method: 'post' query의 queryKey는 [path, 'post']로 생성된다", () => {
      type PostPaths = {
        "/search": {
          post: {
            requestBody: { content: { "application/json": { criteria: string } } };
            responses: { 200: { content: { "application/json": { items: number[] } } } };
          };
        };
      };
      const api = createFakeCallableClient<PostPaths>({ items: [] });
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({
        method: "post",
        path: "/search",
        json: { criteria: "x" },
      });

      expect(opts.queryKey).toEqual(["/search", "post"]);
    });

    it("method 미지정 시 queryKey는 method 미포함 (기존 GET 동작 보존)", () => {
      const api = createFakeCallableClient<TestPaths>([]);
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({ path: "/posts" });

      expect(opts.queryKey).toEqual(["/posts"]);
    });
  });
});
