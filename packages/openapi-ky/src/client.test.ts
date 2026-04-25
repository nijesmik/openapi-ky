import ky from "ky";
import { describe, expect, it, vi } from "vitest";

import { createClient } from "./client";

type TestPaths = {
  "/posts": {
    get: {
      responses: {
        200: { content: { "application/json": { id: number; title: string }[] } };
      };
    };
    post: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: {
        201: { content: { "application/json": { id: number } } };
      };
    };
  };
  "/posts/{postId}": {
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
  describe(".json() 체이닝", () => {
    it("ResponsePromise를 반환해 .json()을 직접 체이닝할 수 있다", async () => {
      const fetchImpl = vi.fn(async () => jsonResponse([{ id: 1, title: "hi" }]));
      const client = createTestClient(fetchImpl);

      const data = await client.get("/posts").json();

      expect(data).toEqual([{ id: 1, title: "hi" }]);
    });

    it("await 후 KyResponse.json()으로도 본문을 읽을 수 있다", async () => {
      const fetchImpl = vi.fn(async () => jsonResponse([{ id: 2, title: "yo" }]));
      const client = createTestClient(fetchImpl);

      const response = await client.get("/posts");
      const data = await response!.json();

      expect(data).toEqual([{ id: 2, title: "yo" }]);
    });
  });

  describe("빈 본문 처리", () => {
    it("체이닝 경로에서 204 응답이면 .json()이 빈 문자열을 반환한다", async () => {
      const fetchImpl = vi.fn(async () => new Response(null, { status: 204 }));
      const client = createTestClient(fetchImpl);

      const data = await client.delete("/posts/{postId}", { params: { postId: 1 } }).json();

      expect(data).toBe("");
    });

    it("await 경로에서 본문이 비었으면 .json()이 빈 문자열을 반환한다", async () => {
      const fetchImpl = vi.fn(async () => new Response("", { status: 200 }));
      const client = createTestClient(fetchImpl);

      const response = await client.get("/posts");
      const data = await response!.json();

      expect(data).toBe("");
    });
  });

  describe("ky.stop 처리", () => {
    it("beforeRetry hook이 ky.stop을 반환하면 await 결과는 undefined", async () => {
      const fetchImpl = vi.fn(async () => {
        throw new TypeError("network down");
      });
      const client = createClient<TestPaths>({
        prefixUrl: "https://api.test/",
        fetch: fetchImpl,
        retry: { limit: 1, methods: ["get"] },
        hooks: {
          beforeRetry: [() => ky.stop],
        },
      });

      const response = await client.get("/posts");

      expect(response).toBeUndefined();
    });
  });

  describe("path 파라미터 치환", () => {
    it("URL의 {param}을 치환한다", async () => {
      const fetchImpl = vi.fn<typeof fetch>(async () => new Response(null, { status: 204 }));
      const client = createTestClient(fetchImpl);

      await client.delete("/posts/{postId}", { params: { postId: 42 } });

      const [firstCall] = fetchImpl.mock.calls;
      const request = firstCall![0] as Request;
      expect(request.url).toBe("https://api.test/posts/42");
    });
  });

  describe("실패 처리", () => {
    it("호출자가 catch한 요청 실패가 unhandledRejection을 발동시키지 않는다", async () => {
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
