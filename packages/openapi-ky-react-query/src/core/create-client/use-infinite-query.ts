import { type HttpMethod, type PathsFor, type ResponseBody } from "@nijesmik/openapi-ky";
import {
  useInfiniteQuery as tanstackUseInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";

import type { InfiniteQueryOptions } from "@/types/query";

import type { createInfiniteQueryOptions } from "./create-infinite-query-options";

export function useInfiniteQuery<TPaths extends object>(
  infiniteQueryOptions: ReturnType<typeof createInfiniteQueryOptions<TPaths>>,
) {
  return function useInfiniteQuery<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
    TPageParam extends string | number | undefined = string | undefined,
    TData = InfiniteData<ResponseBody<TPaths, TPath, TMethod>, TPageParam>,
  >(
    options: InfiniteQueryOptions<TPaths, TPath, TMethod, TPageParam, TData>,
  ): UseInfiniteQueryResult<TData, Error> {
    return tanstackUseInfiniteQuery(infiniteQueryOptions(options));
  };
}
