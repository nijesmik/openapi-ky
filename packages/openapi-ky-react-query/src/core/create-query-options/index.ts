import type { Client } from "@nijesmik/openapi-ky";

import { infiniteQueryOptions } from "./infinite-query-options";
import { queryOptions } from "./query-options";
import { suspenseQueryOptions } from "./suspense-query-options";

/**
 * Creates a typed factory of TanStack Query option builders bound to an
 * `openapi-ky` `Client`.
 *
 * The returned value is itself the default `queryOptions` builder. It also
 * exposes `.suspense` and `.infinite` variants for `useSuspenseQuery` and
 * `useInfiniteQuery`:
 *
 * ```ts
 * const queryOptions = createQueryOptions(client);
 *
 * useQuery(queryOptions({ path: "/posts" }));
 * useSuspenseQuery(queryOptions.suspense({ path: "/posts" }));
 * // queryOptions.infinite(...) — see TanStack Query docs for pageParam fields.
 * ```
 *
 * **TMethod default:** `method` defaults to `"get"` when omitted (query
 * semantics ≡ HTTP GET). This default is applied inside `createQueryOptions`
 * and takes precedence over any `method` configured on the `Client` via
 * `createClient`. For read endpoints that aren't `GET` (e.g. `POST /search`),
 * pass `method` explicitly per call:
 *
 * ```ts
 * queryOptions({ method: "post", path: "/search", json: { ... } });
 * ```
 *
 * **Disabling a query:** Pass `params: null` to return options with
 * `queryFn: skipToken`. TanStack Query treats this as a paused query —
 * useful when a path parameter isn't ready yet.
 *
 * For write endpoints (mutations), use `createMutationOptions` instead.
 */
export function createQueryOptions<TPaths extends object>(api: Client<TPaths>) {
  return Object.assign(queryOptions(api), {
    suspense: suspenseQueryOptions(api),
    infinite: infiniteQueryOptions(api),
  });
}
