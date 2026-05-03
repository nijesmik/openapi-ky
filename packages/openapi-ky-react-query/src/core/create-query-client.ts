import type { HttpMethod, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import {
  isServer,
  QueryClient,
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type QueryClientConfig,
} from "@tanstack/react-query";

import type { QueryKeyOptions, SetQueryDataUpdater } from "@/types/client";

import { queryKey } from "@/lib/query-key";

export function createQueryClient<Paths extends object = object>(config?: QueryClientConfig) {
  let browserQueryClient: QueryClient | undefined;

  function getQueryClient() {
    if (isServer) {
      return new QueryClient(config);
    }
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient(config);
    }
    return browserQueryClient;
  }

  function getQueryKey<Path extends PathsFor<Paths, Method>, Method extends HttpMethod = "get">(
    path: Path,
    options?: QueryKeyOptions<Paths, Path, Method>,
  ) {
    // Cast: PathParams<...> resolves to a path-specific shape, but the runtime
    // queryKey() helper accepts the wider Params record. Sound because the
    // path-specific shape is structurally a subtype of Params at runtime.
    // Tied to queryKey's signature so internal changes (e.g. Params removal)
    // are auto-tracked here without needing a manual update.
    return queryKey(path, options as Parameters<typeof queryKey>[1]);
  }

  function setQueryData<Path extends PathsFor<Paths, Method>, Method extends HttpMethod = "get">({
    method,
    path,
    params,
    searchParams,
    updater,
  }: QueryKeyOptions<Paths, Path, Method> & {
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
  >(
    filters: Omit<InvalidateQueryFilters, "queryKey"> &
      QueryKeyOptions<Paths, Path, Method> & {
        path: Path;
      },
    options?: InvalidateOptions,
  ) {
    const { method, path, params, searchParams, ...rest } = filters;
    return getQueryClient().invalidateQueries(
      {
        queryKey: getQueryKey(path, { method, params, searchParams }),
        ...rest,
      },
      options,
    );
  }

  return Object.assign(getQueryClient, {
    getQueryClient,
    getQueryKey,
    setQueryData,
    invalidateQueries,
  });
}
