import { describe, expect, it } from "vitest";

import { buildUrl } from "./build-url";

describe("buildUrl", () => {
  it("선행 슬래시를 제거한다", () => {
    expect(buildUrl("/users")).toBe("users");
  });

  it("슬래시가 없으면 그대로 반환한다", () => {
    expect(buildUrl("users")).toBe("users");
  });

  it("params가 없으면 경로만 반환한다", () => {
    expect(buildUrl("/users/{id}")).toBe("users/{id}");
  });

  it("경로 파라미터를 치환한다", () => {
    expect(buildUrl("/users/{id}", { id: 42 })).toBe("users/42");
  });

  it("여러 경로 파라미터를 치환한다", () => {
    expect(buildUrl("/users/{userId}/posts/{postId}", { userId: 1, postId: 99 })).toBe(
      "users/1/posts/99",
    );
  });

  it.each([
    ["string", "/users/{name}", { name: "john" }, "users/john"],
    ["boolean", "/flags/{active}", { active: true }, "flags/true"],
  ])("%s 타입 파라미터를 문자열로 변환해 치환한다", (_, path, params, expected) => {
    expect(buildUrl(path, params)).toBe(expected);
  });

  it("누락된 파라미터가 있으면 키와 path를 포함한 에러를 던진다", () => {
    expect(() => buildUrl("/users/{id}", {})).toThrow(
      `Missing path parameter "id" for path "/users/{id}"`,
    );
  });
});
