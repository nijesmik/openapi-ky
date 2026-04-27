import type { HttpMethod, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import {
  isServer,
  QueryClient,
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type QueryClientConfig,
} from "@tanstack/react-query";

import { buildQueryKey } from "./lib/build-query-key";
import type { QueryKeyOptions, SetQueryDataUpdater } from "./types/client";

export function createQueryClient<Paths extends object = object>(config?: QueryClientConfig) {
  let browserQueryClient: QueryClient | undefined;

  function getQueryClient() {
    if (isServer) return new QueryClient(config);
    if (!browserQueryClient) browserQueryClient = new QueryClient(config);
    return browserQueryClient;
  }

  function getQueryKey<Path extends PathsFor<Paths, Method>, Method extends HttpMethod = "get">(
    path: Path,
    options?: QueryKeyOptions<Method>,
  ) {
    return buildQueryKey(path, options);
  }

  function setQueryData<Path extends PathsFor<Paths, Method>, Method extends HttpMethod = "get">({
    method,
    path,
    params,
    searchParams,
    updater,
  }: QueryKeyOptions<Method> & {
    path: Path;
    updater: SetQueryDataUpdater<ResponseBody<Paths, Path, Method>>;
  }) {
    return getQueryClient().setQueryData<ResponseBody<Paths, Path, Method>>(
      getQueryKey(path, { method, params, searchParams }),
      updater,
    );
  }

  function invalidateQueries<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
  >({
    method,
    path,
    params,
    searchParams,
    cancelRefetch,
    throwOnError,
    ...filters
  }: Omit<InvalidateQueryFilters, "queryKey"> &
    QueryKeyOptions<Method> &
    InvalidateOptions & {
      path: Path;
    }) {
    return getQueryClient().invalidateQueries(
      {
        queryKey: getQueryKey(path, { method, params, searchParams }),
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
