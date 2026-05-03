import type { HttpMethod, SearchParams } from "@nijesmik/openapi-ky";

type QueryKey = (string | Record<string, boolean | number | string>)[];

type RuntimeQueryKeyOptions = {
  method?: HttpMethod;
  params?: Record<string, boolean | number | string>;
  searchParams?: SearchParams;
};

export function queryKey(path: string, options?: RuntimeQueryKeyOptions): Readonly<QueryKey> {
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
