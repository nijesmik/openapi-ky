# @nijesmik/openapi-ky-react-query

## 0.3.0

### Minor Changes

- ### Breaking Changes
  - Update `API` to `Client` type reference / `API` → `Client` 타입 참조 업데이트

### Patch Changes

- Updated dependencies
  - @nijesmik/openapi-ky@0.2.0

## 0.2.1

### Patch Changes

- Updated dependencies
  - @nijesmik/openapi-ky@0.1.1

## 0.2.0

### Minor Changes

- ### Breaking Changes
  - Merge second argument into a single object parameter for `options`, `suspenseOptions`, and `infiniteOptions` / 두 번째 인자를 제거하고 단일 객체 파라미터로 통합
    - Before: `query.options({ path, params, select }, { staleTime })`
    - After: `query.options({ path, params, select, staleTime })`
  - Extract `searchParams` and `kyOptions` as top-level parameters / `searchParams`, `kyOptions`를 최상위 파라미터로 분리
    - Before: `query.options({ path, ...requestOptions })`
    - After: `query.options({ path, searchParams, kyOptions })`
  - Remove `enabled` option from `suspenseOptions` (not supported by `useSuspenseQuery`) / `suspenseOptions`에서 `enabled` 옵션 제거
  - Move `getNextPageParam` from custom parameter to standard React Query option in `infiniteOptions` (behavior unchanged) / `infiniteOptions`에서 `getNextPageParam`을 React Query 표준 옵션으로 변경 (동작 동일)

- ### Internal
  - Remove `hasParams` helper function / `hasParams` 헬퍼 함수 제거
  - Remove `Params` type import / `Params` 타입 import 제거

## 0.1.0

### Minor Changes

- Initial release
