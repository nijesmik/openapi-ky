---
"@nijesmik/openapi-ky": minor
---

### Breaking Changes / 호환성 깨짐

- `beforeAnyError` 훅을 제거했습니다. `HTTPError` 외 에러(`TimeoutError`, 네트워크 에러 등)는 호출부에서 직접 `try/catch`로 처리하세요.
- `beforeHTTPError`를 제거하고 ky의 native `beforeError`를 그대로 노출합니다. 기존 `beforeHTTPError` 사용처는 `beforeError`로 이름만 변경하면 됩니다.

- Removed the `beforeAnyError` hook. Handle non-`HTTPError` failures (`TimeoutError`, network errors, etc.) at the call site with `try/catch`.
- Removed `beforeHTTPError` in favor of ky's native `beforeError`. Rename existing `beforeHTTPError` usages to `beforeError`.
