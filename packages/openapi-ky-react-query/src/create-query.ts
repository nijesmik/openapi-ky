import type { API, Options, Params, PathOf, SuccessOf } from "@nijesmik/openapi-ky";

import {
  infiniteQueryOptions as createInfiniteQueryOptions,
  queryOptions as createQueryOptions,
  skipToken,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { buildQueryKey } from "./lib/build-query-key";

type QueryKey = ReturnType<typeof buildQueryKey>;

export function createQuery<Paths extends object>(api: API<Paths>) {
  type ResponseOf<Path extends PathOf<Paths, "get">> = SuccessOf<Paths, Path, "get">;

  function keyOf<Path extends PathOf<Paths, "get">>(
    path: Path,
    options?: { param?: Params; searchParams?: Options["searchParams"] },
  ) {
    return buildQueryKey(
      path,
      options && { params: options.param, searchParams: options.searchParams },
    );
  }

  function options<
    Path extends PathOf<Paths, "get">,
    Data,
    QueryOptions extends UseQueryOptions<ResponseOf<Path>, Error, Data>,
  >({
    path,
    param,
    kyOption,
    enabled,
    select,
    ...queryOptions
  }: {
    path: Path;
    param?: Params | null;
    kyOption?: Omit<Options, "params">;
    enabled?: QueryOptions["enabled"];
    select?: (data: ResponseOf<Path>) => Data;
  } & Omit<QueryOptions, "queryFn" | "queryKey" | "select" | "enabled">) {
    if (param !== null) {
      const requestOptions = { params: param, ...kyOption };
      return createQueryOptions({
        queryKey: buildQueryKey(path, requestOptions),
        queryFn: () => api.get(path, requestOptions),
        enabled,
        select,
        ...queryOptions,
      });
    }

    return createQueryOptions<ResponseOf<Path>, Error, Data>({
      queryKey: buildQueryKey(path),
      queryFn: skipToken,
    });
  }

  function suspenseOptions<Path extends PathOf<Paths, "get">, Data>({
    path,
    param,
    kyOption,
    select,
    ...queryOptions
  }: {
    path: Path;
    param?: Params;
    kyOption?: Omit<Options, "params">;
    select?: (data: ResponseOf<Path>) => Data;
  } & Omit<
    UseQueryOptions<ResponseOf<Path>, Error, Data>,
    "queryFn" | "queryKey" | "select"
  >) {
    const requestOptions = { params: param, ...kyOption };
    return createQueryOptions({
      queryKey: buildQueryKey(path, requestOptions),
      queryFn: () => api.get(path, requestOptions),
      select,
      ...queryOptions,
    });
  }

  function infiniteOptions<
    Path extends PathOf<Paths, "get">,
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<ResponseOf<Path>, PageParam>,
    InfiniteQueryOptions extends UseInfiniteQueryOptions<
      ResponseOf<Path>,
      Error,
      Data,
      QueryKey,
      PageParam
    > = UseInfiniteQueryOptions<ResponseOf<Path>, Error, Data, QueryKey, PageParam>,
  >({
    path,
    param,
    kyOption,
    pageParamKey = "cursor",
    initialPageParam,
    getNextPageParam,
    enabled,
    select,
    ...queryOptions
  }: {
    path: Path;
    param?: Params;
    kyOption?: Omit<Options, "params" | "searchParams"> & {
      searchParams?: Record<string, string | number | boolean | undefined>;
    };
    pageParamKey?: string;
    initialPageParam: PageParam;
    enabled?: InfiniteQueryOptions["enabled"];
    getNextPageParam: (
      lastPage: ResponseOf<Path>,
      allPages: ResponseOf<Path>[],
      lastPageParam: PageParam,
      allPageParams: PageParam[],
    ) => PageParam | undefined | null;
    select?: (data: InfiniteData<ResponseOf<Path>, PageParam>) => Data;
  } & Omit<
    InfiniteQueryOptions,
    "queryFn" | "queryKey" | "initialPageParam" | "getNextPageParam" | "select" | "enabled"
  >) {
    const searchParams = kyOption?.searchParams ?? {};
    const requestOptions = { params: param, ...kyOption };

    return createInfiniteQueryOptions({
      queryKey: buildQueryKey(path, requestOptions),
      queryFn: ({ pageParam }) =>
        api.get(path, {
          ...requestOptions,
          searchParams: {
            ...searchParams,
            [pageParamKey]: pageParam as PageParam,
          },
        }),
      initialPageParam,
      getNextPageParam,
      select,
      enabled,
      ...queryOptions,
    });
  }

  return { options, suspenseOptions, infiniteOptions, keyOf };
}
