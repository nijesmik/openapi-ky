import type * as Internal from "@/types/internal";

export function queryKey(
  path: string,
  options?: Internal.QueryKeyOptions,
): Readonly<Internal.QueryKey> {
  const { method, params, searchParams } = options ?? {};

  const normalizedSearchParams =
    searchParams && new URLSearchParams(searchParams as Internal.URLSearchParamsInit);
  if (normalizedSearchParams) {
    normalizedSearchParams.sort();
  }

  const key: Internal.QueryKey = [path];

  if (method && method !== "get") {
    key.push(method);
  }

  const hasParams = params && Object.keys(params).length > 0;
  if (hasParams) {
    key.push(params);
  }

  const hasSearchParams = normalizedSearchParams && normalizedSearchParams.size > 0;
  if (hasSearchParams) {
    key.push(normalizedSearchParams.toString());
  }

  return key;
}
