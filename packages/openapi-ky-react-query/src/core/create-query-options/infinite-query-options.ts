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
import type { CreateInfiniteQueryOptions } from "@/types/query";

import { apiOptions } from "@/lib/api-options";
import { queryKey } from "@/lib/query-key";

export function infiniteQueryOptions<Paths extends object>(api: Client<Paths>) {
  return function infiniteQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
  >(options: CreateInfiniteQueryOptions<Paths, Path, Method, PageParam, Data>) {
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
      CreateInfiniteQueryOptions<Paths, Path, Method, PageParam, Data>,
      Paths,
      Path,
      Method
    >;

    return tanstackInfiniteQueryOptions({
      queryKey: queryKey(path, { method, params: params as Internal.PathParams, searchParams }),
      queryFn: ({ pageParam }) =>
        api(
          path,
          apiOptions<Paths, Path, Method>({
            method,
            params,
            searchParams: {
              ...searchParams,
              [pageParamKey]: pageParam as PageParam,
            },
            kyOptions,
            json,
          }),
        ).json(),
      initialPageParam,
      select,
      ...rest,
    });
  };
}
