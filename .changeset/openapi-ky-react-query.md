---
"@nijesmik/openapi-ky-react-query": major
---

### Requires Node.js ≥ 22 (BREAKING)

Follows the ky v2 / `@nijesmik/openapi-ky` v2 engine requirement.

### 204 responses return `undefined` instead of throwing

`queryFn` and `mutationFn` now use `safeJson` — a helper that checks `response.status` before calling `.json()`. When the status is `204`, it returns `undefined` (typed as `T`) instead of throwing.

This means mutations targeting endpoints that return `204 No Content` (e.g. `DELETE`) no longer error by default.
