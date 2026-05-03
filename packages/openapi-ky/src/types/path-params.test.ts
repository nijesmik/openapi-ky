import { describe, expectTypeOf, it } from "vitest";

import type { PathParams } from "./common";

type FixturePaths = {
  "/posts": {
    get: {
      parameters: { query?: never; header?: never; path?: never; cookie?: never };
      responses: { 200: { content: { "application/json": [] } } };
    };
  };
  "/posts/{postId}": {
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: { postId: number };
        cookie?: never;
      };
      responses: { 200: { content: { "application/json": { id: number } } } };
    };
  };
  "/posts/{postId}/comments/{commentId}": {
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: { postId: number; commentId: number };
        cookie?: never;
      };
      responses: { 200: { content: { "application/json": [] } } };
    };
  };
};

describe("PathParams", () => {
  it("메서드에 선언된 path parameters를 추출한다", () => {
    expectTypeOf<PathParams<FixturePaths, "/posts/{postId}", "get">>().toEqualTypeOf<{
      postId: number;
    }>();
  });

  it("여러 path parameters를 지원한다", () => {
    expectTypeOf<
      PathParams<FixturePaths, "/posts/{postId}/comments/{commentId}", "get">
    >().toEqualTypeOf<{ postId: number; commentId: number }>();
  });

  it("path parameters가 없는 경로는 never를 반환한다", () => {
    expectTypeOf<PathParams<FixturePaths, "/posts", "get">>().toEqualTypeOf<never>();
  });
});
