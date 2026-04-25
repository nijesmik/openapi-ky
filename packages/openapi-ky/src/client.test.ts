import { describe, expect, it, vi } from "vitest";

import { createClient } from "./client";

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
    put: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": Post } } };
    };
    patch: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 200: { content: { "application/json": Post } } };
    };
    delete: {
      responses: { 204: { content: { "application/json": never } } };
    };
  };
};

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });

const createTestClient = (fetchImpl: typeof fetch) =>
  createClient<TestPaths>({
    prefixUrl: "https://api.test/",
    fetch: fetchImpl,
    retry: 0,
  });

describe("Client", () => {
  describe("response.json override", () => {
    it("1. [회귀 테스트] 본문이 있을 때 override가 response.clone()을 거쳐 bind된 parseJson에 위임한다", async () => {
      const fetchImpl = vi.fn(async () => jsonResponse([{ id: 1, title: "hi" }]));
      const client = createTestClient(fetchImpl);

      const response = await client.get("/posts");
      const cloneSpy = vi.spyOn(response!, "clone");
      const data = await response!.json();

      expect(cloneSpy).toHaveBeenCalled();
      expect(data).toEqual([{ id: 1, title: "hi" }]);
    });

    it("2. 본문이 비어있으면 빈 문자열을 반환한다", async () => {
      const fetchImpl = vi.fn(async () => new Response("", { status: 200 }));
      const client = createTestClient(fetchImpl);

      const response = await client.get("/posts");
      const data = await response!.json();

      expect(data).toBe("");
    });
  });

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

  describe("callable 본체 dispatch", () => {
    it("5. callable 본체로 호출하면 method가 옵션에서 풀려 ky로 전달된다", async () => {
      const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 201 }));
      const client = createTestClient(fetchImpl);

      await client("/posts", { method: "post", json: { title: "x" } });

      expect((fetchImpl.mock.calls[0]![0] as Request).method).toBe("POST");
    });
  });

  describe("실패 처리", () => {
    it("4. [회귀 테스트] 호출자가 catch한 요청 실패가 unhandledRejection을 발동시키지 않는다", async () => {
      const fetchImpl = vi.fn(async () => {
        throw new TypeError("network down");
      });
      const client = createTestClient(fetchImpl);
      const unhandled = vi.fn();
      process.on("unhandledRejection", unhandled);

      try {
        await expect(client.get("/posts")).rejects.toThrow("network down");
        // 모든 microtask가 끝나도록 한 틱 더 기다림 — derived promise의 rejection은
        // 다음 microtask에 흐를 수 있음
        await new Promise((resolve) => setImmediate(resolve));

        expect(unhandled).not.toHaveBeenCalled();
      } finally {
        process.off("unhandledRejection", unhandled);
      }
    });
  });
});
