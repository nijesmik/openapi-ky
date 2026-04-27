import type { Client, HttpMethod, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import {
  infiniteQueryOptions as buildInfiniteQueryOptions,
  queryOptions as buildQueryOptions,
  skipToken,
  type InfiniteData,
} from "@tanstack/react-query";

import type {
  Flat,
  InfiniteQueryOptionsParams,
  QueryOptionsParams,
  SuspenseQueryOptionsParams,
} from "./types/query";
import { buildApiOptions } from "./lib/build-api-options";
import { buildQueryKey } from "./lib/build-query-key";

export function createQueryOptions<Paths extends object>(api: Client<Paths>) {
  function queryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >(options: QueryOptionsParams<Paths, Path, Method, Data>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...queryOptions } =
      options as Flat<QueryOptionsParams<Paths, Path, Method, Data>, Paths, Path, Method>;

    if (params !== null) {
      return buildQueryOptions({
        queryKey: buildQueryKey(path, { method, params, searchParams }),
        queryFn: () =>
          api(
            path,
            buildApiOptions<Paths, Path, Method>({
              method,
              params,
              searchParams,
              kyOptions,
              json,
            }),
          ).json(),
        select,
        ...queryOptions,
      });
    }

    return buildQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>({
      queryKey: buildQueryKey(path, { method }),
      queryFn: skipToken,
    });
  }

  function suspenseQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >(options: SuspenseQueryOptionsParams<Paths, Path, Method, Data>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...queryOptions } =
      options as Flat<SuspenseQueryOptionsParams<Paths, Path, Method, Data>, Paths, Path, Method>;

    return buildQueryOptions({
      queryKey: buildQueryKey(path, { method, params, searchParams }),
      queryFn: () =>
        api(
          path,
          buildApiOptions<Paths, Path, Method>({
            method,
            params,
            searchParams,
            kyOptions,
            json,
          }),
        ).json(),
      select,
      ...queryOptions,
    });
  }

  function infiniteQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
  >(options: InfiniteQueryOptionsParams<Paths, Path, Method, PageParam, Data>) {
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
      ...queryOptions
    } = options as Flat<
      InfiniteQueryOptionsParams<Paths, Path, Method, PageParam, Data>,
      Paths,
      Path,
      Method
    >;

    return buildInfiniteQueryOptions({
      queryKey: buildQueryKey(path, { method, params, searchParams }),
      queryFn: ({ pageParam }) =>
        api(
          path,
          buildApiOptions<Paths, Path, Method>({
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
      ...queryOptions,
    });
  }

  return Object.assign(queryOptions, {
    suspense: suspenseQueryOptions,
    infinite: infiniteQueryOptions,
  });
}
