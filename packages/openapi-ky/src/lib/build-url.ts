import type * as Internal from "@/types/internal";

export function buildUrl(path: string, params?: Internal.PathParams) {
  const stripped = path.replace(/^\//, "");

  if (!params) {
    return stripped;
  }

  return stripped.replace(/\{(\w+)}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing path parameter "${key}" for path "${path}"`);
    }
    return String(value);
  });
}
