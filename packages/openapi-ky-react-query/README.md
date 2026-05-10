# @nijesmik/openapi-ky-react-query

Type-safe React Query option builders for [@nijesmik/openapi-ky](https://www.npmjs.com/package/@nijesmik/openapi-ky).

[한국어](./README.ko.md)

## Install

```bash
npm install @nijesmik/openapi-ky-react-query @nijesmik/openapi-ky @tanstack/react-query ky
```

`@nijesmik/openapi-ky` and `@tanstack/react-query` are peer dependencies. Generate the `paths` type from your OpenAPI document with [`openapi-typescript`](https://github.com/openapi-ts/openapi-typescript) and import it as shown below.

## Setup

```ts
import createKyClient from '@nijesmik/openapi-ky';
import { createClient, createQueryClient } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

const kyClient = createKyClient<paths>({ prefixUrl: 'https://api.example.com' });
export const queryClient = createQueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});
export const api = createClient(kyClient, queryClient);
```

```tsx
import { QueryClientProvider } from '@tanstack/react-query';

<QueryClientProvider client={queryClient()}>
  <App />
</QueryClientProvider>;
```

`api.queryOptions(...)`, `api.suspenseQueryOptions(...)`, `api.infiniteQueryOptions(...)`, and `api.mutationOptions(...)` build typed options for the matching TanStack hooks. `api.useQuery(...)` / `api.useSuspenseQuery(...)` / `api.useInfiniteQuery(...)` / `api.useMutation(...)` are convenience hooks — each equivalent to passing the matching options builder to the matching TanStack hook.

When `queryClient` is passed (as above), `api` also gets path-typed cache helpers `api.getQueryKey(...)` / `api.setQueryData(...)` / `api.invalidateQueries(...)`. Omit `queryClient` (`createClient(kyClient)`) for a hooks-only `api`.

`createQueryClient(config)` is a callable getter following TanStack's SSR singleton pattern: server-fresh per request, browser-cached after first call. Invoke it (`queryClient()`) to obtain the underlying `QueryClient` for the provider.

## Queries

```tsx
const { data } = api.useQuery({
  path: '/users/{userId}',
  params: { userId },
  searchParams: { include: 'posts' },
  select: (response) => response.data,
  staleTime: 60_000,
});
```

`select`, `staleTime`, and any other React Query field sit alongside `path` / `params` / `searchParams`. ky-specific options (`headers`, `timeout`, `hooks`, …) go under `kyOptions`.

For external composition (prefetch, `useQueries`, etc.), use the options form: `useQuery(api.queryOptions({ path: '/users' }))`.

### `params: null` — disable the query

```tsx
const { data } = api.useQuery({
  path: '/users/{userId}',
  params: userId ? { userId } : null,
});
```

`params: null` swaps `queryFn` for TanStack's `skipToken`. Available on `api.queryOptions(...)` and `api.useQuery(...)` only — `.suspenseQueryOptions` and `.infiniteQueryOptions` always fire.

### Suspense

```tsx
const { data } = api.useSuspenseQuery({ path: '/categories' });
```

### Infinite

```tsx
const { data } = api.useInfiniteQuery({
  path: '/posts',
  searchParams: { categoryId, size: 10 },
  initialPageParam: undefined,
  getNextPageParam: ({ data }) =>
    data.hasNext ? data.nextCursor : undefined,
});
```

`pageParamKey` defaults to `'cursor'`. Override per call when your API uses a different key.

### Non-GET queries

For read endpoints that aren't `GET` (e.g. `POST /search`), pass `method` explicitly:

```tsx
api.useQuery({ method: 'post', path: '/search', json: { q } });
```

## Mutations

```tsx
const { mutate: createPost } = api.useMutation({ method: 'post', path: '/posts' });
```

`mutate` accepts two forms — discriminated at runtime by the presence of `'json'` / `'params'` / `'searchParams'` fields.

### Body form

```tsx
const { mutate } = api.useMutation({
  method: 'put',
  path: '/posts/{postId}',
  params: { postId: 1 },          // bound at create-time
});

mutate({ title: 'Updated' });     // variables IS body
```

### Options form

```tsx
const { mutate } = api.useMutation({ method: 'put', path: '/posts/{postId}' });

mutate({ params: { postId: 1 }, json: { title: 'Updated' } });
```

Mutate-time `params` / `searchParams` override the create-time defaults.

### Compile-time path-params enforcement

If the path requires `{...}` placeholders and `params` are not bound at create-time, only the options form with `params` is accepted — the body form is rejected at compile time:

```tsx
const { mutate } = api.useMutation({ method: 'put', path: '/posts/{postId}' });

mutate({ title: 'x' });           // ❌ TS error — params required
mutate({ json: { title: 'x' }, params: { postId: 1 } });  // ✅
```

## Cache helpers

When `createClient` is given a `queryClient` (see [Setup](#setup)), `api` exposes path-typed helpers for direct cache access:

```ts
// Cache key
const key = api.getQueryKey('/posts/{postId}', { params: { postId } });

// Update
api.setQueryData({
  path: '/users/{userId}',
  params: { userId },
  updater: userData,
});

// Invalidate (TanStack filter fields are flat alongside path/params)
await api.invalidateQueries({ path: '/posts', exact: true, refetchType: 'active' });
```

For non-GET cache entries, pass `method` alongside `path` / `params`. Defaults to `'get'` when omitted.

## Caveats

### `ky.stop` is not compatible with this package

All of `api`'s helpers (`api.queryOptions(...)`, `api.suspenseQueryOptions(...)`, `api.infiniteQueryOptions(...)`, `api.mutationOptions(...)`, `api.useQuery(...)`, `api.useSuspenseQuery(...)`, `api.useInfiniteQuery(...)`, `api.useMutation(...)`) chain `.json()` internally to return parsed bodies. If a `beforeRetry` hook returns [`ky.stop`](https://github.com/sindresorhus/ky#stop), the response resolves to `undefined` and the internal `.json()` call throws `TypeError`. Upstream limitation — see [`@nijesmik/openapi-ky`](https://www.npmjs.com/package/@nijesmik/openapi-ky#caveats) for the underlying behavior.

For "stop retrying on a specific error" cases, use react-query's `retry`:

```tsx
import { HTTPError } from 'ky';

api.useQuery({
  path: '/users',
  retry: (failureCount, error) =>
    error instanceof HTTPError && error.response.status === 401
      ? false
      : failureCount < 3,
});
```

If you genuinely need `ky.stop`, call `kyClient` directly outside the wrapper and handle the `undefined` case yourself.

### Mutation body fields named `json` / `params` / `searchParams`

`mutate` discriminates body form vs options form by the presence of `'json'` / `'params'` / `'searchParams'` keys at the top level of the variables. If your endpoint's request body happens to have one of these as a top-level field name (rare in practice), the body form would be misdispatched as the options form. Workaround: always use the options form explicitly — `mutate({ json: { yourBody } })` — for that endpoint.

## License

MIT
