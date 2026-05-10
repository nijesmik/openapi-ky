import { describe, expect, it } from "vitest";

import { createFakeCallableClient, getCallableMock } from "@/__fixtures__/fake-client";

import { createMutationOptions } from "./create-mutation-options";

type TestPaths = {
  "/posts": {
    post: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 201: { content: { "application/json": { id: number } } } };
    };
  };
  "/posts/{postId}": {
    parameters: { path: { postId: number } };
    get: {
      parameters: { path: { postId: number } };
      responses: { 200: { content: { "application/json": { id: number } } } };
    };
    put: {
      parameters: { path: { postId: number } };
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": { id: number } } } };
    };
    patch: {
      parameters: { path: { postId: number } };
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": { id: number } } } };
    };
    delete: {
      parameters: { path: { postId: number } };
      responses: { 204: { content: never } };
    };
  };
};

const createFakeApi = () => createFakeCallableClient<TestPaths>({ id: 1 });

describe("createMutationOptions", () => {
  describe("dynamic 모드 (create 시 params/searchParams 미지정)", () => {
    it("mutationFn 인자(ky options)를 api 호출에 spread한다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({ method: "post", path: "/posts" });
      const body = { title: "Hello" };
      await opts.mutationFn?.({ json: body }, {} as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith("/posts", {
        method: "post",
        json: body,
      });
    });

    it("[회귀 테스트] mutationFn은 .json()으로 파싱된 본문을 반환한다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({ method: "post", path: "/posts" });

      await expect(opts.mutationFn?.({ json: { title: "Hello" } }, {} as never)).resolves.toEqual({
        id: 1,
      });
    });

    it("kyOptions가 api 호출에 함께 전달된다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({
        method: "post",
        path: "/posts",
        kyOptions: { timeout: 5000 },
      });
      await opts.mutationFn?.({ json: { title: "x" } }, {} as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({ timeout: 5000 }),
      );
    });

    it("[회귀 테스트] kyOptions로 우회 주입된 method/json은 explicit 필드를 override할 수 없다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({
        method: "post",
        path: "/posts",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        kyOptions: { method: "delete", json: { malicious: true } } as any,
      });
      await opts.mutationFn?.({ json: { title: "real" } }, {} as never);

      const callArgs = getCallableMock(api).mock.calls[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs?.[1] as any).method).toBe("post");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs?.[1] as any).json).toEqual({ title: "real" });
    });
  });

  describe("static 모드 (create 시 params 또는 searchParams 지정)", () => {
    it("params 지정 시: mutationFn은 body를 직접 받고 create의 params가 api에 합쳐진다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({
        method: "put",
        path: "/posts/{postId}",
        params: { postId: 1 },
      });
      await opts.mutationFn?.({ title: "Hello" }, {} as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith(
        "/posts/{postId}",
        expect.objectContaining({
          method: "put",
          params: { postId: 1 },
          json: { title: "Hello" },
        }),
      );
    });

    it("searchParams만 지정 시에도 static 모드로 라우팅되어 body를 직접 받는다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({
        method: "post",
        path: "/posts",
        searchParams: { lang: "ko" },
      });
      await opts.mutationFn?.({ title: "Hello" }, {} as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith(
        "/posts",
        expect.objectContaining({
          method: "post",
          searchParams: { lang: "ko" },
          json: { title: "Hello" },
        }),
      );
    });

    it("[회귀 테스트] mutate-time params가 create-time params를 override한다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({
        method: "put",
        path: "/posts/{postId}",
        params: { postId: 1 },
      });
      await opts.mutationFn?.({ json: { title: "Hello" }, params: { postId: 99 } }, {} as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith(
        "/posts/{postId}",
        expect.objectContaining({
          method: "put",
          params: { postId: 99 },
          json: { title: "Hello" },
        }),
      );
    });

    it("kyOptions가 params/searchParams와 함께 api 호출에 전달된다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({
        method: "put",
        path: "/posts/{postId}",
        params: { postId: 1 },
        kyOptions: { timeout: 5000 },
      });
      await opts.mutationFn?.({ title: "x" }, {} as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith(
        "/posts/{postId}",
        expect.objectContaining({ timeout: 5000, params: { postId: 1 } }),
      );
    });

    it("[회귀 테스트] kyOptions로 우회 주입된 method/json은 explicit 필드를 override할 수 없다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions({
        method: "put",
        path: "/posts/{postId}",
        params: { postId: 1 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        kyOptions: { method: "delete", json: { malicious: true } } as any,
      });
      await opts.mutationFn?.({ title: "real" }, {} as never);

      const callArgs = getCallableMock(api).mock.calls[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs?.[1] as any).method).toBe("put");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs?.[1] as any).json).toEqual({ title: "real" });
    });
  });

  describe("타입 추론 (compile-time)", () => {
    describe("variables 양쪽 형태 모두 수용", () => {
      it("body 형태와 options 형태가 모두 mutationFn 인자로 허용된다", () => {
        const api = createFakeApi();
        const mutationOptions = createMutationOptions(api);

        const opts = mutationOptions({
          method: "put",
          path: "/posts/{postId}",
          params: { postId: 1 },
        });

        // body 형태 (variables IS body, create-time params 사용)
        opts.mutationFn?.({ title: "x" }, {} as never);

        // options 형태 (mutate-time에 모든 ky options 명시 가능, params override)
        opts.mutationFn?.({ json: { title: "x" } }, {} as never);
        opts.mutationFn?.({ json: { title: "x" }, params: { postId: 2 } }, {} as never);
      });
    });

    it("[회귀 테스트] path requires params + create-time 미바인딩 시 mutate에 params 강제", () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      // create-time에 params 없음, path는 {postId} 필요
      const opts = mutationOptions({ method: "put", path: "/posts/{postId}" });

      // params 명시한 options form은 OK
      opts.mutationFn?.({ json: { title: "x" }, params: { postId: 1 } }, {} as never);

      // @ts-expect-error — body form 거부 (params 공급 경로 없음)
      opts.mutationFn?.({ title: "x" }, {} as never);

      // @ts-expect-error — options form이라도 params 누락 시 거부
      opts.mutationFn?.({ json: { title: "x" } }, {} as never);
    });

    it("path-param 키가 schema와 다르면 컴파일 에러", () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      // @ts-expect-error '/posts/{postId}'.put expects { postId: number }, not { wrongKey: number }
      mutationOptions({
        method: "put",
        path: "/posts/{postId}",
        params: { wrongKey: 1 },
      });
    });
  });
});
