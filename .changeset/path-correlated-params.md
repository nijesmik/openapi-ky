---
"@nijesmik/openapi-ky": minor
"@nijesmik/openapi-ky-react-query": minor
---

### Breaking Changes / 호환성 깨짐

#### Path-correlated `params` 타입

`Options.params`, `QueryKeyOptions.params`, `CreateQueryOptions.params`,
`CreateMutationOptions.params`의 타입이 OpenAPI schema의 `parameters.path`에서
도출되도록 좁아졌습니다.

```ts
// Before — wide record, 잘못된 키도 컴파일 통과
setQueryData({
  path: "/posts/{postId}",
  params: { wrongKey: 1 },
  updater: ...,
});

// After — schema의 path parameters와 일치하지 않으면 컴파일 에러
setQueryData({
  path: "/posts/{postId}",
  params: { postId: 1 },
  updater: ...,
});
```

`openapi-typescript`로 schema를 생성하는 사용자는 추가 작업 없이 자동으로
강한 타입 안전성을 얻습니다. 손으로 schema를 작성한 경우 `parameters.path`를
선언해야 합니다.

#### `Params` 타입 export 제거

공개되어 있던 wide `Params = Record<string, boolean | number | string>`
타입이 제거되었습니다. 같은 의미의 타입이 필요하면 `PathParams<Paths, Path, Method>`를
사용하세요.

### Path-correlated `params` types

`params` fields on `Options`, `QueryKeyOptions`, `CreateQueryOptions`, and
`CreateMutationOptions` are now narrowed to the path's declared `parameters.path`
shape, derived from the OpenAPI schema. Wrong keys now fail at compile time
instead of producing silent runtime no-ops.

The wide `Params` type previously exported from `@nijesmik/openapi-ky` is
removed. Use `PathParams<Paths, Path, Method>` instead.

Users generating their schema with `openapi-typescript` get this stronger
type safety with no migration; users hand-writing schemas need to declare
`parameters.path` for endpoints that have placeholders.
