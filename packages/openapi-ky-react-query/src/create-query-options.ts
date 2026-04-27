import type { Client, HttpMethod, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import {
  infiniteQueryOptions as buildInfiniteQueryOptions,
  queryOptions as buildQueryOptions,
  skipToken,
  type InfiniteData,
} from "@tanstack/react-query";

import type {
  Flat,
  InfiniteQueryOptionsParams,
  QueryOptionsParams,
  SuspenseQueryOptionsParams,
} from "./types/query";
import { buildApiOptions } from "./lib/build-api-options";
import { buildQueryKey } from "./lib/build-query-key";

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
  >(options: QueryOptionsParams<Paths, Path, Method, Data>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...queryOptions } =
      options as Flat<QueryOptionsParams<Paths, Path, Method, Data>, Paths, Path, Method>;

    if (params !== null) {
      return buildQueryOptions({
        queryKey: buildQueryKey(path, { method, params, searchParams }),
        queryFn: () =>
          api(
            path,
            buildApiOptions<Paths, Path, Method>({
              method,
              params,
              searchParams,
              kyOptions,
              json,
            }),
          ).json(),
        select,
        ...queryOptions,
      });
    }

    return buildQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>({
      queryKey: buildQueryKey(path, { method }),
      queryFn: skipToken,
    });
  }

  function suspenseQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >(options: SuspenseQueryOptionsParams<Paths, Path, Method, Data>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...queryOptions } =
      options as Flat<SuspenseQueryOptionsParams<Paths, Path, Method, Data>, Paths, Path, Method>;

    return buildQueryOptions({
      queryKey: buildQueryKey(path, { method, params, searchParams }),
      queryFn: () =>
        api(
          path,
          buildApiOptions<Paths, Path, Method>({
            method,
            params,
            searchParams,
            kyOptions,
            json,
          }),
        ).json(),
      select,
      ...queryOptions,
    });
  }

  function infiniteQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
  >(options: InfiniteQueryOptionsParams<Paths, Path, Method, PageParam, Data>) {
    const {
      path,
      method,
      params,
      searchParams,
      pageParamKey = "cursor",
      kyOptions,
      initialPageParam,
      select,
      json,
      ...queryOptions
    } = options as Flat<
      InfiniteQueryOptionsParams<Paths, Path, Method, PageParam, Data>,
      Paths,
      Path,
      Method
    >;

    return buildInfiniteQueryOptions({
      queryKey: buildQueryKey(path, { method, params, searchParams }),
      queryFn: ({ pageParam }) =>
        api(
          path,
          buildApiOptions<Paths, Path, Method>({
            method,
            params,
            searchParams: {
              ...searchParams,
              [pageParamKey]: pageParam as PageParam,
            },
            kyOptions,
            json,
          }),
        ).json(),
      initialPageParam,
      select,
      ...queryOptions,
    });
  }

  return Object.assign(queryOptions, {
    suspense: suspenseQueryOptions,
    infinite: infiniteQueryOptions,
  });
}
