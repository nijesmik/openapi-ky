import type { HttpMethod, PathParams, SearchParams } from "@nijesmik/openapi-ky";

import type { queryKey } from "@/lib/query-key";

export type QueryKey = ReturnType<typeof queryKey>;

export type QueryKeyOptions<
  TPaths extends object,
  TPath extends keyof TPaths,
  TMethod extends HttpMethod = HttpMethod,
> = {
  method?: TMethod;
  params?: PathParams<TPaths, TPath, TMethod>;
  searchParams?: SearchParams;
};
