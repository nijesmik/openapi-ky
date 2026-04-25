import { skipToken } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { createQueryOptions } from "./create-query-options";
import { createFakeClient, getMock } from "./__fixtures__/fake-client";

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
  createFakeClient<TestPaths, "get">("get", { id: 1, title: "test" });

describe("createQueryOptions", () => {
  describe("callable / structure", () => {
    it("리턴값은 호출 가능하고 .suspense / .infinite 메서드를 노출한다", () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      expect(typeof queryOptions).toBe("function");
      expect(typeof queryOptions.suspense).toBe("function");
      expect(typeof queryOptions.infinite).toBe("function");
    });

    it("기본 호출은 path 기반 queryKey와 함수형 queryFn을 가진 옵션 객체를 반환한다", () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({ path: "/posts" });

      expect(opts.queryKey).toEqual(["/posts"]);
      expect(typeof opts.queryFn).toBe("function");
    });
  });

  describe("params: null → skipToken", () => {
    it("params: null이면 queryFn이 skipToken이다", () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({ path: "/posts/{postId}", params: null });

      expect(opts.queryFn).toBe(skipToken);
    });

    it("params: null이면 queryKey는 path만으로 빌드된다 (params/searchParams 미포함)", () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({ path: "/posts/{postId}", params: null });

      expect(opts.queryKey).toEqual(["/posts/{postId}"]);
    });

    it("params가 정상 값이면 queryFn이 api.get을 호출한다", async () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions({
        path: "/posts/{postId}",
        params: { postId: 1 },
      });

      const queryFn = opts.queryFn;
      if (typeof queryFn !== "function") throw new Error("expected function queryFn");
      await queryFn({} as never);

      expect(getMock(api, "get")).toHaveBeenCalledWith("/posts/{postId}", {
        params: { postId: 1 },
        searchParams: undefined,
      });
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

      expect(getMock(api, "get")).toHaveBeenCalledWith("/posts", {
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

      expect(getMock(api, "get")).toHaveBeenCalledWith("/posts", {
        params: undefined,
        searchParams: { size: 10, page: 2 },
      });
    });

    it("기존 searchParams의 pageParamKey 값을 pageParam이 덮어쓴다 (queryFn에서만 적용, queryKey는 원본 유지)", async () => {
      const api = createFakeApi();
      const queryOptions = createQueryOptions(api);

      const opts = queryOptions.infinite({
        path: "/posts",
        searchParams: { cursor: "stale", size: 10 },
        initialPageParam: undefined,
        getNextPageParam: () => undefined,
      });

      // queryKey는 호출 시점의 원본 searchParams로 빌드 — pageParam 덮어쓰기는 queryFn 안에서만 발생
      expect(opts.queryKey).toEqual(["/posts", "cursor=stale&size=10"]);

      await opts.queryFn?.({ pageParam: "fresh" } as never);

      expect(getMock(api, "get")).toHaveBeenCalledWith("/posts", {
        params: undefined,
        searchParams: { cursor: "fresh", size: 10 },
      });
    });
  });
});
