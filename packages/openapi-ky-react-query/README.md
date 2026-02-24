# @nijesmik/openapi-ky-react-query

`@nijesmik/openapi-ky`의 API 인스턴스를 받아 타입 세이프한 React Query 옵션 팩토리를 생성합니다.

## Installation

```bash
npm install @nijesmik/openapi-ky-react-query @nijesmik/openapi-ky @tanstack/react-query ky
```

> `@nijesmik/openapi-ky`와 `@tanstack/react-query`는 peer dependency입니다.

## Usage

### 셋업

```ts
import { API } from '@nijesmik/openapi-ky';
import { createQuery, createMutation } from '@nijesmik/openapi-ky-react-query';
import type { paths } from './schema';

const api = new API<paths>({ prefixUrl: 'https://api.example.com' });

const query = createQuery(api);
const mutation = createMutation(api);
```

### 기본 조회 — `query.options`

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

### 조건부 쿼리 — `params: null`

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

### Suspense 조회 — `query.suspenseOptions`

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';

const { data: categories } = useSuspenseQuery(
  query.suspenseOptions({
    path: '/categories',
    select: (response) => response.data,
  }),
);
```

### 무한 스크롤 — `query.infiniteOptions`

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

### 캐시 무효화 — `query.keyOf`

```tsx
const queryClient = useQueryClient();

// 특정 리소스 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts/{postId}', {
    params: { postId },
  }),
});

// path 전체 캐시 무효화
await queryClient.invalidateQueries({
  queryKey: query.keyOf('/posts'),
});
```

## API

| 이름 | 설명 |
|---|---|
| `createQuery(api)` | Query 옵션 팩토리 생성 |
| `createMutation(api)` | Mutation 옵션 팩토리 생성 |
| `query.options({ path, params?, select? })` | `useQuery` 옵션 |
| `query.suspenseOptions({ path, select? })` | `useSuspenseQuery` 옵션 |
| `query.infiniteOptions({ path, searchParams, ... })` | `useInfiniteQuery` 옵션 |
| `query.keyOf(path, { params? })` | 캐시 키 생성 |
| `mutation.options({ method, path })` | `useMutation` 옵션 |

## License

MIT
