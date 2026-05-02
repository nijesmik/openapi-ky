import { describe, expect, it } from "vitest";

import { queryKey } from "./query-key";

describe("queryKey", () => {
  it("경로만 있으면 [path]를 반환한다", () => {
    expect(queryKey("/users")).toEqual(["/users"]);
  });

  it("params가 있으면 [path, params]를 반환한다", () => {
    expect(queryKey("/users/{id}", { params: { id: 1 } })).toEqual(["/users/{id}", { id: 1 }]);
  });

  it("searchParams 객체를 정렬된 문자열로 정규화한다", () => {
    expect(queryKey("/users", { searchParams: { sort: "name", page: "1" } })).toEqual([
      "/users",
      "page=1&sort=name",
    ]);
  });

  it("searchParams 문자열을 정렬된 문자열로 정규화한다", () => {
    expect(queryKey("/users", { searchParams: "sort=name&page=1" })).toEqual([
      "/users",
      "page=1&sort=name",
    ]);
  });

  it("searchParams URLSearchParams를 정렬된 문자열로 정규화한다", () => {
    const sp = new URLSearchParams([
      ["sort", "name"],
      ["page", "1"],
    ]);
    expect(queryKey("/users", { searchParams: sp })).toEqual(["/users", "page=1&sort=name"]);
  });

  it("타입이 달라도 같은 searchParams면 같은 키를 생성한다", () => {
    const fromObject = queryKey("/users", { searchParams: { page: "1" } });
    const fromString = queryKey("/users", { searchParams: "page=1" });
    const fromUSP = queryKey("/users", { searchParams: new URLSearchParams({ page: "1" }) });

    expect(fromObject).toEqual(fromString);
    expect(fromString).toEqual(fromUSP);
  });

  it("params와 searchParams가 모두 있으면 별도 요소로 추가한다", () => {
    expect(
      queryKey("/users/{id}", {
        params: { id: 1 },
        searchParams: { include: "posts" },
      }),
    ).toEqual(["/users/{id}", { id: 1 }, "include=posts"]);
  });

  it("params만 있을 때와 searchParams만 있을 때 키가 다르다", () => {
    const withParams = queryKey("/users", { params: { page: "1" } });
    const withSearch = queryKey("/users", { searchParams: { page: "1" } });

    expect(withParams).not.toEqual(withSearch);
  });

  it("빈 params 객체는 키에 포함하지 않는다", () => {
    expect(queryKey("/users", { params: {} })).toEqual(["/users"]);
  });

  it("빈 searchParams는 키에 포함하지 않는다", () => {
    expect(queryKey("/users", { searchParams: {} })).toEqual(["/users"]);
    expect(queryKey("/users", { searchParams: "" })).toEqual(["/users"]);
    expect(queryKey("/users", { searchParams: new URLSearchParams() })).toEqual(["/users"]);
  });

  it("options가 undefined이면 [path]를 반환한다", () => {
    expect(queryKey("/users", undefined)).toEqual(["/users"]);
  });

  it("method가 'get'이면 queryKey에 포함하지 않는다", () => {
    expect(queryKey("/users", { method: "get" })).toEqual(["/users"]);
  });

  it("method 'get'은 params와 함께 있을 때도 queryKey에 포함되지 않는다", () => {
    expect(queryKey("/users/{id}", { method: "get", params: { id: 1 } })).toEqual([
      "/users/{id}",
      { id: 1 },
    ]);
  });

  it("비-GET method는 path 다음 두 번째 요소로 포함한다", () => {
    expect(queryKey("/search", { method: "post" })).toEqual(["/search", "post"]);
  });

  it("method + params는 [path, method, params] 순서로 포함한다", () => {
    expect(queryKey("/users/{id}", { method: "post", params: { id: 1 } })).toEqual([
      "/users/{id}",
      "post",
      { id: 1 },
    ]);
  });

  it("method + searchParams는 [path, method, searchParams] 순서로 포함한다", () => {
    expect(
      queryKey("/search", {
        method: "post",
        searchParams: { sort: "name" },
      }),
    ).toEqual(["/search", "post", "sort=name"]);
  });

  it("method + params + searchParams는 [path, method, params, searchParams] 순서로 포함한다", () => {
    expect(
      queryKey("/users/{id}", {
        method: "post",
        params: { id: 1 },
        searchParams: { include: "posts" },
      }),
    ).toEqual(["/users/{id}", "post", { id: 1 }, "include=posts"]);
  });
});
