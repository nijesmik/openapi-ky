import { type HttpMethod, type PathsFor, type ResponseBody } from "@nijesmik/openapi-ky";
import { useQuery as tanstackUseQuery, type UseQueryResult } from "@tanstack/react-query";

import type { QueryOptions } from "@/types/query";

import type { createQueryOptions } from "./create-query-options";

export function useQuery<TPaths extends object>(
  queryOptions: ReturnType<typeof createQueryOptions<TPaths>>,
) {
  return function useQuery<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
    TData = ResponseBody<TPaths, TPath, TMethod>,
  >(options: QueryOptions<TPaths, TPath, TMethod, TData>): UseQueryResult<TData, Error> {
    return tanstackUseQuery(queryOptions(options));
  };
}
