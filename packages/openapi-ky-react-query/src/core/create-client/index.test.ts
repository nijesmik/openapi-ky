import { skipToken } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { createFakeCallableClient, getCallableMock } from "@/__fixtures__/fake-client";

import { createClient } from "./index";
import { useInfiniteQuery } from "./use-infinite-query";
import { useQuery } from "./use-query";
import { useSuspenseQuery } from "./use-suspense-query";

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

const createFakeClient = () => createFakeCallableClient<TestPaths>({ id: 1, title: "test" });

describe("createClient", () => {
  describe("params: null → skipToken", () => {
    it("params: null이면 queryFn이 skipToken이다", () => {
      const client = createFakeClient();
      const api = createClient(client);

      const opts = api.queryOptions({ path: "/posts/{postId}", params: null });

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
        const client = createFakeClient();
        const api = createClient(client);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const opts = api.queryOptions(input as any);

        const queryFn = opts.queryFn;
        if (typeof queryFn !== "function") {
          throw new Error("expected function queryFn");
        }
        await queryFn({} as never);

        expect(getCallableMock(client)).toHaveBeenCalledWith(expectedPath, {
          method: "get",
          params: expectedParams,
          searchParams: undefined,
        });
      },
    );

    it("[회귀 테스트] queryFn은 .json()으로 파싱된 본문을 반환한다", async () => {
      const client = createFakeClient();
      const api = createClient(client);

      const opts = api.queryOptions({
        path: "/posts/{postId}",
        params: { postId: 1 },
      });

      const queryFn = opts.queryFn;
      if (typeof queryFn !== "function") {
        throw new Error("expected function queryFn");
      }
      await expect(queryFn({} as never)).resolves.toEqual({ id: 1, title: "test" });
    });
  });

  describe("suspenseQueryOptions", () => {
    it("queryFn은 .json()으로 파싱된 본문을 반환한다", async () => {
      const client = createFakeClient();
      const api = createClient(client);

      const opts = api.suspenseQueryOptions({
        path: "/posts/{postId}",
        params: { postId: 1 },
      });

      const queryFn = opts.queryFn;
      if (typeof queryFn !== "function") {
        throw new Error("expected function queryFn");
      }
      await expect(queryFn({} as never)).resolves.toEqual({ id: 1, title: "test" });
    });
  });

  describe("infiniteQueryOptions — pageParam spread", () => {
    it("기본 pageParamKey('cursor')로 pageParam을 searchParams에 주입한다", async () => {
      const client = createFakeClient();
      const api = createClient(client);

      const opts = api.infiniteQueryOptions({
        path: "/posts",
        searchParams: { size: 10 },
        initialPageParam: undefined,
        getNextPageParam: () => undefined,
      });

      await opts.queryFn?.({ pageParam: "abc" } as never);

      expect(getCallableMock(client)).toHaveBeenCalledWith("/posts", {
        method: "get",
        params: undefined,
        searchParams: { size: 10, cursor: "abc" },
      });
    });

    it("커스텀 pageParamKey를 사용해 pageParam을 searchParams에 주입한다", async () => {
      const client = createFakeClient();
      const api = createClient(client);

      const opts = api.infiniteQueryOptions({
        path: "/posts",
        searchParams: { size: 10 },
        pageParamKey: "page",
        initialPageParam: 0 as number,
        getNextPageParam: () => undefined,
      });

      await opts.queryFn?.({ pageParam: 2 } as never);

      expect(getCallableMock(client)).toHaveBeenCalledWith("/posts", {
        method: "get",
        params: undefined,
        searchParams: { size: 10, page: 2 },
      });
    });

    it("기존 searchParams의 pageParamKey 값을 pageParam이 덮어쓴다", async () => {
      const client = createFakeClient();
      const api = createClient(client);

      const opts = api.infiniteQueryOptions({
        path: "/posts",
        searchParams: { cursor: "stale", size: 10 },
        initialPageParam: undefined,
        getNextPageParam: () => undefined,
      });

      await opts.queryFn?.({ pageParam: "fresh" } as never);

      expect(getCallableMock(client)).toHaveBeenCalledWith("/posts", {
        method: "get",
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
      const client = createFakeCallableClient<PostPaths>({ items: [1, 2] });
      const api = createClient(client);

      const opts = api.queryOptions({
        method: "post",
        path: "/search",
        json: { criteria: "ts" },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (opts.queryFn as any)?.({} as never);

      const callArgs = getCallableMock(client).mock.calls[0];
      expect(callArgs?.[0]).toBe("/search");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs?.[1] as any)?.method).toBe("post");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs?.[1] as any)?.json).toEqual({ criteria: "ts" });
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
      const client = createFakeCallableClient<PostPaths>({ items: [] });
      const api = createClient(client);

      const opts = api.queryOptions({
        method: "post",
        path: "/search",
        json: { criteria: "x" },
      });

      expect(opts.queryKey).toEqual(["/search", "post"]);
    });

    it("method 미지정 시 queryKey는 method 미포함 (기존 GET 동작 보존)", () => {
      const client = createFakeCallableClient<TestPaths>([]);
      const api = createClient(client);

      const opts = api.queryOptions({ path: "/posts" });

      expect(opts.queryKey).toEqual(["/posts"]);
    });
  });

  describe("타입 추론 (compile-time)", () => {
    it("path-param 키가 schema와 다르면 컴파일 에러", () => {
      type _Paths = {
        "/posts/{postId}": {
          parameters: { path: { postId: number } };
          get: {
            parameters: { path: { postId: number } };
            responses: { 200: { content: { "application/json": [] } } };
          };
        };
      };

      const client = createFakeCallableClient<_Paths>([]);
      const api = createClient(client);

      api.queryOptions({
        path: "/posts/{postId}",
        // @ts-expect-error '/posts/{postId}'.get expects { postId: number }, not { wrongKey: number }
        params: { wrongKey: 1 },
      });
    });

    it("[회귀 테스트] explicit TMethod generic 바인딩 + method 값 누락은 컴파일 에러", () => {
      type _Paths = {
        "/search": {
          post: {
            requestBody: { content: { "application/json": { criteria: string } } };
            responses: { 200: { content: { "application/json": { items: number[] } } } };
          };
        };
      };

      const client = createFakeCallableClient<_Paths>({ items: [] });
      const api = createClient(client);

      // @ts-expect-error TMethod='post'를 explicit하게 바인딩했으면 method 값이 필수
      api.queryOptions<"/search", "post">({
        path: "/search",
        json: { criteria: "x" },
      });
    });

    it("hook factory는 잘못 짝지어진 builder를 거부한다", () => {
      const client = createFakeCallableClient<TestPaths>([]);
      const api = createClient(client);

      // @ts-expect-error suspense builder는 useQuery factory가 거부 (QueryOptions에 없는 필드)
      useQuery(api.suspenseQueryOptions);
      // @ts-expect-error infinite builder는 useQuery factory가 거부
      useQuery(api.infiniteQueryOptions);
      // @ts-expect-error query builder는 useSuspenseQuery factory가 거부 (params: null 허용)
      useSuspenseQuery(api.queryOptions);
      // @ts-expect-error query builder는 useInfiniteQuery factory가 거부
      useInfiniteQuery(api.queryOptions);
    });
  });
});
