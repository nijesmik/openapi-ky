import { describe, expect, it } from "vitest";

import { createFakeCallableClient, getCallableMock } from "@/__fixtures__/fake-client";

import { createMutationOptions } from "./index";

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

      expect(getCallableMock(api)).toHaveBeenCalledWith("/posts/{postId}", {
        method: "put",
        params: { postId: 1 },
        searchParams: undefined,
        json: { title: "Hello" },
      });
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

      expect(getCallableMock(api)).toHaveBeenCalledWith("/posts", {
        method: "post",
        params: undefined,
        searchParams: { lang: "ko" },
        json: { title: "Hello" },
      });
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

  describe("HTTP method 단축 메서드", () => {
    it.each([
      ["post", "/posts"],
      ["put", "/posts/{postId}"],
      ["patch", "/posts/{postId}"],
    ] as const)(
      "%s 단축 메서드는 method='%s'로 client callable을 호출한다",
      async (method, path) => {
        const api = createFakeApi();
        const mutationOptions = createMutationOptions(api);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const opts = (mutationOptions[method] as any)({ path });
        const body = { title: "x" };
        await opts.mutationFn?.({ json: body }, {} as never);

        expect(getCallableMock(api)).toHaveBeenCalledWith(path, {
          method,
          json: body,
        });
      },
    );

    it("[회귀 테스트] 각 단축 메서드는 서로 다른 method를 캡처한다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      await mutationOptions
        .post({ path: "/posts" })
        .mutationFn?.({ json: { title: "p" } }, {} as never);
      await mutationOptions
        .put({ path: "/posts/{postId}" })
        .mutationFn?.({ json: { title: "u" } }, {} as never);
      await mutationOptions
        .patch({ path: "/posts/{postId}" })
        .mutationFn?.({ json: { title: "a" } }, {} as never);
      await mutationOptions.delete({ path: "/posts/{postId}" }).mutationFn?.({}, {} as never);

      const methods = getCallableMock(api).mock.calls.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (call) => (call[1] as any).method,
      );
      expect(methods).toEqual(["post", "put", "patch", "delete"]);
    });

    it("단축 메서드도 params 지정 시 static 모드로 동작한다", async () => {
      const api = createFakeApi();
      const mutationOptions = createMutationOptions(api);

      const opts = mutationOptions.put({
        path: "/posts/{postId}",
        params: { postId: 1 },
      });
      await opts.mutationFn?.({ title: "Hello" }, {} as never);

      expect(getCallableMock(api)).toHaveBeenCalledWith("/posts/{postId}", {
        method: "put",
        params: { postId: 1 },
        searchParams: undefined,
        json: { title: "Hello" },
      });
    });
  });

  describe("타입 추론 (compile-time)", () => {
    describe("HTTP method별 path 필터링", () => {
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
    });

    describe("static 모드: Variables = RequestBody (body 직접)", () => {
      it("params 지정 시 mutationFn 인자는 body 그대로이며 ky options 래핑은 거부된다", () => {
        const api = createFakeApi();
        const mutationOptions = createMutationOptions(api);

        const opts = mutationOptions({
          method: "put",
          path: "/posts/{postId}",
          params: { postId: 1 },
        });

        opts.mutationFn?.({ title: "x" }, {} as never);

        // @ts-expect-error — static 모드에서는 { json: ... }로 래핑할 수 없음
        opts.mutationFn?.({ json: { title: "x" } }, {} as never);

        // @ts-expect-error — static 모드 Variables는 RequestBody이므로 ky options 키 거부
        opts.mutationFn?.({ params: { postId: 1 } }, {} as never);
      });

      it("searchParams만 지정해도 Variables는 body 그대로다", () => {
        const api = createFakeApi();
        const mutationOptions = createMutationOptions(api);

        const opts = mutationOptions({
          method: "post",
          path: "/posts",
          searchParams: { lang: "ko" },
        });

        opts.mutationFn?.({ title: "x" }, {} as never);

        // @ts-expect-error — static 모드에서는 { json: ... }로 래핑할 수 없음
        opts.mutationFn?.({ json: { title: "x" } }, {} as never);
      });

      it("단축 메서드도 params 지정 시 static 추론된다", () => {
        const api = createFakeApi();
        const mutationOptions = createMutationOptions(api);

        const opts = mutationOptions.put({
          path: "/posts/{postId}",
          params: { postId: 1 },
        });

        opts.mutationFn?.({ title: "x" }, {} as never);

        // @ts-expect-error — static 모드에서는 { json: ... } 래핑 불가
        opts.mutationFn?.({ json: { title: "x" } }, {} as never);
      });
    });

    describe("dynamic 모드: Variables = Omit<Options, 'method'> (ky options 형태)", () => {
      it("params/searchParams 미지정 시 mutationFn 인자는 ky options 형태이며 body 직접 전달은 거부된다", () => {
        const api = createFakeApi();
        const mutationOptions = createMutationOptions(api);

        const opts = mutationOptions({ method: "post", path: "/posts" });

        opts.mutationFn?.({ json: { title: "x" } }, {} as never);
        opts.mutationFn?.({ json: { title: "x" }, searchParams: { lang: "ko" } }, {} as never);

        // @ts-expect-error — dynamic 모드에서는 body를 { json: ... }로 래핑해야 함
        opts.mutationFn?.({ title: "x" }, {} as never);
      });

      it("단축 메서드도 params/searchParams 미지정 시 dynamic 추론된다", () => {
        const api = createFakeApi();
        const mutationOptions = createMutationOptions(api);

        const opts = mutationOptions.put({ path: "/posts/{postId}" });

        opts.mutationFn?.({ json: { title: "x" }, params: { postId: 1 } }, {} as never);

        // @ts-expect-error — dynamic 모드는 { json: ... } 래핑 필수
        opts.mutationFn?.({ title: "x" }, {} as never);
      });
    });
  });
});
