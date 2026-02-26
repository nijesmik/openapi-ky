import type { API, Options, PathOf, SuccessOf } from "@nijesmik/openapi-ky";

import {
  infiniteQueryOptions as createInfiniteQueryOptions,
  queryOptions as createQueryOptions,
  skipToken,
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
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
  >({
    path,
    params,
    searchParams,
    kyOptions,
    select,
    ...queryOptions
  }: {
    path: Path;
    params?: Options["params"] | null;
    searchParams?: Options["searchParams"];
    kyOptions?: Omit<Options, "params" | "searchParams">;
    select?: (data: ResponseOf<Path>) => Data;
  } & Omit<QueryOptions, "queryFn" | "queryKey" | "select">) {
    if (params !== null) {
      const requestOptions = { params, searchParams, ...kyOptions };

      return createQueryOptions({
        queryKey: buildQueryKey(path, requestOptions),
        queryFn: () => api.get(path, requestOptions),
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
    params,
    searchParams,
    kyOptions,
    select,
    ...queryOptions
  }: {
    path: Path;
    params?: Options["params"];
    searchParams?: Options["searchParams"];
    kyOptions?: Omit<Options, "params" | "searchParams">;
    select?: (data: ResponseOf<Path>) => Data;
  } & Omit<
    UseSuspenseQueryOptions<ResponseOf<Path>, Error, Data>,
    "queryFn" | "queryKey" | "select"
  >) {
    const requestOptions = { params, searchParams, ...kyOptions };

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
    params,
    searchParams,
    pageParamKey = "cursor",
    kyOptions,
    initialPageParam,
    select,
    ...queryOptions
  }: {
    path: Path;
    params?: Options["params"];
    searchParams?: Record<string, string | number | boolean | undefined>;
    pageParamKey?: string;
    kyOptions?: Omit<Options, "params" | "searchParams">;
    initialPageParam: PageParam;
    select?: (data: InfiniteData<ResponseOf<Path>, PageParam>) => Data;
  } & Omit<InfiniteQueryOptions, "queryFn" | "queryKey" | "initialPageParam" | "select">) {
    return createInfiniteQueryOptions({
      queryKey: buildQueryKey(path, { params, searchParams }),
      queryFn: ({ pageParam }) =>
        api.get(path, {
          params,
          ...kyOptions,
          searchParams: {
            ...searchParams,
            [pageParamKey]: pageParam as PageParam,
          },
        }),
      initialPageParam,
      select,
      ...queryOptions,
    });
  }

  return { options, suspenseOptions, infiniteOptions, keyOf };
}
