import type { Internal } from "@openapi-ky/internal";

import {
  type Client,
  type HttpMethod,
  type PathsFor,
  type ResponseBody,
} from "@nijesmik/openapi-ky";
import {
  infiniteQueryOptions as tanstackInfiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query";

import type { Flat } from "@/types/internal";
import type { InfiniteQueryOptions } from "@/types/query";

import { apiOptions } from "@/lib/api-options";
import { queryKey } from "@/lib/query-key";
import { safeJson } from "@/lib/safe-json";

export function createInfiniteQueryOptions<TPaths extends object>(api: Client<TPaths>) {
  return function infiniteQueryOptions<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
    TPageParam extends string | number | undefined = string | undefined,
    TData = InfiniteData<ResponseBody<TPaths, TPath, TMethod>, TPageParam>,
  >(options: InfiniteQueryOptions<TPaths, TPath, TMethod, TPageParam, TData>) {
    const {
      path,
      method,
      params,
      searchParams,
      pageParamKey = "cursor",
      kyOptions,
      initialPageParam,
      select,
      json,
      ...rest
    } = options as Flat<
      InfiniteQueryOptions<TPaths, TPath, TMethod, TPageParam, TData>,
      TPaths,
      TPath,
      TMethod
    >;

    return tanstackInfiniteQueryOptions({
      queryKey: queryKey(path, { method, params: params as Internal.PathParams, searchParams }),
      queryFn: ({ pageParam }) =>
        safeJson(
          api(
            path,
            apiOptions<TPaths, TPath, TMethod>({
              method,
              params,
              searchParams: {
                ...searchParams,
                [pageParamKey]: pageParam as TPageParam,
              },
              kyOptions,
              json,
            }),
          ),
        ),
      initialPageParam,
      select,
      ...rest,
    });
  };
}
