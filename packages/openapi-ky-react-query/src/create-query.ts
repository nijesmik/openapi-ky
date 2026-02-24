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
    options?: Pick<Options, "params" | "searchParams">,
  ) {
    return buildQueryKey(path, options);
  }

  function options<
    Path extends PathOf<Paths, "get">,
    Data,
    QueryOptions extends UseQueryOptions<ResponseOf<Path>, Error, Data>,
  >(
    {
      enabled,
      path,
      select,
      ...requestOptions
    }: Omit<Options, "params"> & {
      path: Path;
      params?: Options["params"] | null;
      enabled?: QueryOptions["enabled"];
      select?: (data: ResponseOf<Path>) => Data;
    },
    queryOptions?: Omit<QueryOptions, "queryFn" | "queryKey" | "select" | "enabled">,
  ) {
    if (hasParams(requestOptions)) {
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

  function suspenseOptions<Path extends PathOf<Paths, "get">, Data>(
    {
      path,
      select,
      ...requestOptions
    }: Options & {
      path: Path;
      select?: (data: ResponseOf<Path>) => Data;
    },
    queryOptions?: Omit<
      UseQueryOptions<ResponseOf<Path>, Error, Data>,
      "queryFn" | "queryKey" | "select"
    >,
  ) {
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
  >(
    {
      enabled,
      getNextPageParam,
      initialPageParam,
      pageParamKey = "cursor",
      path,
      select,
      ...requestOptions
    }: Omit<Options, "searchParams"> & {
      path: Path;
      searchParams?: Record<string, string | number | boolean | undefined>;
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
    },
    queryOptions?: Omit<
      InfiniteQueryOptions,
      "queryFn" | "queryKey" | "initialPageParam" | "getNextPageParam" | "select" | "enabled"
    >,
  ) {
    const searchParams = requestOptions.searchParams ?? {};

    return createInfiniteQueryOptions({
      queryKey: buildQueryKey(path, requestOptions),
      queryFn: ({ pageParam }) =>
        api.get(path, {
          ...requestOptions,
          searchParams: {
            ...searchParams,
            ...{ [pageParamKey]: pageParam as PageParam },
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

function hasParams<T extends { params?: Params | null }>(
  options: T,
): options is T & { params: Params } {
  return options.params !== null;
}
