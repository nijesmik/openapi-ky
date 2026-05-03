import { describe, expect, it } from "vitest";

import { apiOptions } from "./api-options";

type TestPaths = {
  "/posts": {
    get: { responses: { 200: { content: { "application/json": [] } } } };
    post: {
      requestBody: { content: { "application/json": { title: string } } };
      responses: { 201: { content: { "application/json": { id: number } } } };
    };
  };
};

describe("apiOptions", () => {
  it("[회귀 테스트] kyOptions로 우회 주입된 method/json은 explicit 필드를 override할 수 없다", () => {
    const result = apiOptions<TestPaths, "/posts", "post">({
      method: "post",
      json: { title: "real" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      kyOptions: { method: "delete", json: { malicious: true } } as any,
    });

    expect(result.method).toBe("post");
    expect(result.json).toEqual({ title: "real" });
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

      apiOptions<_Paths, "/posts/{postId}", "get">({
        // @ts-expect-error '/posts/{postId}'.get expects { postId: number }, not { wrongKey: number }
        params: { wrongKey: 1 },
      });
    });
  });
});
