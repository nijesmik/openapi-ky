# @nijesmik/openapi-ky

## 1.0.0

### Major Changes

#### `createClient` is now a default export (BREAKING)

```ts
// Before
import { createClient } from '@nijesmik/openapi-ky';

// After (standalone)
import createClient from '@nijesmik/openapi-ky';

// After (alongside react-query — avoid collision)
import createKyClient from '@nijesmik/openapi-ky';
import { createClient } from '@nijesmik/openapi-ky-react-query';
```

`@nijesmik/openapi-ky-react-query` exports its own named `createClient`. Switching `@nijesmik/openapi-ky`'s export to default lets consumers rename it on import to avoid the collision.

#### Path-correlated `params` types (BREAKING)

`params` fields are narrowed to the path's declared `parameters.path` shape derived from the OpenAPI schema. Wrong keys now fail at compile time.

```ts
// Before — wrong key compiles
client.get('/posts/{postId}', { params: { wrongKey: 1 } });

// After — compile error
client.get('/posts/{postId}', { params: { postId: 1 } });
```

Users generating their schema with `openapi-typescript` get this with no migration. Hand-written schemas need `parameters.path` declared on paths with placeholders.

#### Removed wide `Params` export (BREAKING)

`Params = Record<string, boolean | number | string>` is removed. Use `PathParams<Paths, Path, Method>` instead.

#### New runtime / type exports

- `isHTTPError`: type-narrowing ky `HTTPError` check that also narrows `error.response.json<T>()`.
- Types: `Client`, `Fetcher`, `Options`, `OptionsWithRequiredMethod`, `PathsFor`, `PathParams`, `RequestBody`, `ResponseBody`, `JsonField`, `KyOptions`, `SearchParams`, `HttpMethod`.

## 0.2.0

### Minor Changes

- ### Breaking Changes
  - Rename `API` class to `Client` / `API` 클래스를 `Client`로 리네이밍
  - Remove `ErrorOptions`; use `beforeHTTPError` and `beforeAnyError` hooks instead / `ErrorOptions` 제거; `beforeHTTPError`, `beforeAnyError` 훅으로 대체
  - Add `createClient` factory function / `createClient` 팩토리 함수 추가
  - Add `beforeHTTPError` hook (maps to ky's `beforeError`) / `beforeHTTPError` 훅 추가 (ky의 `beforeError`에 매핑)
  - Add `beforeAnyError` hook for all error types / `beforeAnyError` 훅 추가 (모든 에러에 대해 동작)

## 0.1.1

### Patch Changes

- Fix JSON parsing error on 204 No Content responses / 204 No Content 응답 시 JSON 파싱 오류 수정

## 0.1.0

### Minor Changes

- Initial release
