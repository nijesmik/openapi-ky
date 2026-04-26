import type { Client, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import {
  infiniteQueryOptions as buildInfiniteQueryOptions,
  queryOptions as buildQueryOptions,
  skipToken,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import type {
  InfiniteQueryOptionsParams,
  QueryKey,
  QueryOptionsParams,
  SuspenseQueryOptionsParams,
} from "./create-query-options.types";
import { buildQueryKey } from "./lib/build-query-key";

export function createQueryOptions<Paths extends object>(api: Client<Paths>) {
  function queryOptions<
    Path extends PathsFor<Paths, "get">,
    Data,
    QueryOptions extends UseQueryOptions<ResponseBody<Paths, Path>, Error, Data>,
  >({
    path,
    params,
    searchParams,
    kyOptions,
    select,
    ...queryOptions
  }: QueryOptionsParams<Paths, Path, Data, QueryOptions>) {
    if (params !== null) {
      const requestOptions = { params, searchParams, ...kyOptions };

      return buildQueryOptions({
        queryKey: buildQueryKey(path, requestOptions),
        queryFn: () => api.get(path, requestOptions).json(),
        select,
        ...queryOptions,
      });
    }

    return buildQueryOptions<ResponseBody<Paths, Path>, Error, Data>({
      queryKey: buildQueryKey(path),
      queryFn: skipToken,
    });
  }

  function suspenseQueryOptions<Path extends PathsFor<Paths, "get">, Data>({
    path,
    params,
    searchParams,
    kyOptions,
    select,
    ...queryOptions
  }: SuspenseQueryOptionsParams<Paths, Path, Data>) {
    const requestOptions = { params, searchParams, ...kyOptions };

    return buildQueryOptions({
      queryKey: buildQueryKey(path, requestOptions),
      queryFn: () => api.get(path, requestOptions).json(),
      select,
      ...queryOptions,
    });
  }

  function infiniteQueryOptions<
    Path extends PathsFor<Paths, "get">,
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<ResponseBody<Paths, Path>, PageParam>,
    InfiniteQueryOptions extends UseInfiniteQueryOptions<
      ResponseBody<Paths, Path>,
      Error,
      Data,
      QueryKey,
      PageParam
    > = UseInfiniteQueryOptions<ResponseBody<Paths, Path>, Error, Data, QueryKey, PageParam>,
  >({
    path,
    params,
    searchParams,
    pageParamKey = "cursor",
    kyOptions,
    initialPageParam,
    select,
    ...queryOptions
  }: InfiniteQueryOptionsParams<Paths, Path, PageParam, Data, InfiniteQueryOptions>) {
    return buildInfiniteQueryOptions({
      queryKey: buildQueryKey(path, { params, searchParams }),
      queryFn: ({ pageParam }) =>
        api
          .get(path, {
            params,
            ...kyOptions,
            searchParams: {
              ...searchParams,
              [pageParamKey]: pageParam as PageParam,
            },
          })
          .json(),
      initialPageParam,
      select,
      ...queryOptions,
    });
  }

  return Object.assign(queryOptions, {
    suspense: suspenseQueryOptions,
    infinite: infiniteQueryOptions,
  });
}
