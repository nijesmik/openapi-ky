import type { HttpMethod, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import {
  isServer,
  QueryClient,
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type QueryClientConfig,
} from "@tanstack/react-query";

import type { QueryKeyOptions, SetQueryDataUpdater } from "@/types/client";
import type * as Internal from "@/types/internal";

import { queryKey } from "@/lib/query-key";

/**
 * Creates a typed `QueryClient` accessor with `getQueryKey`, `setQueryData`,
 * and `invalidateQueries` shortcuts bound to the given `TPaths`. Calling the
 * accessor directly is equivalent to `getQueryClient()`.
 *
 * **SSR singleton pattern:** On the server, every call returns a fresh
 * `QueryClient` to prevent state from leaking between concurrent requests.
 * On the browser, the first call creates the client and subsequent calls
 * return the cached instance. Follows TanStack Query's SSR guidance.
 */
export function createQueryClient<TPaths extends object = object>(config?: QueryClientConfig) {
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

  function getQueryKey<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod = "get">(
    path: TPath,
    options?: QueryKeyOptions<TPaths, TPath, TMethod>,
  ) {
    return queryKey(path, options as Internal.QueryKeyOptions);
  }

  function setQueryData<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
  >({
    method,
    path,
    params,
    searchParams,
    updater,
  }: QueryKeyOptions<TPaths, TPath, TMethod> & {
    path: TPath;
    updater: SetQueryDataUpdater<ResponseBody<TPaths, TPath, TMethod>>;
  }) {
    return getQueryClient().setQueryData<ResponseBody<TPaths, TPath, TMethod>>(
      getQueryKey(path, { method, params, searchParams }),
      updater,
    );
  }

  function invalidateQueries<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
  >(
    filters: Omit<InvalidateQueryFilters, "queryKey"> &
      QueryKeyOptions<TPaths, TPath, TMethod> & {
        path: TPath;
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
