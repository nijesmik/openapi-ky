import type { Options, PathOf, SuccessOf } from "@nijesmik/openapi-ky";

import {
  isServer,
  QueryClient,
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type QueryClientConfig,
  type Updater,
} from "@tanstack/react-query";

import { buildQueryKey } from "./lib/build-query-key";

export function createQueryClient<Paths extends object = object>(config?: QueryClientConfig) {
  type ResponseOf<Path extends PathOf<Paths, "get">> = SuccessOf<Paths, Path, "get">;

  let browserQueryClient: QueryClient | undefined;

  function getQueryClient() {
    if (isServer) return new QueryClient(config);
    if (!browserQueryClient) browserQueryClient = new QueryClient(config);
    return browserQueryClient;
  }

  function getQueryKey<Path extends PathOf<Paths, "get">>(
    path: Path,
    options?: Pick<Options, "params" | "searchParams">,
  ) {
    return buildQueryKey(path, options);
  }

  function setQueryData<Path extends PathOf<Paths, "get">>({
    path,
    params,
    searchParams,
    data,
  }: {
    path: Path;
    params?: Options["params"];
    searchParams?: Options["searchParams"];
    data: Updater<ResponseOf<Path> | undefined, ResponseOf<Path> | undefined>;
  }) {
    return getQueryClient().setQueryData<ResponseOf<Path>>(
      getQueryKey(path, { params, searchParams }),
      data,
    );
  }

  function invalidateQueries<Path extends PathOf<Paths, "get">>({
    path,
    params,
    searchParams,
    cancelRefetch,
    throwOnError,
    ...filters
  }: {
    path: Path;
    params?: Options["params"];
    searchParams?: Options["searchParams"];
  } & Omit<InvalidateQueryFilters, "queryKey"> &
    InvalidateOptions) {
    return getQueryClient().invalidateQueries(
      {
        queryKey: getQueryKey(path, { params, searchParams }),
        ...filters,
      },
      { cancelRefetch, throwOnError },
    );
  }

  return Object.assign(getQueryClient, {
    getQueryClient,
    getQueryKey,
    setQueryData,
    invalidateQueries,
  });
}
