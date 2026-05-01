import {
  type Client,
  type HttpMethod,
  type PathsFor,
  type ResponseBody,
} from "@nijesmik/openapi-ky";
import {
  skipToken,
  infiniteQueryOptions as tanstackInfiniteQueryOptions,
  queryOptions as tanstackQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query";

import type {
  CreateInfiniteQueryOptions,
  CreateQueryOptions,
  CreateSuspenseQueryOptions,
  Flat,
} from "@/types/query";

import { buildApiOptions } from "./build-api-options";
import { buildQueryKey } from "./build-query-key";

export function buildQueryOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  Data = ResponseBody<Paths, Path, Method>,
>(
  {
    path,
    method,
    params,
    searchParams,
    kyOptions,
    select,
    json,
    ...queryOptions
  }: Flat<CreateQueryOptions<Paths, Path, Method, Data>, Paths, Path, Method>,
  api: Client<Paths>,
) {
  if (params === null) {
    return tanstackQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>({
      queryKey: buildQueryKey(path, { method }),
      queryFn: skipToken,
    });
  }

  return tanstackQueryOptions({
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

export function buildSuspenseQueryOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  Data = ResponseBody<Paths, Path, Method>,
>(
  {
    path,
    method,
    params,
    searchParams,
    kyOptions,
    select,
    json,
    ...queryOptions
  }: Flat<CreateSuspenseQueryOptions<Paths, Path, Method, Data>, Paths, Path, Method>,
  api: Client<Paths>,
) {
  return tanstackQueryOptions({
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

export function buildInfiniteQueryOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  PageParam extends string | number | undefined = string | undefined,
  Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
>(
  {
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
  }: Flat<CreateInfiniteQueryOptions<Paths, Path, Method, PageParam, Data>, Paths, Path, Method>,
  api: Client<Paths>,
) {
  return tanstackInfiniteQueryOptions({
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
