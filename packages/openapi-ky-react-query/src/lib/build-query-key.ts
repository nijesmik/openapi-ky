import type { Params } from "@nijesmik/openapi-ky";
import type { Options as KyOptions } from "ky";

type QueryKey = (string | Params)[];

export function buildQueryKey(
  path: string,
  options?: { params?: Params; searchParams?: KyOptions["searchParams"] },
): Readonly<QueryKey> {
  const { params, searchParams } = options ?? {};

  const normalizedSearchParams = searchParams && new URLSearchParams(searchParams as string);
  if (normalizedSearchParams) {
    normalizedSearchParams.sort();
  }

  const key: QueryKey = [path];

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
