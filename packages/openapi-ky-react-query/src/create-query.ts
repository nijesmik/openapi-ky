import type { Client, Options, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

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

export function createQuery<Paths extends object>(api: Client<Paths>) {
  type GetResponse<Path extends PathsFor<Paths, "get">> = ResponseBody<Paths, Path, "get">;

  function keyOf<Path extends PathsFor<Paths, "get">>(
    path: Path,
    options?: Pick<Options, "params" | "searchParams">,
  ) {
    return buildQueryKey(path, options);
  }

  function options<
    Path extends PathsFor<Paths, "get">,
    Data,
    QueryOptions extends UseQueryOptions<GetResponse<Path>, Error, Data>,
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
    select?: (data: GetResponse<Path>) => Data;
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

    return createQueryOptions<GetResponse<Path>, Error, Data>({
      queryKey: buildQueryKey(path),
      queryFn: skipToken,
    });
  }

  function suspenseOptions<Path extends PathsFor<Paths, "get">, Data>({
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
    select?: (data: GetResponse<Path>) => Data;
  } & Omit<
    UseSuspenseQueryOptions<GetResponse<Path>, Error, Data>,
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
    Path extends PathsFor<Paths, "get">,
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<GetResponse<Path>, PageParam>,
    InfiniteQueryOptions extends UseInfiniteQueryOptions<
      GetResponse<Path>,
      Error,
      Data,
      QueryKey,
      PageParam
    > = UseInfiniteQueryOptions<GetResponse<Path>, Error, Data, QueryKey, PageParam>,
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
    select?: (data: InfiniteData<GetResponse<Path>, PageParam>) => Data;
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
