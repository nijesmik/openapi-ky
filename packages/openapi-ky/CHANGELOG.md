# @nijesmik/openapi-ky

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
