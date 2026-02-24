import type { Options } from "openapi-ky";

type QueryKey = (string | Options["params"])[];

export function buildQueryKey(
  path: string,
  options?: Pick<Options, "params" | "searchParams">,
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
