# @nijesmik/openapi-ky

## 2.0.1

### Patch Changes

- Fix README examples: `prefixUrl` → `baseUrl`

## 2.0.0

### Major Changes

#### ky v2 peer dependency (BREAKING)

The `ky` peer dependency has been upgraded from `^1.14.3` to `^2.0.0`. This requires **Node.js ≥ 22**.

#### `prefixUrl` removed — use `baseUrl` or `prefix` (BREAKING)

ky v2 removes `prefixUrl`. Use `baseUrl` (standard URL resolution) or `prefix` (plain string join) instead.

```ts
// Before
createClient<paths>({ prefixUrl: "https://api.example.com/" });

// After
createClient<paths>({ baseUrl: "https://api.example.com/" });
```

#### `isHTTPError` export removed (BREAKING)

The `isHTTPError` wrapper has been removed. Import directly from `ky`, which provides a stronger implementation (includes `error.name` fallback for cross-realm / duplicate-instance cases).

```ts
// Before
import { isHTTPError } from "@nijesmik/openapi-ky";

// After
import { isHTTPError } from "ky";
```

ky v2 also exports `isNetworkError`, `isTimeoutError`, `isKyError`, and `isForceRetryError`.

#### `.json()` on empty bodies now throws (BREAKING)

The `Response.json()` override that returned `""` on empty bodies has been removed. Both the chained `.json()` and the awaited `response.json()` now follow ky v2 behavior — throwing on empty bodies and `204` responses.

If you need the response body, check `response.status` before calling `.json()`:

```ts
const response = await client.get("/resource");
if (response.status === 204) {
  // handle no-content
} else {
  const data = await response.json();
}
```

#### Hook signatures changed (ky v2 upstream)

All ky hooks now receive a single state object instead of separate arguments. See the [ky v2 migration guide](https://github.com/sindresorhus/ky) for details.

```ts
// Before (ky v1)
beforeRequest: [(request, options) => { ... }]

// After (ky v2)
beforeRequest: [({request, options, retryCount}) => { ... }]
```

## 1.0.0

### Major Changes

#### `createClient` is now a default export (BREAKING)

```ts
// Before
import { createClient } from "@nijesmik/openapi-ky";

// After (standalone)
import createClient from "@nijesmik/openapi-ky";

// After (alongside react-query — avoid collision)
import createKyClient from "@nijesmik/openapi-ky";
import { createClient } from "@nijesmik/openapi-ky-react-query";
```

`@nijesmik/openapi-ky-react-query` exports its own named `createClient`. Switching `@nijesmik/openapi-ky`'s export to default lets consumers rename it on import to avoid the collision.

#### Path-correlated `params` types (BREAKING)

`params` fields are narrowed to the path's declared `parameters.path` shape derived from the OpenAPI schema. Wrong keys now fail at compile time.

```ts
// Before — wrong key compiles
client.get("/posts/{postId}", { params: { wrongKey: 1 } });

// After — compile error
client.get("/posts/{postId}", { params: { postId: 1 } });
```

Users generating their schema with `openapi-typescript` get this with no migration. Hand-written schemas need `parameters.path` declared on paths with placeholders.

#### Removed wide `Params` export (BREAKING)

`Params = Record<string, boolean | number | string>` is removed. Use `PathParams<Paths, Path, Method>` instead.

#### New runtime / type exports

- `isHTTPError`: type-narrowing ky `HTTPError` check that also narrows `error.response.json<T>()`.
- Types: `Client`, `Fetcher`, `Options`, `OptionsWithRequiredMethod`, `PathsFor`, `PathParams`, `RequestBody`, `ResponseBody`, `JsonField`, `KyOptions`, `SearchParams`, `HttpMethod`.

## ~~0.2.0~~ (deprecated)

### ~~Minor Changes~~

#### ~~Breaking Changes~~

- ~~Rename `API` class to `Client`~~
- ~~Remove `ErrorOptions`; use `beforeHTTPError` and `beforeAnyError` hooks instead~~
- ~~Add `createClient` factory function~~
- ~~Add `beforeHTTPError` hook (maps to ky's `beforeError`)~~
- ~~Add `beforeAnyError` hook for all error types~~

## 0.1.1

### Patch Changes

- Fix JSON parsing error on 204 No Content responses

## 0.1.0

### Minor Changes

- Initial release
