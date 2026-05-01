import type { Client, HttpMethod, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import { type InfiniteData } from "@tanstack/react-query";

import type {
  CreateInfiniteQueryOptions,
  CreateQueryOptions,
  CreateSuspenseQueryOptions,
} from "@/types/query";

import { buildInfiniteQueryOptions, buildQueryOptions, buildSuspenseQueryOptions } from "./builder";

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
 * **Method default:** `method` defaults to `"get"` when omitted (query
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
export function createQueryOptions<Paths extends object>(api: Client<Paths>) {
  function queryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >(options: CreateQueryOptions<Paths, Path, Method, Data>) {
    return buildQueryOptions(options, api);
  }

  function suspenseQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >(options: CreateSuspenseQueryOptions<Paths, Path, Method, Data>) {
    return buildSuspenseQueryOptions(options, api);
  }

  function infiniteQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
  >(options: CreateInfiniteQueryOptions<Paths, Path, Method, PageParam, Data>) {
    return buildInfiniteQueryOptions(options, api);
  }

  return Object.assign(queryOptions, {
    suspense: suspenseQueryOptions,
    infinite: infiniteQueryOptions,
  });
}
