import type { Options, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

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
  type GetResponse<Path extends PathsFor<Paths, "get">> = ResponseBody<Paths, Path, "get">;

  let browserQueryClient: QueryClient | undefined;

  function getQueryClient() {
    if (isServer) return new QueryClient(config);
    if (!browserQueryClient) browserQueryClient = new QueryClient(config);
    return browserQueryClient;
  }

  function getQueryKey<Path extends PathsFor<Paths, "get">>(
    path: Path,
    options?: Pick<Options, "params" | "searchParams">,
  ) {
    return buildQueryKey(path, options);
  }

  function setQueryData<Path extends PathsFor<Paths, "get">>({
    path,
    params,
    searchParams,
    data,
  }: {
    path: Path;
    params?: Options["params"];
    searchParams?: Options["searchParams"];
    data: Updater<GetResponse<Path> | undefined, GetResponse<Path> | undefined>;
  }) {
    return getQueryClient().setQueryData<GetResponse<Path>>(
      getQueryKey(path, { params, searchParams }),
      data,
    );
  }

  function invalidateQueries<Path extends PathsFor<Paths, "get">>({
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
