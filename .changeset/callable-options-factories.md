---
"@nijesmik/openapi-ky-react-query": major
---

### Breaking Changes / 호환성 깨짐

옵션 팩토리를 callable object 형태로 재설계했습니다. 함수 이름, 메서드 이름, 호출 형태가 바뀌었으며 단순 find-and-replace로 마이그레이션 가능합니다. `query.keyOf`만 별도로 `createQueryClient`의 `getQueryKey`로 대체해야 합니다.

| Before | After |
|---|---|
| `createQuery(client)` | `createQueryOptions(client)` |
| `createMutation(client)` | `createMutationOptions(client)` |
| `query.options(...)` | `queryOptions(...)` |
| `query.suspenseOptions(...)` | `queryOptions.suspense(...)` |
| `query.infiniteOptions(...)` | `queryOptions.infinite(...)` |
| `mutation.options({ method: 'post', ... })` | `mutationOptions.post(...)` (or `mutationOptions({ method: 'post', ... })`) |
| `query.keyOf(path, opts)` | `getQueryKey(path, opts)` from `createQueryClient` |

The options factories were redesigned as callable objects. Function names, method names, and call shapes all changed and can be migrated with a find-and-replace. Replace `query.keyOf` with `getQueryKey` from `createQueryClient`.
