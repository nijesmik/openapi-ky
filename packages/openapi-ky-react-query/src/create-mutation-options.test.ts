import { describe, expect, it } from "vitest";

import { createMutationOptions } from "./create-mutation-options";
import { createFakeClient, getMock } from "./__fixtures__/fake-client";

type TestPaths = {
  "/posts": {
    post: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 201: { content: { "application/json": { id: number } } } };
    };
  };
  "/posts/{postId}": {
    get: {
      responses: { 200: { content: { "application/json": { id: number } } } };
    };
    put: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": { id: number } } } };
    };
    patch: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": { id: number } } } };
    };
    delete: {
      responses: { 204: { content: never } };
    };
  };
};

const createFakeApi = () => createFakeClient<TestPaths, "request">("request", { id: 1 });

describe("createMutationOptions", () => {
  describe("callable", () => {
    it("method를 명시한 호출이 mutationFn에서 api.request로 dispatch된다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({ method: "post", path: "/posts" });
      const variables = { json: { title: "Hello" } };
      await opts.mutationFn?.(variables, {} as never);

      expect(getMock(api, "request")).toHaveBeenCalledWith("post", "/posts", variables);
    });

    it("[회귀 테스트] mutationFn은 .json()으로 파싱된 본문을 반환한다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({ method: "post", path: "/posts" });

      await expect(
        opts.mutationFn?.({ json: { title: "Hello" } }, {} as never),
      ).resolves.toEqual({ id: 1 });
    });
  });

  describe("HTTP method 단축 메서드", () => {
    it.each([
      ["post", "/posts"],
      ["put", "/posts/{postId}"],
      ["patch", "/posts/{postId}"],
      ["delete", "/posts/{postId}"],
    ] as const)("%s 단축 메서드는 method='%s'로 api.request를 호출한다", async (method, path) => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const opts = (mutationOptions[method] as any)({ path });
      const variables = { json: { title: "x" } };
      await opts.mutationFn?.(variables, {} as never);

      expect(getMock(api, "request")).toHaveBeenCalledWith(method, path, variables);
    });

    it("[회귀 테스트] 각 단축 메서드는 서로 다른 method를 캡처한다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      await mutationOptions.post({ path: "/posts" }).mutationFn?.(
        { json: { title: "p" } },
        {} as never,
      );
      await mutationOptions.put({ path: "/posts/{postId}" }).mutationFn?.(
        { params: { postId: 1 }, json: { title: "u" } },
        {} as never,
      );
      await mutationOptions.patch({ path: "/posts/{postId}" }).mutationFn?.(
        { params: { postId: 1 }, json: { title: "a" } },
        {} as never,
      );
      await mutationOptions.delete({ path: "/posts/{postId}" }).mutationFn?.(
        { params: { postId: 1 } },
        {} as never,
      );

      const methods = getMock(api, "request").mock.calls.map((call) => call[0]);
      expect(methods).toEqual(["post", "put", "patch", "delete"]);
    });
  });

  describe("타입 시그니처 (compile-time)", () => {
    it("post 단축 메서드는 POST가 정의된 path만 받는다", () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      mutationOptions.post({ path: "/posts" });

      // @ts-expect-error — '/posts/{postId}'에는 POST가 없음
      mutationOptions.post({ path: "/posts/{postId}" });
    });

    it("delete 단축 메서드는 DELETE가 정의된 path만 받는다", () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      mutationOptions.delete({ path: "/posts/{postId}" });

      // @ts-expect-error — '/posts'에는 DELETE가 없음
      mutationOptions.delete({ path: "/posts" });
    });

    it("단축 메서드의 인자에는 method 필드를 직접 넘길 수 없다", () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      // @ts-expect-error — Omit<..., "method">로 method가 제거됨
      mutationOptions.post({ path: "/posts", method: "post" });
    });
  });
});
