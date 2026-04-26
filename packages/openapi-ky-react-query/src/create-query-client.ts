import type {
  HttpMethod,
  Params,
  PathsFor,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";

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
  let browserQueryClient: QueryClient | undefined;

  function getQueryClient() {
    if (isServer) return new QueryClient(config);
    if (!browserQueryClient) browserQueryClient = new QueryClient(config);
    return browserQueryClient;
  }

  function getQueryKey<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
  >(
    path: Path,
    options?: { method?: Method; params?: Params; searchParams?: SearchParams },
  ) {
    return buildQueryKey(path, options);
  }

  function setQueryData<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
  >({
    method,
    path,
    params,
    searchParams,
    updater,
  }: {
    method?: Method;
    path: Path;
    params?: Params;
    searchParams?: SearchParams;
    updater: Updater<
      ResponseBody<Paths, Path, Method> | undefined,
      ResponseBody<Paths, Path, Method> | undefined
    >;
  }) {
    return getQueryClient().setQueryData<ResponseBody<Paths, Path, Method>>(
      getQueryKey(path, { method, params, searchParams }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updater as any,
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
  }: {
    method?: Method;
    path: Path;
    params?: Params;
    searchParams?: SearchParams;
  } & Omit<InvalidateQueryFilters, "queryKey"> &
    InvalidateOptions) {
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
