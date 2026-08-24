import type { Client as KyClient } from "@nijesmik/openapi-ky";
import type { QueryClient } from "@tanstack/react-query";

import type { Client, ClientHooks } from "@/types/client";

import { createInfiniteQueryOptions } from "./create-infinite-query-options";
import { createMutationOptions } from "./create-mutation-options";
import { createQueryOptions } from "./create-query-options";
import { createSuspenseQueryOptions } from "./create-suspense-query-options";
import { getQueryKey } from "./get-query-key";
import { invalidateQueries } from "./invalidate-queries";
import { setQueryData } from "./set-query-data";
import { useInfiniteQuery as createUseInfiniteQuery } from "./use-infinite-query";
import { useMutation as createUseMutation } from "./use-mutation";
import { useQuery as createUseQuery } from "./use-query";
import { useSuspenseQuery as createUseSuspenseQuery } from "./use-suspense-query";

/**
 * Creates a typed React Query factory bound to an `openapi-ky` `Client`.
 *
 * Without `queryClient`, returns hooks + options builders only.
 * With `queryClient` (a callable getter — typically `createQueryClient(config)`),
 * additionally exposes path-based imperative ops: `getQueryKey`, `setQueryData`,
 * `invalidateQueries`. The getter is invoked lazily per call to preserve SSR
 * singleton semantics.
 *
 * ```ts
 * const queryClient = createQueryClient(config);
 * const api = createClient(kyClient, queryClient);
 *
 * api.useQuery({ path: "/posts" });
 * api.invalidateQueries({ path: "/posts" });
 * ```
 *
 * **TMethod default:** `method` defaults to `"get"` when omitted on the query
 * builders. Mutation builders always require `method`.
 *
 * **Disabling a query:** Pass `params: null` to switch `queryFn` to
 * `skipToken`. Only `queryOptions` / `useQuery` honor this; suspense and
 * infinite builders always fire.
 */
export default function createClient<TPaths extends object>(
  api: KyClient<TPaths>,
): ClientHooks<TPaths>;
export default function createClient<TPaths extends object>(
  api: KyClient<TPaths>,
  queryClient: () => QueryClient,
): Client<TPaths>;
export default function createClient<TPaths extends object>(
  api: KyClient<TPaths>,
  queryClient?: () => QueryClient,
): ClientHooks<TPaths> | Client<TPaths> {
  const queryOptions = createQueryOptions(api);
  const suspenseQueryOptions = createSuspenseQueryOptions(api);
  const infiniteQueryOptions = createInfiniteQueryOptions(api);
  const mutationOptions = createMutationOptions(api);

  const hooks: ClientHooks<TPaths> = {
    queryOptions,
    suspenseQueryOptions,
    infiniteQueryOptions,
    mutationOptions,
    useQuery: createUseQuery(queryOptions),
    useSuspenseQuery: createUseSuspenseQuery(suspenseQueryOptions),
    useInfiniteQuery: createUseInfiniteQuery(infiniteQueryOptions),
    useMutation: createUseMutation(mutationOptions),
  };

  if (!queryClient) {
    return hooks;
  }

  return {
    ...hooks,
    getQueryKey,
    setQueryData: setQueryData(queryClient),
    invalidateQueries: invalidateQueries(queryClient),
  };
}
