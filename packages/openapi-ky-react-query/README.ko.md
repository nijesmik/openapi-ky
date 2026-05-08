# @nijesmik/openapi-ky-react-query

[@nijesmik/openapi-ky](https://www.npmjs.com/package/@nijesmik/openapi-ky)를 위한 타입 세이프 React Query 옵션 빌더.

[English](./README.md)

## 설치

```bash
npm install @nijesmik/openapi-ky-react-query @nijesmik/openapi-ky @tanstack/react-query ky
```

`@nijesmik/openapi-ky`와 `@tanstack/react-query`는 peer dependency입니다. `paths` 타입은 [`openapi-typescript`](https://github.com/openapi-ts/openapi-typescript)로 OpenAPI 문서에서 생성한 뒤 아래 예제처럼 import하세요.

## 셋업

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

`queryOptions(...)`는 `useQuery` 옵션을 만들고, `.suspense`와 `.infinite`로 다른 변형을 지원합니다. `mutationOptions(...)`는 `method`를 명시하는 형태이며, `.post` / `.put` / `.patch` / `.delete` 단축 메서드는 `method`를 자동으로 주입합니다.

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

`select`, `staleTime` 등 React Query 옵션은 `path` / `params` / `searchParams`와 같은 객체에 그대로 전달합니다. ky 전용 옵션(`headers`, `timeout`, `hooks`, …)은 `kyOptions` 아래로 분리합니다.

### `params: null` — 쿼리 비활성화

```tsx
const { data } = useQuery(
  queryOptions({
    path: '/users/{userId}',
    params: userId ? { userId } : null,
  }),
);
```

`params: null`을 넘기면 `queryFn`이 TanStack의 `skipToken`으로 교체되어 쿼리가 비활성화됩니다. 기본 `queryOptions(...)`에서만 동작하며 `.suspense` / `.infinite`는 항상 fetch합니다.

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

`pageParamKey`의 기본값은 `'cursor'`입니다. 다른 키를 쓰는 API라면 호출 시 override하세요.

### Non-GET 쿼리

`GET`이 아닌 read 엔드포인트(예: `POST /search`)는 `method`를 명시합니다:

```tsx
useQuery(queryOptions({ method: 'post', path: '/search', json: { q } }));
```

## Mutations

```tsx
import { useMutation } from '@tanstack/react-query';

// 단축 메서드
const { mutate: createPost } = useMutation(
  mutationOptions.post({ path: '/posts' }),
);

// 명시 method (런타임에 method가 결정되는 경우)
useMutation(mutationOptions({ method: someMethod, path: '/posts/{postId}' }));
```

### Static vs dynamic 모드

`mutate`의 인자 형태는 create-time에 `params` / `searchParams`를 전달했는지 여부에 따라 달라집니다.

**Dynamic** (기본 — create-time에 `params`/`searchParams` 미지정):

```tsx
const { mutate } = useMutation(
  mutationOptions.put({ path: '/posts/{postId}' }),
);

mutate({ params: { postId: 1 }, json: { title: 'Updated' } });
```

**Static** (create-time에 `params` 또는 `searchParams` 지정):

```tsx
const { mutate } = useMutation(
  mutationOptions.put({ path: '/posts/{postId}', params: { postId: 1 } }),
);

mutate({ title: 'Updated' }); // body만
```

빌더에 `params` 또는 `searchParams`를 넘기면 static 모드로 전환됩니다.

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

// 캐시 키
const key = getQueryKey('/posts/{postId}', { params: { postId } });

// 갱신
setQueryData({
  path: '/users/{userId}',
  params: { userId },
  updater: userData,
});

// 무효화 (TanStack 필터 필드는 path/params와 같은 레벨에 flat으로 전달)
await invalidateQueries({ path: '/posts', exact: true, refetchType: 'active' });
```

팩토리의 반환값은 callable이라 `queryClient()`는 `queryClient.getQueryClient()`와 동일합니다. SSR: 서버에서는 매 요청마다 새 `QueryClient`를 만들고, 클라이언트에서는 클로저 스코프 싱글톤을 재사용합니다 (TanStack의 SSR singleton 가이드 따름).

## 주의사항

### `ky.stop`은 이 패키지와 호환되지 않습니다

`queryOptions`와 `mutationOptions`는 본문을 파싱해 반환하기 위해 내부적으로 `.json()`을 체이닝합니다. `beforeRetry` 훅이 [`ky.stop`](https://github.com/sindresorhus/ky#stop)을 반환하면 응답이 `undefined`로 resolve되고 내부 `.json()`에서 `TypeError`가 발생합니다. upstream 한계 — [`@nijesmik/openapi-ky`](https://www.npmjs.com/package/@nijesmik/openapi-ky#caveats)의 동일 항목 참고.

특정 에러에서 retry를 멈추고 싶다면 react-query의 `retry`를 사용하세요:

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

`ky.stop`이 꼭 필요하다면 wrapper 밖에서 `client`를 직접 호출하고 `undefined` 케이스를 처리하세요.

## 라이선스

MIT
