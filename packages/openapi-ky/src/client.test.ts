import { describe, expect, it, vi } from "vitest";

import type { Options } from "./types/options";

import createClient from "./client";

type Post = { id: number; title: string };

type TestPaths = {
  "/posts": {
    get: {
      responses: { 200: { content: { "application/json": Post[] } } };
    };
    post: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 201: { content: { "application/json": Post } } };
    };
  };
  "/posts/{postId}": {
    parameters: { path: { postId: number } };
    put: {
      parameters: { path: { postId: number } };
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": Post } } };
    };
    patch: {
      parameters: { path: { postId: number } };
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": Post } } };
    };
    delete: {
      parameters: { path: { postId: number } };
      responses: { 204: { content: { "application/json": never } } };
    };
  };
};

const createTestClient = (fetchImpl: typeof fetch) =>
  createClient<TestPaths>({
    baseUrl: "https://api.test/",
    fetch: fetchImpl,
    retry: 0,
  });

describe("Client", () => {
  describe("HTTP 메서드 dispatch", () => {
    it.each([
      ["get", "GET", (c: ReturnType<typeof createTestClient>) => c.get("/posts")],
      [
        "post",
        "POST",
        (c: ReturnType<typeof createTestClient>) => c.post("/posts", { json: { title: "new" } }),
      ],
      [
        "put",
        "PUT",
        (c: ReturnType<typeof createTestClient>) =>
          c.put("/posts/{postId}", { params: { postId: 1 }, json: { title: "updated" } }),
      ],
      [
        "patch",
        "PATCH",
        (c: ReturnType<typeof createTestClient>) =>
          c.patch("/posts/{postId}", { params: { postId: 1 }, json: { title: "patched" } }),
      ],
      [
        "delete",
        "DELETE",
        (c: ReturnType<typeof createTestClient>) =>
          c.delete("/posts/{postId}", { params: { postId: 1 } }),
      ],
    ] as const)(
      "3. [회귀 테스트] %s 메서드는 %s 요청으로 dispatch된다",
      async (_verb, httpMethod, call) => {
        const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
        const client = createTestClient(fetchImpl);

        await call(client);

        expect((fetchImpl.mock.calls[0]![0] as Request).method).toBe(httpMethod);
      },
    );
  });

  describe("URL 경로 치환", () => {
    it("4. params는 path template을 치환한 URL로 fetch된다", async () => {
      const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
      const client = createTestClient(fetchImpl);

      await client.delete("/posts/{postId}", { params: { postId: 1 } });

      const url = (fetchImpl.mock.calls[0]![0] as Request).url;
      expect(url).toContain("/posts/1");
      expect(url).not.toContain("{postId}");
    });
  });

  describe("callable 본체 dispatch", () => {
    it("5. callable 본체로 호출하면 옵션의 method가 ky로 전달된다", async () => {
      const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 201 }));
      const client = createTestClient(fetchImpl);

      await client("/posts", { method: "post", json: { title: "x" } });

      expect((fetchImpl.mock.calls[0]![0] as Request).method).toBe("POST");
    });
  });

  describe("인스턴스 method default", () => {
    it("6. [회귀 테스트] 단축 메서드는 defaultOptions.method를 override한다", async () => {
      const fetchImpl = vi.fn<typeof fetch>(
        async () =>
          new Response("[]", {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      );
      const client = createClient<TestPaths, "post">({
        baseUrl: "https://api.test/",
        fetch: fetchImpl,
        retry: 0,
        method: "post",
      });

      await client.get("/posts");

      expect((fetchImpl.mock.calls[0]![0] as Request).method).toBe("GET");
    });
  });

  describe("타입 추론 (compile-time)", () => {
    it("path-param 키가 schema와 다르면 컴파일 에러", () => {
      const _wrong: Options<TestPaths, "/posts/{postId}", "put"> = {
        // @ts-expect-error '/posts/{postId}'.put expects { postId: number }, not { wrongKey: number }
        params: { wrongKey: 1 },
        json: { title: "x" },
        method: "put",
      };
      void _wrong;
    });
  });
});
