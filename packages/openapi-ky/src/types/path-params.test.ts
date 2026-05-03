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
  it("returns the path parameters for a method that declares them", () => {
    expectTypeOf<PathParams<FixturePaths, "/posts/{postId}", "get">>().toEqualTypeOf<{
      postId: number;
    }>();
  });

  it("supports multiple path parameters", () => {
    expectTypeOf<
      PathParams<FixturePaths, "/posts/{postId}/comments/{commentId}", "get">
    >().toEqualTypeOf<{ postId: number; commentId: number }>();
  });

  it("returns never for paths that declare no path parameters", () => {
    expectTypeOf<PathParams<FixturePaths, "/posts", "get">>().toEqualTypeOf<never>();
  });
});
