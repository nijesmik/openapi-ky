# @nijesmik/openapi-ky-react-query

Type-safe [React Query](https://tanstack.com/query) option factories for [@nijesmik/openapi-ky](https://www.npmjs.com/package/@nijesmik/openapi-ky).

[한국어](#한국어)

## Installation

```bash
npm install @nijesmik/openapi-ky-react-query @nijesmik/openapi-ky @tanstack/react-query ky
```

> `@nijesmik/openapi-ky` and `@tanstack/react-query` are peer dependencies.

## Usage

### Setup

```ts
import { createClient } from '@nijesmik/openapi-ky';
import { createQueryOptions, createMutationOptions } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

const client = createClient<paths>({ prefixUrl: 'https://api.example.com' });

const queryOptions = createQueryOptions(client);
const mutationOptions = createMutationOptions(client);
```

> Both factories return a **callable object**. Calling `queryOptions(...)` produces options for `useQuery`; method properties (`.suspense`, `.infinite`) cover the other query variants. `mutationOptions(...)` accepts `method` explicitly, and shortcut properties (`.post`, `.put`, `.patch`, `.delete`) inject the method for you.

### Query Client — `createQueryClient`

A factory for cache access bound to a specific OpenAPI schema. Pass `paths` as the generic to get type-safe `getQueryKey`, `setQueryData`, `invalidateQueries` helpers alongside an environment-aware `getQueryClient` (a new `QueryClient` per request on the server, a closure-scoped singleton on the client).

The return value is a **callable object**: calling it (`queryClient()`) returns the underlying `QueryClient`, and the same function is also exposed as the `.getQueryClient` property for destructuring.

```ts
// app/query-client.ts
import { createQueryClient } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

// Destructure
export const {
  getQueryClient,
  getQueryKey,
  setQueryData,
  invalidateQueries,
} = createQueryClient<paths>({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

// Or keep as single export and use dot-access / call syntax
export const queryClient = createQueryClient<paths>();
// queryClient() === queryClient.getQueryClient()
```

```ts
// getQueryClient — SSR-safe access
const queryClient = getQueryClient();

// getQueryKey — type-safe cache key
const key = getQueryKey('/posts/{postId}', { params: { postId } });

// setQueryData — type-safe cache update
setQueryData({
  path: '/users/{userId}',
  params: { userId },
  data: userData,
});

// with updater function
setQueryData({
  path: '/posts',
  data: (old) => [...(old ?? []), newPost],
});

// invalidateQueries — invalidate all queries under a path
await invalidateQueries({ path: '/posts' });

// specific resource
await invalidateQueries({ path: '/posts/{postId}', params: { postId } });

// with TanStack filters / options (flattened)
await invalidateQueries({ path: '/posts', exact: true, refetchType: 'active' });
```

`config` is `QueryClientConfig` from `@tanstack/react-query`. It is captured in the factory's closure and passed to every `new QueryClient(config)` the factory creates — each server request, and the first client-side call (reused thereafter).

### Basic Query — `queryOptions(...)`

```tsx
import { useQuery } from '@tanstack/react-query';

// Simple query
const { data } = useQuery(
  queryOptions({ path: '/posts' }),
);

// Query with path parameters
const { data: user } = useQuery(
  queryOptions({
    path: '/users/{userId}',
    params: { userId },
  }),
);

// Query with search parameters
const { data: filtered } = useQuery(
  queryOptions({
    path: '/posts',
    searchParams: { categoryId, size: 10 },
  }),
);
```

You can pass `select`, `staleTime`, and other React Query options in the same object.
Use `kyOptions` for ky-specific settings like `headers` or `timeout`:

```tsx
const { data } = useQuery(
  queryOptions({
    path: '/posts',
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
    kyOptions: { headers: { 'X-Custom': 'value' } },
  }),
);
```

### Conditional Query — `params: null`

Passing `params: null` disables the query (`skipToken`).

```tsx
const { data } = useQuery(
  queryOptions({
    path: '/users/{userId}',
    params: userId ? { userId } : null,
  }),
);
```

### Suspense Query — `queryOptions.suspense`

`useSuspenseQuery` does not support `enabled` or `skipToken`, so `params: null` is not allowed.
Use this when data should always be fetched:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

const { data: categories } = useSuspenseQuery(
  queryOptions.suspense({
    path: '/categories',
    staleTime: 1000 * 60 * 10,
  }),
);
```

### Infinite Query — `queryOptions.infinite`

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  queryOptions.infinite({
    path: '/posts',
    searchParams: { categoryId, size: 10 },
    initialPageParam: undefined,
    getNextPageParam: ({ data }) =>
      data.hasNext ? data.nextCursor : undefined,
    select: (data) => data.pages.flatMap((page) => page.data.content),
  }),
);
```

| Option | Description | Default |
|---|---|---|
| `searchParams` | Query string parameters | — |
| `pageParamKey` | Pagination key name | `'cursor'` |
| `initialPageParam` | First page parameter | — |

### Mutation — `mutationOptions(...)` / `mutationOptions.<method>`

`mutationOptions` accepts an explicit `method`; `.post` / `.put` / `.patch` / `.delete` shortcuts inject the method for you.

```tsx
import { useMutation } from '@tanstack/react-query';

// POST — shortcut
const { mutate: createPost } = useMutation(
  mutationOptions.post({
    path: '/posts',
    onSuccess: (data) => {
      router.push(`/posts/${data.data.id}`);
    },
  }),
);

createPost({ json: { title: 'Hello', content: 'World' } });

// PATCH — shortcut with path params
const { mutate: updatePost } = useMutation(
  mutationOptions.patch({ path: '/posts/{postId}' }),
);

updatePost({ params: { postId: 1 }, json: { title: 'Updated' } });

// Explicit method (useful when method is dynamic)
const { mutate } = useMutation(
  mutationOptions({ method, path: '/posts/{postId}' }),
);
```

### Cache Invalidation

Use `getQueryKey` from `createQueryClient` to build a key for a path.

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from './query-client';

const queryClient = useQueryClient();

// Invalidate a specific resource
await queryClient.invalidateQueries({
  queryKey: getQueryKey('/posts/{postId}', { params: { postId } }),
});

// Invalidate with searchParams
await queryClient.invalidateQueries({
  queryKey: getQueryKey('/posts', { searchParams: { categoryId } }),
});

// Invalidate all queries for a path
await queryClient.invalidateQueries({
  queryKey: getQueryKey('/posts'),
});
```

For most cases, prefer `invalidateQueries` from `createQueryClient` directly — see [Query Client](#query-client--createqueryclient) above.

## Caveats

### `ky.stop` is not compatible with this package

`queryOptions` and `mutationOptions` internally chain `.json()` to return the parsed body. If a `beforeRetry` hook returns [`ky.stop`](https://github.com/sindresorhus/ky#stop), the response resolves to `undefined`, and the internal `.json()` call throws `TypeError: Cannot read properties of undefined` from inside the wrapper.

This is an [upstream ky limitation](https://github.com/sindresorhus/ky#stop) — see the note in [`@nijesmik/openapi-ky`](https://www.npmjs.com/package/@nijesmik/openapi-ky#handling-responses).

For most "stop retrying on a specific error" cases, prefer react-query's built-in retry control:

```ts
import { useQuery } from '@tanstack/react-query';
import { HTTPError } from 'ky';

useQuery({
  ...queryOptions({ path: '/users' }),
  retry: (failureCount, error) => {
    if (error instanceof HTTPError && error.response.status === 401) {
      return false; // don't retry on 401
    }
    return failureCount < 3;
  },
});
```

If you genuinely need `ky.stop`, call the `client` method directly outside the wrapper and handle the `undefined` case yourself.

## API

| Name | Description |
|---|---|
| `createQueryOptions(client)` | Create query options factory (callable + `.suspense` + `.infinite`) |
| `createMutationOptions(client)` | Create mutation options factory (callable + `.post` / `.put` / `.patch` / `.delete`) |
| `createQueryClient<Paths>(config?)` | Create `{ getQueryClient, getQueryKey, setQueryData, invalidateQueries }` bound to `Paths` |
| `getQueryClient()` | SSR-safe `QueryClient` accessor (singleton on client, new on server) |
| `getQueryKey(path, { params?, searchParams? })` | Type-safe query key for a path |
| `setQueryData({ path, params?, searchParams?, data })` | Type-safe cache update |
| `invalidateQueries({ path, params?, searchParams?, ...filters })` | Type-safe cache invalidation (accepts TanStack filter + option fields) |
| `queryOptions({ path, params?, searchParams?, kyOptions?, select?, ...queryOptions })` | Options for `useQuery` |
| `queryOptions.suspense({ path, params?, searchParams?, kyOptions?, select?, ...queryOptions })` | Options for `useSuspenseQuery` |
| `queryOptions.infinite({ path, params?, searchParams?, pageParamKey?, kyOptions?, initialPageParam, ...queryOptions })` | Options for `useInfiniteQuery` |
| `mutationOptions({ method, path, ...mutationOptions })` | Options for `useMutation` (explicit method) |
| `mutationOptions.<post\|put\|patch\|delete>({ path, ...mutationOptions })` | Options for `useMutation` (method shortcut) |

## License

MIT

---

## 한국어

[@nijesmik/openapi-ky](https://www.npmjs.com/package/@nijesmik/openapi-ky)를 위한 타입 세이프한 [React Query](https://tanstack.com/query) 옵션 팩토리입니다.

### 설치

```bash
npm install @nijesmik/openapi-ky-react-query @nijesmik/openapi-ky @tanstack/react-query ky
```

> `@nijesmik/openapi-ky`와 `@tanstack/react-query`는 peer dependency입니다.

### 사용법

#### 셋업

```ts
import { createClient } from '@nijesmik/openapi-ky';
import { createQueryOptions, createMutationOptions } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

const client = createClient<paths>({ prefixUrl: 'https://api.example.com' });

const queryOptions = createQueryOptions(client);
const mutationOptions = createMutationOptions(client);
```

> 두 팩토리 모두 **callable object**를 반환합니다. `queryOptions(...)`는 `useQuery`용 옵션을 만들고, `.suspense`, `.infinite` 메서드로 다른 쿼리 변형을 지원합니다. `mutationOptions(...)`는 `method`를 명시하는 형태이고, `.post`, `.put`, `.patch`, `.delete` 단축 메서드는 `method`를 자동으로 채워줍니다.

#### Query Client — `createQueryClient`

특정 OpenAPI 스키마에 바인딩된 캐시 접근 팩토리입니다. `paths`를 제네릭으로 전달하면 타입 세이프한 `getQueryKey`, `setQueryData`, `invalidateQueries` 헬퍼와 환경별로 동작하는 `getQueryClient`를 함께 얻을 수 있습니다 (서버에서는 요청마다 새 `QueryClient`, 클라이언트에서는 클로저 스코프 싱글톤).

리턴 값은 **callable object**입니다. 함수로 호출(`queryClient()`)하면 내부 `QueryClient`를 반환하고, 같은 함수가 `.getQueryClient` 프로퍼티로도 노출되어 구조분해도 가능합니다.

```ts
// app/query-client.ts
import { createQueryClient } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

// 구조분해
export const {
  getQueryClient,
  getQueryKey,
  setQueryData,
  invalidateQueries,
} = createQueryClient<paths>({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

// 또는 단일 export + dot-access/호출 형태
export const queryClient = createQueryClient<paths>();
// queryClient() === queryClient.getQueryClient()
```

```ts
// getQueryClient — SSR-safe 접근
const queryClient = getQueryClient();

// getQueryKey — 타입 세이프 캐시 키
const key = getQueryKey('/posts/{postId}', { params: { postId } });

// setQueryData — 타입 세이프 캐시 갱신
setQueryData({
  path: '/users/{userId}',
  params: { userId },
  data: userData,
});

// updater 함수 사용
setQueryData({
  path: '/posts',
  data: (old) => [...(old ?? []), newPost],
});

// invalidateQueries — path 하위 전체 무효화
await invalidateQueries({ path: '/posts' });

// 특정 리소스
await invalidateQueries({ path: '/posts/{postId}', params: { postId } });

// TanStack 필터/옵션은 flat으로 함께 전달
await invalidateQueries({ path: '/posts', exact: true, refetchType: 'active' });
```

`config`는 `@tanstack/react-query`의 `QueryClientConfig`입니다. 팩토리 클로저에 캡처되어 매 `new QueryClient(config)` 호출에 전달됩니다 — 서버는 매 요청마다, 클라이언트는 최초 호출 시 한 번 생성 후 재사용.

#### 기본 조회 — `queryOptions(...)`

```tsx
import { useQuery } from '@tanstack/react-query';

// 파라미터 없는 단순 조회
const { data } = useQuery(
  queryOptions({ path: '/posts' }),
);

// path parameter가 있는 조회
const { data: user } = useQuery(
  queryOptions({
    path: '/users/{userId}',
    params: { userId },
  }),
);

// search parameter가 있는 조회
const { data: filtered } = useQuery(
  queryOptions({
    path: '/posts',
    searchParams: { categoryId, size: 10 },
  }),
);
```

`select`, `staleTime` 등 React Query 옵션을 같은 객체에 직접 전달할 수 있습니다.
`kyOptions`로 `headers`, `timeout` 등 ky 전용 설정을 지정합니다:

```tsx
const { data } = useQuery(
  queryOptions({
    path: '/posts',
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
    kyOptions: { headers: { 'X-Custom': 'value' } },
  }),
);
```

#### 조건부 쿼리 — `params: null`

`params: null`을 넘기면 쿼리가 비활성화됩니다 (`skipToken`).

```tsx
const { data } = useQuery(
  queryOptions({
    path: '/users/{userId}',
    params: userId ? { userId } : null,
  }),
);
```

#### Suspense 조회 — `queryOptions.suspense`

`useSuspenseQuery`는 `enabled`와 `skipToken`을 지원하지 않으므로 `params: null`이 허용되지 않습니다.
데이터를 항상 fetch해야 하는 경우에 사용합니다:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

const { data: categories } = useSuspenseQuery(
  queryOptions.suspense({
    path: '/categories',
    staleTime: 1000 * 60 * 10,
  }),
);
```

#### 무한 스크롤 — `queryOptions.infinite`

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  queryOptions.infinite({
    path: '/posts',
    searchParams: { categoryId, size: 10 },
    initialPageParam: undefined,
    getNextPageParam: ({ data }) =>
      data.hasNext ? data.nextCursor : undefined,
    select: (data) => data.pages.flatMap((page) => page.data.content),
  }),
);
```

| 옵션 | 설명 | 기본값 |
|---|---|---|
| `searchParams` | 쿼리스트링 파라미터 | — |
| `pageParamKey` | 페이지네이션 키 이름 | `'cursor'` |
| `initialPageParam` | 첫 페이지 파라미터 | — |

#### Mutation — `mutationOptions(...)` / `mutationOptions.<method>`

`mutationOptions`는 `method`를 명시하는 형태이고, `.post` / `.put` / `.patch` / `.delete` 단축 메서드는 `method`를 자동으로 채워줍니다.

```tsx
import { useMutation } from '@tanstack/react-query';

// POST — 단축 메서드
const { mutate: createPost } = useMutation(
  mutationOptions.post({
    path: '/posts',
    onSuccess: (data) => {
      router.push(`/posts/${data.data.id}`);
    },
  }),
);

createPost({ json: { title: 'Hello', content: 'World' } });

// PATCH — path 파라미터가 있는 단축 메서드
const { mutate: updatePost } = useMutation(
  mutationOptions.patch({ path: '/posts/{postId}' }),
);

updatePost({ params: { postId: 1 }, json: { title: 'Updated' } });

// method를 명시 (method가 동적인 경우 유용)
const { mutate } = useMutation(
  mutationOptions({ method, path: '/posts/{postId}' }),
);
```

#### 캐시 무효화

`createQueryClient`의 `getQueryKey`로 path에 대한 키를 만들어 사용합니다.

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from './query-client';

const queryClient = useQueryClient();

// 특정 리소스 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: getQueryKey('/posts/{postId}', { params: { postId } }),
});

// searchParams로 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: getQueryKey('/posts', { searchParams: { categoryId } }),
});

// path 전체 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: getQueryKey('/posts'),
});
```

대부분의 경우 `createQueryClient`의 `invalidateQueries`를 직접 사용하는 것이 더 간단합니다 — 위 [Query Client](#query-client--createqueryclient-1) 섹션 참고.

### 주의사항

#### `ky.stop`은 이 패키지와 호환되지 않습니다

`queryOptions`와 `mutationOptions`는 본문을 파싱해 반환하기 위해 내부적으로 `.json()`을 체이닝합니다. `beforeRetry` 훅이 [`ky.stop`](https://github.com/sindresorhus/ky#stop)을 반환하면 응답이 `undefined`로 resolve되고, 래퍼 내부의 `.json()` 호출에서 `TypeError: Cannot read properties of undefined`가 발생합니다.

이는 [ky 자체의 한계](https://github.com/sindresorhus/ky#stop)이며, [`@nijesmik/openapi-ky`](https://www.npmjs.com/package/@nijesmik/openapi-ky#한국어)의 응답 처리 섹션도 참고하세요.

특정 에러에서 retry를 멈추고 싶다면 react-query의 내장 retry 제어를 사용하는 것이 더 자연스럽습니다:

```ts
import { useQuery } from '@tanstack/react-query';
import { HTTPError } from 'ky';

useQuery({
  ...queryOptions({ path: '/users' }),
  retry: (failureCount, error) => {
    if (error instanceof HTTPError && error.response.status === 401) {
      return false; // 401에서는 retry 중단
    }
    return failureCount < 3;
  },
});
```

`ky.stop`이 꼭 필요한 경우 래퍼 밖에서 `client` 메서드를 직접 호출하고 `undefined` 케이스를 처리하세요.

### API

| 이름 | 설명 |
|---|---|
| `createQueryOptions(client)` | Query 옵션 팩토리 (callable + `.suspense` + `.infinite`) |
| `createMutationOptions(client)` | Mutation 옵션 팩토리 (callable + `.post` / `.put` / `.patch` / `.delete`) |
| `createQueryClient<Paths>(config?)` | `Paths`에 바인딩된 `{ getQueryClient, getQueryKey, setQueryData, invalidateQueries }` 생성 |
| `getQueryClient()` | SSR-safe `QueryClient` 접근자 (클라이언트는 싱글톤, 서버는 매번 새로) |
| `getQueryKey(path, { params?, searchParams? })` | 경로에 대한 타입 세이프 캐시 키 |
| `setQueryData({ path, params?, searchParams?, data })` | 타입 세이프 캐시 갱신 |
| `invalidateQueries({ path, params?, searchParams?, ...filters })` | 타입 세이프 캐시 무효화 (TanStack 필터/옵션 함께 전달) |
| `queryOptions({ path, params?, searchParams?, kyOptions?, select?, ...queryOptions })` | `useQuery` 옵션 |
| `queryOptions.suspense({ path, params?, searchParams?, kyOptions?, select?, ...queryOptions })` | `useSuspenseQuery` 옵션 |
| `queryOptions.infinite({ path, params?, searchParams?, pageParamKey?, kyOptions?, initialPageParam, ...queryOptions })` | `useInfiniteQuery` 옵션 |
| `mutationOptions({ method, path, ...mutationOptions })` | `useMutation` 옵션 (method 명시) |
| `mutationOptions.<post\|put\|patch\|delete>({ path, ...mutationOptions })` | `useMutation` 옵션 (method 단축) |

### 라이선스

MIT
