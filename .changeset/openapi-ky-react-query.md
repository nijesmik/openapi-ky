---
"@nijesmik/openapi-ky-react-query": major
---

### Requires Node.js ≥ 22 (BREAKING)

Follows the ky v2 / `@nijesmik/openapi-ky` v2 engine requirement.

### Empty-body responses return `undefined` instead of throwing

`queryFn` and `mutationFn` now use `safeJson` — a helper that reads `response.text()` and returns `undefined` when the body is empty, instead of throwing `SyntaxError` from `JSON.parse`. This covers `204 No Content` and any other response with an empty body.

### `createClient` is now a default export (BREAKING)

```ts
// Before
import { createClient } from '@nijesmik/openapi-ky-react-query';

// After
import createClient from '@nijesmik/openapi-ky-react-query';
```
