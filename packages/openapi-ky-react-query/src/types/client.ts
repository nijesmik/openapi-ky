import type { HttpMethod, Params, SearchParams } from "@nijesmik/openapi-ky";

import type { QueryClient } from "@tanstack/react-query";

export type QueryKeyOptions<Method extends HttpMethod = HttpMethod> = {
  method?: Method;
  params?: Params;
  searchParams?: SearchParams;
};

declare const _queryClient: QueryClient;

/**
 * Updater type extracted from `QueryClient.setQueryData<T>`'s signature.
 *
 * React Query 5 wraps the updater's `T` with `NoInfer<T>`. When `T` is a
 * deeply computed type like `ResponseBody<Paths, Path, Method>`, TypeScript
 * cannot unify `Updater<X, X>` with `Updater<NoInfer<X>, NoInfer<X>>` and
 * rejects every form of cast — including `as unknown as Updater<NoInfer<X>>`.
 * Re-using the parameter type via `Parameters<>` preserves the symbolic
 * identity of the type expression, so the call site matches without a cast.
 */
export type SetQueryDataUpdater<T> = Parameters<typeof _queryClient.setQueryData<T>>[1];
