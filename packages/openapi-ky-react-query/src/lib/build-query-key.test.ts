import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { buildQueryKey } from "./build-query-key";

describe("buildQueryKey", () => {
  it("경로만 있으면 [path]를 반환한다", () => {
    expect(buildQueryKey("/users")).toEqual(["/users"]);
  });

  it("params가 있으면 [path, params]를 반환한다", () => {
    expect(buildQueryKey("/users/{id}", { params: { id: 1 } })).toEqual(["/users/{id}", { id: 1 }]);
  });

  it("searchParams 객체를 정렬된 문자열로 정규화한다", () => {
    expect(buildQueryKey("/users", { searchParams: { sort: "name", page: "1" } })).toEqual([
      "/users",
      "page=1&sort=name",
    ]);
  });

  it("searchParams 문자열을 정렬된 문자열로 정규화한다", () => {
    expect(buildQueryKey("/users", { searchParams: "sort=name&page=1" })).toEqual([
      "/users",
      "page=1&sort=name",
    ]);
  });

  it("searchParams URLSearchParams를 정렬된 문자열로 정규화한다", () => {
    const sp = new URLSearchParams([
      ["sort", "name"],
      ["page", "1"],
    ]);
    expect(buildQueryKey("/users", { searchParams: sp })).toEqual(["/users", "page=1&sort=name"]);
  });

  it("타입이 달라도 같은 searchParams면 같은 키를 생성한다", () => {
    const fromObject = buildQueryKey("/users", { searchParams: { page: "1" } });
    const fromString = buildQueryKey("/users", { searchParams: "page=1" });
    const fromUSP = buildQueryKey("/users", { searchParams: new URLSearchParams({ page: "1" }) });

    expect(fromObject).toEqual(fromString);
    expect(fromString).toEqual(fromUSP);
  });

  it("params와 searchParams가 모두 있으면 별도 요소로 추가한다", () => {
    expect(
      buildQueryKey("/users/{id}", {
        params: { id: 1 },
        searchParams: { include: "posts" },
      }),
    ).toEqual(["/users/{id}", { id: 1 }, "include=posts"]);
  });

  it("params만 있을 때와 searchParams만 있을 때 키가 다르다", () => {
    const withParams = buildQueryKey("/users", { params: { page: "1" } });
    const withSearch = buildQueryKey("/users", { searchParams: { page: "1" } });

    expect(withParams).not.toEqual(withSearch);
  });

  it("빈 params 객체는 키에 포함하지 않는다", () => {
    expect(buildQueryKey("/users", { params: {} })).toEqual(["/users"]);
  });

  it("빈 searchParams는 키에 포함하지 않는다", () => {
    expect(buildQueryKey("/users", { searchParams: {} })).toEqual(["/users"]);
    expect(buildQueryKey("/users", { searchParams: "" })).toEqual(["/users"]);
    expect(buildQueryKey("/users", { searchParams: new URLSearchParams() })).toEqual(["/users"]);
  });

  it("options가 undefined이면 [path]를 반환한다", () => {
    expect(buildQueryKey("/users", undefined)).toEqual(["/users"]);
  });

  describe("QueryClient 캐시 매칭", () => {
    it("다른 타입의 searchParams로 만든 키가 같은 캐시를 가리킨다", () => {
      const qc = new QueryClient();
      const data = { id: 1, name: "test" };

      qc.setQueryData(buildQueryKey("/users", { searchParams: { page: "1" } }), data);

      expect(qc.getQueryData(buildQueryKey("/users", { searchParams: "page=1" }))).toEqual(data);
      expect(
        qc.getQueryData(
          buildQueryKey("/users", { searchParams: new URLSearchParams({ page: "1" }) }),
        ),
      ).toEqual(data);
    });

    it("params와 searchParams가 같은 값이어도 다른 캐시다", () => {
      const qc = new QueryClient();

      qc.setQueryData(buildQueryKey("/users", { params: { page: "1" } }), "from params");
      qc.setQueryData(buildQueryKey("/users", { searchParams: { page: "1" } }), "from search");

      expect(qc.getQueryData(buildQueryKey("/users", { params: { page: "1" } }))).toBe(
        "from params",
      );
      expect(qc.getQueryData(buildQueryKey("/users", { searchParams: { page: "1" } }))).toBe(
        "from search",
      );
    });
  });
});
