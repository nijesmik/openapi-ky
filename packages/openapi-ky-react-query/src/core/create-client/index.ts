import type { Client } from "@nijesmik/openapi-ky";

import { createInfiniteQueryOptions } from "./create-infinite-query-options";
import { createQueryOptions } from "./create-query-options";
import { createSuspenseQueryOptions } from "./create-suspense-query-options";
import { useInfiniteQuery } from "./use-infinite-query";
import { useQuery } from "./use-query";
import { useSuspenseQuery } from "./use-suspense-query";

/**
 * Creates a typed React Query factory bound to an `openapi-ky` `Client`.
 *
 * The returned object exposes:
 * - `.queryOptions` / `.suspenseQueryOptions` / `.infiniteQueryOptions` —
 *   options builders for `useQuery` / `useSuspenseQuery` / `useInfiniteQuery`
 * - `.useQuery` / `.useSuspenseQuery` / `.useInfiniteQuery` — typed hooks,
 *   each equivalent to calling the matching TanStack hook with the matching
 *   options builder
 *
 * ```ts
 * const api = createClient(client);
 *
 * api.useQuery({ path: "/posts" });
 * api.useSuspenseQuery({ path: "/posts" });
 * api.useInfiniteQuery({ path: "/posts", initialPageParam: undefined, getNextPageParam });
 * useQuery(api.queryOptions({ path: "/posts" })); // composable form for prefetch / useQueries
 * ```
 *
 * **TMethod default:** `method` defaults to `"get"` when omitted (query
 * semantics ≡ HTTP GET). The default is applied by the options builders and
 * takes precedence over any `method` configured on the `Client` via
 * `createKyClient`. For read endpoints that aren't `GET` (e.g. `POST /search`),
 * pass `method` explicitly per call:
 *
 * ```ts
 * api.queryOptions({ method: "post", path: "/search", json: { ... } });
 * ```
 *
 * **Disabling a query:** Pass `params: null` to return options with
 * `queryFn: skipToken`. TanStack Query treats this as a disabled query —
 * useful when a path parameter isn't ready yet. Available on `.queryOptions`
 * (and `.useQuery`) only — `.suspenseQueryOptions` / `.infiniteQueryOptions`
 * and their hook counterparts always fire.
 *
 * For write endpoints (mutations), use `createMutationOptions` instead.
 */
export function createClient<TPaths extends object>(api: Client<TPaths>) {
  const queryOptions = createQueryOptions(api);
  const suspenseQueryOptions = createSuspenseQueryOptions(api);
  const infiniteQueryOptions = createInfiniteQueryOptions(api);
  return {
    queryOptions,
    suspenseQueryOptions,
    infiniteQueryOptions,
    useQuery: useQuery(queryOptions),
    useSuspenseQuery: useSuspenseQuery(suspenseQueryOptions),
    useInfiniteQuery: useInfiniteQuery(infiniteQueryOptions),
  };
}
