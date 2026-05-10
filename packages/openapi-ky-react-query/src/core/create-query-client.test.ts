import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `isServer` is a module-level constant that drives the browser/server branch
// in `getQueryClient`. Vitest's default node environment exposes it as `true`,
// so a `vi.hoisted` + getter mock is used to flip the branch per test.
const mocks = vi.hoisted(() => ({ isServer: false }));

vi.mock("@tanstack/react-query", async (importActual) => {
  const actual = await importActual<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    get isServer() {
      return mocks.isServer;
    },
  };
});

import { createQueryClient } from "./create-query-client";

describe("createQueryClient", () => {
  beforeEach(() => {
    mocks.isServer = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("브라우저에서 동일 인스턴스를 재사용한다 (싱글턴)", () => {
    const getQueryClient = createQueryClient();

    expect(getQueryClient()).toBe(getQueryClient());
  });

  it("서버에서는 매 호출마다 새 인스턴스를 반환한다 (SSR state leak 방지)", () => {
    mocks.isServer = true;
    const getQueryClient = createQueryClient();

    expect(getQueryClient()).not.toBe(getQueryClient());
  });
});
