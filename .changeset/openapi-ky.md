---
"@nijesmik/openapi-ky": major
---

### ky v2 peer dependency (BREAKING)

The `ky` peer dependency has been upgraded from `^1.14.3` to `^2.0.0`. This requires **Node.js ≥ 22**.

### `prefixUrl` removed — use `baseUrl` or `prefix` (BREAKING)

ky v2 removes `prefixUrl`. Use `baseUrl` (standard URL resolution) or `prefix` (plain string join) instead.

```ts
// Before
createClient<paths>({ prefixUrl: 'https://api.example.com/' });

// After
createClient<paths>({ baseUrl: 'https://api.example.com/' });
```

### `isHTTPError` export removed (BREAKING)

The `isHTTPError` wrapper has been removed. Import directly from `ky`, which provides a stronger implementation (includes `error.name` fallback for cross-realm / duplicate-instance cases).

```ts
// Before
import { isHTTPError } from '@nijesmik/openapi-ky';

// After
import { isHTTPError } from 'ky';
```

ky v2 also exports `isNetworkError`, `isTimeoutError`, `isKyError`, and `isForceRetryError`.

### `.json()` on empty bodies now throws (BREAKING)

The `Response.json()` override that returned `""` on empty bodies has been removed. Both the chained `.json()` and the awaited `response.json()` now follow ky v2 behavior — throwing on empty bodies and `204` responses.

If you need the response body, check `response.status` before calling `.json()`:

```ts
const response = await client.get('/resource');
if (response.status === 204) {
  // handle no-content
} else {
  const data = await response.json();
}
```

### Hook signatures changed (ky v2 upstream)

All ky hooks now receive a single state object instead of separate arguments. See the [ky v2 migration guide](https://github.com/sindresorhus/ky) for details.

```ts
// Before (ky v1)
beforeRequest: [(request, options) => { ... }]

// After (ky v2)
beforeRequest: [({request, options, retryCount}) => { ... }]
```
