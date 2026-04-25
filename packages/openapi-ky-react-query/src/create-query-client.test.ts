import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

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

  describe("setQueryData", () => {
    it("주어진 queryKey와 updater 값을 QueryClient.setQueryData로 dispatch한다", () => {
      const setSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
      const factory = createQueryClient<TestPaths>();
      const data = [{ id: 1, title: "a" }];

      factory.setQueryData({ path: "/posts", updater: data });

      expect(setSpy).toHaveBeenCalledWith(["/posts"], data);
    });

    it("updater 함수를 그대로 QueryClient.setQueryData에 전달한다", () => {
      const setSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
      const factory = createQueryClient<TestPaths>();
      const updater = (prev: { id: number; title: string } | undefined) => prev;

      factory.setQueryData({
        path: "/posts/{postId}",
        params: { postId: 1 },
        updater,
      });

      expect(setSpy).toHaveBeenCalledWith(["/posts/{postId}", { postId: 1 }], updater);
    });

    it("params/searchParams를 포함한 queryKey를 빌드해 dispatch한다", () => {
      const setSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
      const factory = createQueryClient<TestPaths>();

      factory.setQueryData({
        path: "/posts/{postId}",
        params: { postId: 1 },
        searchParams: { include: "comments" },
        updater: { id: 1, title: "x" },
      });

      expect(setSpy).toHaveBeenCalledWith(
        ["/posts/{postId}", { postId: 1 }, "include=comments"],
        { id: 1, title: "x" },
      );
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
});
