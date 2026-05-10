---
"@nijesmik/openapi-ky-react-query": major
---

### Unified `createClient(api, queryClient?)` factory (BREAKING)

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

### Mutations

`api.mutationOptions(...)` builder and `api.useMutation(...)` hook are new. `mutate` accepts either a request body directly (when `params` is bound at create-time) or an options object.

```tsx
// body form — params bound at create-time
const { mutate } = api.useMutation({
  method: 'put',
  path: '/posts/{postId}',
  params: { postId: 1 },
});
mutate({ title: 'Updated' });          // variables IS the body

// options form — params at mutate-time
const { mutate } = api.useMutation({ method: 'put', path: '/posts/{postId}' });
mutate({ params: { postId: 1 }, json: { title: 'Updated' } });
```

If the path has `{...}` placeholders and `params` is not bound at create-time, only the options form (with `params`) compiles.

### Imperative cache helpers (moved to `createClient`)

Passing `queryClient` as the second argument to `createClient` exposes path-typed `api.getQueryKey` / `api.setQueryData` / `api.invalidateQueries`. These methods previously lived on the value returned by `createQueryClient`.

```ts
api.setQueryData({ path: '/users/{userId}', params: { userId }, updater: userData });
await api.invalidateQueries({ path: '/posts', exact: true, refetchType: 'active' });
```

### `createQueryClient` is now a pure callable (BREAKING)

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

### `params: null` disables a query

On `api.queryOptions(...)` / `api.useQuery(...)`, `params: null` swaps `queryFn` for TanStack's `skipToken`. Suspense / infinite builders always fire.

```tsx
api.useQuery({
  path: '/users/{userId}',
  params: userId ? { userId } : null,    // disabled when userId is falsy
});
```
