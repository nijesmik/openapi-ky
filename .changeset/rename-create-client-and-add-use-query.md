---
"@nijesmik/openapi-ky": minor
"@nijesmik/openapi-ky-react-query": minor
---

### Breaking Changes / 호환성 깨짐

#### `createClient` → `createKyClient` (`@nijesmik/openapi-ky`)

ky 기반 client factory를 `createClient`에서 `createKyClient`로 rename. `@nijesmik/openapi-ky-react-query`가 노출하는 새 `createClient` factory와 import 이름 충돌을 막기 위함.

```ts
// Before
import { createClient } from '@nijesmik/openapi-ky';

// After
import { createKyClient } from '@nijesmik/openapi-ky';
```

#### `createQueryOptions` → `createClient` + flat naming + React Query hooks 추가 (`@nijesmik/openapi-ky-react-query`)

`createQueryOptions(client)`가 `createClient(client)`로 rename. 반환은 plain object — callable 형태(`api({ ... })`)는 제거되고 `api.queryOptions({ ... })`로 대체. `.suspense` / `.infinite`도 `.suspenseQueryOptions` / `.infiniteQueryOptions`로 rename (TanStack의 flat naming과 정렬). `useQuery` / `useSuspenseQuery` / `useInfiniteQuery` 메서드 추가 — 각 옵션 빌더를 대응하는 TanStack 훅에 그대로 넘긴 것과 동치이며, hook을 직접 import 하지 않고 `api`에서 바로 호출 가능.

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
import { createKyClient } from '@nijesmik/openapi-ky';
import { createClient } from '@nijesmik/openapi-ky-react-query';

const client = createKyClient<paths>({ prefixUrl: '...' });
const api = createClient(client);

api.useQuery({ path: '/posts' });                                                              // hook 단축형
api.useSuspenseQuery({ path: '/categories' });
api.useInfiniteQuery({ path: '/posts', initialPageParam: undefined, getNextPageParam: ... });

useQuery(api.queryOptions({ path: '/posts' }));                                                // 옵션 형태 (prefetch / useQueries 등)
```

### Renames

In `@nijesmik/openapi-ky`, the ky-based client factory is renamed from `createClient` to `createKyClient` to avoid an import-name collision with the new `createClient` exported from `@nijesmik/openapi-ky-react-query`.

In `@nijesmik/openapi-ky-react-query`, `createQueryOptions` is renamed to `createClient`. The returned value is now a plain object — the callable form (`api({ ... })`) is removed in favor of an explicit `api.queryOptions({ ... })` method, and `.suspense` / `.infinite` are renamed to `.suspenseQueryOptions` / `.infiniteQueryOptions` to align with TanStack Query's flat naming. `useQuery`, `useSuspenseQuery`, and `useInfiniteQuery` convenience methods are added — each equivalent to passing the matching options builder to the matching TanStack hook.
