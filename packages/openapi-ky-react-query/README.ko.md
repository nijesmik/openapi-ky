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

`api.queryOptions(...)`, `api.suspenseQueryOptions(...)`, `api.infiniteQueryOptions(...)`, `api.mutationOptions(...)`는 각각 대응하는 TanStack 훅의 옵션을 만듭니다. `api.useQuery(...)` / `api.useSuspenseQuery(...)` / `api.useInfiniteQuery(...)` / `api.useMutation(...)`는 편의 훅으로, 대응하는 옵션 빌더를 TanStack 훅에 그대로 넘긴 것과 동치입니다.

위처럼 `queryClient`를 전달하면 `api`는 path 타입이 적용된 캐시 헬퍼 `api.getQueryKey(...)` / `api.setQueryData(...)` / `api.invalidateQueries(...)`도 노출합니다. `queryClient`를 생략하면(`createClient(kyClient)`) 훅 전용 `api`가 됩니다.

`createQueryClient(config)`는 TanStack의 SSR singleton 패턴을 따르는 callable getter입니다 — 서버에서는 요청마다 새로 생성하고 브라우저에서는 첫 호출 후 캐시. `queryClient()`로 호출해 provider에 넘길 `QueryClient` 인스턴스를 얻습니다.

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

`select`, `staleTime` 등 React Query 옵션은 `path` / `params` / `searchParams`와 같은 객체에 그대로 전달합니다. ky 전용 옵션(`headers`, `timeout`, `hooks`, …)은 `kyOptions` 아래로 분리합니다.

prefetch, `useQueries` 등 외부 합성이 필요할 때는 옵션 형태를 사용하세요: `useQuery(api.queryOptions({ path: '/users' }))`.

### `params: null` — 쿼리 비활성화

```tsx
const { data } = api.useQuery({
  path: '/users/{userId}',
  params: userId ? { userId } : null,
});
```

`params: null`을 넘기면 `queryFn`이 TanStack의 `skipToken`으로 교체되어 쿼리가 비활성화됩니다. `api.queryOptions(...)`와 `api.useQuery(...)`에서만 동작하며 `.suspenseQueryOptions` / `.infiniteQueryOptions`는 항상 fetch합니다.

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

`pageParamKey`의 기본값은 `'cursor'`입니다. 다른 키를 쓰는 API라면 호출 시 override하세요.

### Non-GET 쿼리

`GET`이 아닌 read 엔드포인트(예: `POST /search`)는 `method`를 명시합니다:

```tsx
api.useQuery({ method: 'post', path: '/search', json: { q } });
```

## Mutations

```tsx
const { mutate: createPost } = api.useMutation({ method: 'post', path: '/posts' });
```

`mutate`는 두 가지 형태를 받습니다 — variables에 `'json'` / `'params'` / `'searchParams'` 필드가 있는지로 runtime에서 분기.

### Body 형태

```tsx
const { mutate } = api.useMutation({
  method: 'put',
  path: '/posts/{postId}',
  params: { postId: 1 },          // create-time에 바인딩
});

mutate({ title: 'Updated' });     // variables가 곧 body
```

### Options 형태

```tsx
const { mutate } = api.useMutation({ method: 'put', path: '/posts/{postId}' });

mutate({ params: { postId: 1 }, json: { title: 'Updated' } });
```

mutate-time `params` / `searchParams`는 create-time 기본값을 override 합니다.

### Compile-time path-params 강제

path가 `{...}` placeholder를 가지면서 `params`를 create-time에 바인딩하지 않으면, `params`를 포함한 options 형태만 허용됩니다 — body 형태는 컴파일 에러:

```tsx
const { mutate } = api.useMutation({ method: 'put', path: '/posts/{postId}' });

mutate({ title: 'x' });           // ❌ TS error — params 필수
mutate({ json: { title: 'x' }, params: { postId: 1 } });  // ✅
```

## 캐시 헬퍼

`createClient`에 `queryClient`를 전달하면([셋업](#셋업) 참고), `api`가 path 타입이 적용된 직접 캐시 접근 헬퍼를 노출합니다:

```ts
// 캐시 키
const key = api.getQueryKey('/posts/{postId}', { params: { postId } });

// 갱신
api.setQueryData({
  path: '/users/{userId}',
  params: { userId },
  updater: userData,
});

// 무효화 (TanStack 필터 필드는 path/params와 같은 레벨에 flat으로 전달)
await api.invalidateQueries({ path: '/posts', exact: true, refetchType: 'active' });
```

GET이 아닌 캐시 엔트리는 `path` / `params`와 함께 `method`를 명시합니다. 생략 시 `'get'` 기본값.

## 주의사항

### `ky.stop`은 이 패키지와 호환되지 않습니다

`api`의 모든 헬퍼(`api.queryOptions(...)`, `api.suspenseQueryOptions(...)`, `api.infiniteQueryOptions(...)`, `api.mutationOptions(...)`, `api.useQuery(...)`, `api.useSuspenseQuery(...)`, `api.useInfiniteQuery(...)`, `api.useMutation(...)`)는 본문을 파싱해 반환하기 위해 내부적으로 `.json()`을 체이닝합니다. `beforeRetry` 훅이 [`ky.stop`](https://github.com/sindresorhus/ky#stop)을 반환하면 응답이 `undefined`로 resolve되고 내부 `.json()`에서 `TypeError`가 발생합니다. upstream 한계 — [`@nijesmik/openapi-ky`](https://www.npmjs.com/package/@nijesmik/openapi-ky#caveats)의 동일 항목 참고.

특정 에러에서 retry를 멈추고 싶다면 react-query의 `retry`를 사용하세요:

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

`ky.stop`이 꼭 필요하다면 wrapper 밖에서 `kyClient`를 직접 호출하고 `undefined` 케이스를 처리하세요.

### 본문 필드명이 `json` / `params` / `searchParams`인 경우

`mutate`는 variables 최상위에 `'json'` / `'params'` / `'searchParams'` 필드 유무로 body 형태와 options 형태를 분기합니다. 만약 endpoint의 request body가 우연히 이 이름을 최상위 필드로 가진다면 (실무에선 드뭄), body 형태가 options 형태로 잘못 dispatch됩니다. 우회: 해당 endpoint에서는 항상 options 형태를 명시적으로 사용 — `mutate({ json: { yourBody } })`.

## 라이선스

MIT
