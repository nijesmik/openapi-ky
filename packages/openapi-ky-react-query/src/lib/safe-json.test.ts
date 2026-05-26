import { describe, expect, it } from "vitest";

import { safeJson } from "./safe-json";

describe("safeJson", () => {
  it("본문이 있으면 JSON 파싱 결과를 반환한다", async () => {
    const response = {
      text: () => Promise.resolve('{"id":1}'),
      json: () => Promise.resolve({ id: 1 }),
    };

    await expect(safeJson(Promise.resolve(response))).resolves.toEqual({ id: 1 });
  });

  it("본문이 비어있으면 undefined를 반환한다", async () => {
    const response = {
      text: () => Promise.resolve(""),
      json: () => Promise.reject(new SyntaxError("Unexpected end of JSON input")),
    };

    await expect(safeJson(Promise.resolve(response))).resolves.toBeUndefined();
  });
});
