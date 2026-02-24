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
import { API } from '@nijesmik/openapi-ky';
import { createQuery, createMutation } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

const api = new API<paths>({ prefixUrl: 'https://api.example.com' });

const query = createQuery(api);
const mutation = createMutation(api);
```

### Basic Query — `query.options`

```tsx
import { useQuery } from '@tanstack/react-query';

// Simple query
const { data: posts } = useQuery(
  query.options({
    path: '/posts',
    select: (response) => response.data,
  }),
);

// Query with path parameters
const { data: user } = useQuery(
  query.options({
    path: '/users/{userId}',
    params: { userId },
    select: (response) => response.data,
  }),
);
```

You can pass additional React Query options as a second argument:

```tsx
const { data } = useQuery(
  query.options(
    { path: '/posts', select: (response) => response.data },
    { staleTime: 1000 * 60 * 5 },
  ),
);
```

### Conditional Query — `params: null`

Passing `params: null` disables the query (`skipToken`).

```tsx
const { data } = useQuery(
  query.options({
    path: '/users/{userId}',
    params: userId ? { userId } : null,
    select: (response) => response.data,
  }),
);
```

### Suspense Query — `query.suspenseOptions`

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

const { data: categories } = useSuspenseQuery(
  query.suspenseOptions(
    {
      path: '/categories',
      select: (response) => response.data,
    },
    { staleTime: 1000 * 60 * 10 }, // additional options (optional)
  ),
);
```

### Infinite Query — `query.infiniteOptions`

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  query.infiniteOptions({
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
| `getNextPageParam` | Function returning next page parameter | — |

### Mutation — `mutation.options`

```tsx
import { useMutation } from '@tanstack/react-query';

// POST
const { mutate: createPost } = useMutation(
  mutation.options({
    method: 'post',
    path: '/posts',
    onSuccess: (data) => {
      router.push(`/posts/${data.data.id}`);
    },
  }),
);

createPost({ json: { title: 'Hello', content: 'World' } });

// PATCH with path params
const { mutate: updatePost } = useMutation(
  mutation.options({
    method: 'patch',
    path: '/posts/{postId}',
  }),
);

updatePost({ params: { postId: 1 }, json: { title: 'Updated' } });
```

### Cache Invalidation — `query.keyOf`

```tsx
const queryClient = useQueryClient();

// Invalidate a specific resource
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts/{postId}', {
    params: { postId },
  }),
});

// Invalidate with searchParams
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts', {
    searchParams: { categoryId },
  }),
});

// Invalidate all queries for a path
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts'),
});
```

## API

| Name | Description |
|---|---|
| `createQuery(api)` | Create query option factory |
| `createMutation(api)` | Create mutation option factory |
| `query.options(config, queryOptions?)` | Options for `useQuery` |
| `query.suspenseOptions(config, queryOptions?)` | Options for `useSuspenseQuery` |
| `query.infiniteOptions(config, queryOptions?)` | Options for `useInfiniteQuery` |
| `query.keyOf(path, { params?, searchParams? })` | Generate cache key |
| `mutation.options({ method, path, ...mutationOptions })` | Options for `useMutation` |

## License

MIT

---

## 한국어

`@nijesmik/openapi-ky`의 API 인스턴스를 받아 타입 세이프한 React Query 옵션 팩토리를 생성합니다.

### 설치

```bash
npm install @nijesmik/openapi-ky-react-query @nijesmik/openapi-ky @tanstack/react-query ky
```

> `@nijesmik/openapi-ky`와 `@tanstack/react-query`는 peer dependency입니다.

### 사용법

#### 셋업

```ts
import { API } from '@nijesmik/openapi-ky';
import { createQuery, createMutation } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

const api = new API<paths>({ prefixUrl: 'https://api.example.com' });

const query = createQuery(api);
const mutation = createMutation(api);
```

#### 기본 조회 — `query.options`

```tsx
import { useQuery } from '@tanstack/react-query';

// 파라미터 없는 단순 조회
const { data: posts } = useQuery(
  query.options({
    path: '/posts',
    select: (response) => response.data,
  }),
);

// path parameter가 있는 조회
const { data: user } = useQuery(
  query.options({
    path: '/users/{userId}',
    params: { userId },
    select: (response) => response.data,
  }),
);
```

두 번째 인자로 React Query 옵션을 추가할 수 있습니다:

```tsx
const { data } = useQuery(
  query.options(
    { path: '/posts', select: (response) => response.data },
    { staleTime: 1000 * 60 * 5 },
  ),
);
```

#### 조건부 쿼리 — `params: null`

`params: null`을 넘기면 쿼리가 비활성화됩니다 (`skipToken`).

```tsx
const { data } = useQuery(
  query.options({
    path: '/users/{userId}',
    params: userId ? { userId } : null,
    select: (response) => response.data,
  }),
);
```

#### Suspense 조회 — `query.suspenseOptions`

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

const { data: categories } = useSuspenseQuery(
  query.suspenseOptions(
    {
      path: '/categories',
      select: (response) => response.data,
    },
    { staleTime: 1000 * 60 * 10 }, // 추가 옵션 (선택)
  ),
);
```

#### 무한 스크롤 — `query.infiniteOptions`

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
  query.infiniteOptions({
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
| `getNextPageParam` | 다음 페이지 파라미터 반환 함수 | — |

#### Mutation — `mutation.options`

```tsx
import { useMutation } from '@tanstack/react-query';

// POST
const { mutate: createPost } = useMutation(
  mutation.options({
    method: 'post',
    path: '/posts',
    onSuccess: (data) => {
      router.push(`/posts/${data.data.id}`);
    },
  }),
);

createPost({ json: { title: 'Hello', content: 'World' } });

// PATCH with path params
const { mutate: updatePost } = useMutation(
  mutation.options({
    method: 'patch',
    path: '/posts/{postId}',
  }),
);

updatePost({ params: { postId: 1 }, json: { title: 'Updated' } });
```

#### 캐시 무효화 — `query.keyOf`

```tsx
const queryClient = useQueryClient();

// 특정 리소스 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts/{postId}', {
    params: { postId },
  }),
});

// searchParams로 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts', {
    searchParams: { categoryId },
  }),
});

// path 전체 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts'),
});
```

### API

| 이름 | 설명 |
|---|---|
| `createQuery(api)` | Query 옵션 팩토리 생성 |
| `createMutation(api)` | Mutation 옵션 팩토리 생성 |
| `query.options(config, queryOptions?)` | `useQuery` 옵션 |
| `query.suspenseOptions(config, queryOptions?)` | `useSuspenseQuery` 옵션 |
| `query.infiniteOptions(config, queryOptions?)` | `useInfiniteQuery` 옵션 |
| `query.keyOf(path, { params?, searchParams? })` | 캐시 키 생성 |
| `mutation.options({ method, path, ...mutationOptions })` | `useMutation` 옵션 |

### 라이선스

MIT
