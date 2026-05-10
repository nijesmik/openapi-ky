import type { HttpMethod, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";
import type { QueryClient } from "@tanstack/react-query";

import type { QueryKeyOptions } from "@/types/query-key";

import { getQueryKey } from "./get-query-key";

declare const _queryClient: QueryClient;

/**
 * Updater type extracted from `QueryClient.setQueryData<T>`'s signature.
 *
 * React Query 5 wraps the updater's `T` with `NoInfer<T>`. When `T` is a
 * deeply computed type like `ResponseBody<TPaths, TPath, TMethod>`, TypeScript
 * cannot unify `Updater<X, X>` with `Updater<NoInfer<X>, NoInfer<X>>` and
 * rejects every form of cast — including `as unknown as Updater<NoInfer<X>>`.
 * Re-using the parameter type via `Parameters<>` preserves the symbolic
 * identity of the type expression, so the call site matches without a cast.
 */
type SetQueryDataUpdater<T> = Parameters<typeof _queryClient.setQueryData<T>>[1];

export function setQueryData<TPaths extends object>(queryClient: () => QueryClient) {
  return function setQueryData<
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
    return queryClient().setQueryData<ResponseBody<TPaths, TPath, TMethod>>(
      getQueryKey(path, { method, params, searchParams }),
      updater,
    );
  };
}
