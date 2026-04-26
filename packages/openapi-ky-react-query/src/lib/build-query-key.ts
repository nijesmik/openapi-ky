import type { HttpMethod, Params, SearchParams } from "@nijesmik/openapi-ky";

type QueryKey = (string | Params)[];

export function buildQueryKey(
  path: string,
  options?: {
    method?: HttpMethod;
    params?: Params;
    searchParams?: SearchParams;
  },
): Readonly<QueryKey> {
  const { method, params, searchParams } = options ?? {};

  const normalizedSearchParams = searchParams && new URLSearchParams(searchParams as string);
  if (normalizedSearchParams) {
    normalizedSearchParams.sort();
  }

  const key: QueryKey = [path];

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
