---
"@nijesmik/openapi-ky": minor
"@nijesmik/openapi-ky-react-query": minor
---

### Breaking Changes / 호환성 깨짐

#### `createClient`를 default export로 (`@nijesmik/openapi-ky`)

ky 기반 client factory를 named export(`{ createClient }`)에서 default export로 변경. `@nijesmik/openapi-ky-react-query`가 같은 이름의 `createClient`를 named export하기 때문에, default로 노출해 import 시점에 자유롭게 이름 지정할 수 있도록 함.

```ts
// Before
import { createClient } from '@nijesmik/openapi-ky';

// After (예: 단독 사용)
import createClient from '@nijesmik/openapi-ky';

// After (예: react-query와 함께 — 충돌 회피)
import createKyClient from '@nijesmik/openapi-ky';
import { createClient } from '@nijesmik/openapi-ky-react-query';
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
import createKyClient from '@nijesmik/openapi-ky';
import { createClient } from '@nijesmik/openapi-ky-react-query';

const kyClient = createKyClient<paths>({ prefixUrl: '...' });
const api = createClient(kyClient);

api.useQuery({ path: '/posts' });                                                              // hook 단축형
api.useSuspenseQuery({ path: '/categories' });
api.useInfiniteQuery({ path: '/posts', initialPageParam: undefined, getNextPageParam: ... });

useQuery(api.queryOptions({ path: '/posts' }));                                                // 옵션 형태 (prefetch / useQueries 등)
```

### Renames

In `@nijesmik/openapi-ky`, the ky-based client factory `createClient` is now a default export (previously a named export). This lets consumers rename it on import (e.g. to `createKyClient`) when used alongside `@nijesmik/openapi-ky-react-query`, which exports its own named `createClient`.

In `@nijesmik/openapi-ky-react-query`, `createQueryOptions` is renamed to `createClient`. The returned value is now a plain object — the callable form (`api({ ... })`) is removed in favor of an explicit `api.queryOptions({ ... })` method, and `.suspense` / `.infinite` are renamed to `.suspenseQueryOptions` / `.infiniteQueryOptions` to align with TanStack Query's flat naming. `useQuery`, `useSuspenseQuery`, and `useInfiniteQuery` convenience methods are added — each equivalent to passing the matching options builder to the matching TanStack hook.
