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
import { createClient } from '@nijesmik/openapi-ky';
import {
  createQueryOptions,
  createMutationOptions,
} from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

const client = createClient<paths>({ prefixUrl: 'https://api.example.com' });

export const queryOptions = createQueryOptions(client);
export const mutationOptions = createMutationOptions(client);
```

`queryOptions(...)` builds options for `useQuery`; `.suspense` and `.infinite` cover the other variants. `mutationOptions(...)` takes `method` explicitly; `.post` / `.put` / `.patch` / `.delete` shortcuts pre-bind it.

## Queries

```tsx
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery(
  queryOptions({
    path: '/users/{userId}',
    params: { userId },
    searchParams: { include: 'posts' },
    select: (response) => response.data,
    staleTime: 60_000,
  }),
);
```

`select`, `staleTime`, and any other React Query field sit alongside `path` / `params` / `searchParams`. ky-specific options (`headers`, `timeout`, `hooks`, …) go under `kyOptions`.

### `params: null` — disable the query

```tsx
const { data } = useQuery(
  queryOptions({
    path: '/users/{userId}',
    params: userId ? { userId } : null,
  }),
);
```

`params: null` swaps `queryFn` for TanStack's `skipToken`. Available on the default `queryOptions(...)` only — `.suspense` and `.infinite` always fire.

### Suspense

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

const { data } = useSuspenseQuery(
  queryOptions.suspense({ path: '/categories' }),
);
```

### Infinite

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data } = useInfiniteQuery(
  queryOptions.infinite({
    path: '/posts',
    searchParams: { categoryId, size: 10 },
    initialPageParam: undefined,
    getNextPageParam: ({ data }) =>
      data.hasNext ? data.nextCursor : undefined,
  }),
);
```

`pageParamKey` defaults to `'cursor'`. Override per call when your API uses a different key.

### Non-GET queries

For read endpoints that aren't `GET` (e.g. `POST /search`), pass `method` explicitly:

```tsx
useQuery(queryOptions({ method: 'post', path: '/search', json: { q } }));
```

## Mutations

```tsx
import { useMutation } from '@tanstack/react-query';

// Method shortcut
const { mutate: createPost } = useMutation(
  mutationOptions.post({ path: '/posts' }),
);

// Explicit method (e.g. when method is computed at runtime)
useMutation(mutationOptions({ method: someMethod, path: '/posts/{postId}' }));
```

### Static vs dynamic mode

`mutate`'s argument shape depends on whether `params` / `searchParams` are passed at create time.

**Dynamic** (default — neither `params` nor `searchParams` at create time):

```tsx
const { mutate } = useMutation(
  mutationOptions.put({ path: '/posts/{postId}' }),
);

mutate({ params: { postId: 1 }, json: { title: 'Updated' } });
```

**Static** (bind `params` and/or `searchParams` at create time):

```tsx
const { mutate } = useMutation(
  mutationOptions.put({ path: '/posts/{postId}', params: { postId: 1 } }),
);

mutate({ title: 'Updated' }); // body only
```

Passing `params` or `searchParams` to the builder switches to static mode.

## Cache — `createQueryClient`

```ts
import { createQueryClient } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

export const {
  getQueryClient,
  getQueryKey,
  setQueryData,
  invalidateQueries,
} = createQueryClient<paths>({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

// Cache key
const key = getQueryKey('/posts/{postId}', { params: { postId } });

// Update
setQueryData({
  path: '/users/{userId}',
  params: { userId },
  updater: userData,
});

// Invalidate (TanStack filter fields are flat alongside path/params)
await invalidateQueries({ path: '/posts', exact: true, refetchType: 'active' });
```

The factory's return value is callable — `queryClient()` is equivalent to `queryClient.getQueryClient()`. SSR: a fresh `QueryClient` is created per request on the server, and a closure-scoped singleton is reused on the client (TanStack's SSR singleton guidance).

## Caveats

### `ky.stop` is not compatible with this package

Both `queryOptions` and `mutationOptions` chain `.json()` internally to return parsed bodies. If a `beforeRetry` hook returns [`ky.stop`](https://github.com/sindresorhus/ky#stop), the response resolves to `undefined` and the internal `.json()` call throws `TypeError`. Upstream limitation — see [`@nijesmik/openapi-ky`](https://www.npmjs.com/package/@nijesmik/openapi-ky#caveats) for the underlying behavior.

For "stop retrying on a specific error" cases, use react-query's `retry`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { HTTPError } from 'ky';

useQuery({
  ...queryOptions({ path: '/users' }),
  retry: (failureCount, error) =>
    error instanceof HTTPError && error.response.status === 401
      ? false
      : failureCount < 3,
});
```

If you genuinely need `ky.stop`, call `client` directly outside the wrapper and handle the `undefined` case yourself.

## License

MIT
