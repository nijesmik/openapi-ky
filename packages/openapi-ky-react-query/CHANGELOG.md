# @nijesmik/openapi-ky-react-query

## 2.0.0

### Major Changes

#### Requires Node.js ≥ 22 (BREAKING)

Follows the ky v2 / `@nijesmik/openapi-ky` v2 engine requirement.

#### Empty-body responses return `undefined` instead of throwing

`queryFn` and `mutationFn` now use `safeJson` — a helper that reads `response.text()` and returns `undefined` when the body is empty, instead of throwing `SyntaxError` from `JSON.parse`. This covers `204 No Content` and any other response with an empty body.

#### `createClient` is now a default export (BREAKING)

```ts
// Before
import { createClient } from "@nijesmik/openapi-ky-react-query";

// After
import createClient from "@nijesmik/openapi-ky-react-query";
```

### Patch Changes

- Updated dependencies [5fd572d]
  - @nijesmik/openapi-ky@2.0.0

## 1.0.0

### Major Changes

#### Unified `createClient(api, queryClient?)` factory (BREAKING)

`createQueryOptions` is replaced by `createClient`, which returns one object exposing builders, matching hooks, and (when `queryClient` is provided) typed cache helpers.

```ts
// Before
import { createClient } from '@nijesmik/openapi-ky';
import { createQueryOptions } from '@nijesmik/openapi-ky-react-query';

const client = createClient<paths>({ prefixUrl: '...' });
const queryOptions = createQueryOptions(client);

useQuery(queryOptions({ path: '/posts' }));
useSuspenseQuery(queryOptions.suspense({ path: '/categories' }));
useInfiniteQuery(queryOptions.infinite({ path: '/posts', initialPageParam: undefined, getNextPageParam: ... }));

// After
import createKyClient from '@nijesmik/openapi-ky';
import { createClient, createQueryClient } from '@nijesmik/openapi-ky-react-query';

const kyClient = createKyClient<paths>({ prefixUrl: '...' });
const queryClient = createQueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
const api = createClient(kyClient, queryClient);

api.useQuery({ path: '/posts' });                                                              // hook shorthand
api.useSuspenseQuery({ path: '/categories' });
api.useInfiniteQuery({ path: '/posts', initialPageParam: undefined, getNextPageParam: ... });

useQuery(api.queryOptions({ path: '/posts' }));                                                // options form (prefetch / useQueries / etc.)
```

Renames:

- `createQueryOptions(client)` → `createClient(client)`
- `.suspense` / `.infinite` → `.suspenseQueryOptions` / `.infiniteQueryOptions` (TanStack flat naming)
- The callable form `api({ ... })` is removed — always use the explicit method (`api.queryOptions({ ... })`).

#### Mutations

`api.mutationOptions(...)` builder and `api.useMutation(...)` hook are new. `mutate` accepts either a request body directly (when `params` is bound at create-time) or an options object.

```tsx
// body form — params bound at create-time
const { mutate } = api.useMutation({
  method: "put",
  path: "/posts/{postId}",
  params: { postId: 1 },
});
mutate({ title: "Updated" }); // variables IS the body

// options form — params at mutate-time
const { mutate } = api.useMutation({ method: "put", path: "/posts/{postId}" });
mutate({ params: { postId: 1 }, json: { title: "Updated" } });
```

If the path has `{...}` placeholders and `params` is not bound at create-time, only the options form (with `params`) compiles.

#### Imperative cache helpers (moved to `createClient`)

Passing `queryClient` as the second argument to `createClient` exposes path-typed `api.getQueryKey` / `api.setQueryData` / `api.invalidateQueries`. These methods previously lived on the value returned by `createQueryClient`.

```ts
api.setQueryData({ path: "/users/{userId}", params: { userId }, updater: userData });
await api.invalidateQueries({ path: "/posts", exact: true, refetchType: "active" });
```

#### `createQueryClient` is now a pure callable (BREAKING)

`createQueryClient(config)` returns only a getter (`() => QueryClient`) implementing TanStack's SSR singleton pattern. The imperative methods (`setQueryData`, `invalidateQueries`, `getQueryKey`) and the `.getQueryClient` alias are removed; callers should use `createClient(api, queryClient)` for cache ops and call the getter directly (`queryClient()`) when an instance is needed.

```ts
// Before
const queryClient = createQueryClient<paths>(config);
queryClient.getQueryClient();
queryClient.setQueryData({ ... });
queryClient.invalidateQueries({ ... });

// After
const queryClient = createQueryClient(config);   // <paths> generic no longer needed
queryClient();                                    // get the QueryClient instance
const api = createClient(kyClient, queryClient);
api.setQueryData({ ... });                        // imperative ops live on createClient now
api.invalidateQueries({ ... });
```

#### `params: null` disables a query

On `api.queryOptions(...)` / `api.useQuery(...)`, `params: null` swaps `queryFn` for TanStack's `skipToken`. Suspense / infinite builders always fire.

```tsx
api.useQuery({
  path: "/users/{userId}",
  params: userId ? { userId } : null, // disabled when userId is falsy
});
```

### Patch Changes

- Updated dependencies
  - @nijesmik/openapi-ky@1.0.0

## ~~0.3.1~~ (deprecated)

### ~~Patch Changes~~

- ~~Update README setup examples from `API` to `createClient`~~

## ~~0.3.0~~ (deprecated)

### ~~Minor Changes~~

#### ~~Breaking Changes~~

- ~~Update `API` to `Client` type reference~~

### ~~Patch Changes~~

- ~~Updated dependencies~~
  - ~~@nijesmik/openapi-ky@0.2.0~~

## 0.2.1

### Patch Changes

- Updated dependencies
  - @nijesmik/openapi-ky@0.1.1

## 0.2.0

### Minor Changes

#### Breaking Changes

- Merge second argument into a single object parameter for `options`, `suspenseOptions`, and `infiniteOptions`
  - Before: `query.options({ path, params, select }, { staleTime })`
  - After: `query.options({ path, params, select, staleTime })`
- Extract `searchParams` and `kyOptions` as top-level parameters
  - Before: `query.options({ path, ...requestOptions })`
  - After: `query.options({ path, searchParams, kyOptions })`
- Remove `enabled` option from `suspenseOptions` (not supported by `useSuspenseQuery`)
- Move `getNextPageParam` from custom parameter to standard React Query option in `infiniteOptions` (behavior unchanged)

#### Internal

- Remove `hasParams` helper function
- Remove `Params` type import

## 0.1.0

### Minor Changes

- Initial release
