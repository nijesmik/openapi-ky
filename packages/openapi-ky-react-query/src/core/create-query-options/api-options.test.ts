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
      kyOptions: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        method: "delete" as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        json: { malicious: true } as any,
      },
    });

    expect(result.method).toBe("post");
    expect(result.json).toEqual({ title: "real" });
  });
});
