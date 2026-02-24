import type { Params } from "../types";

export function buildUrl(path: string, params?: Params) {
  const stripped = path.replace(/^\//, "");

  if (!params) {
    return stripped;
  }

  return stripped.replace(/\{(\w+)}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing path parameter: ${key}`);
    }
    return String(value);
  });
}
