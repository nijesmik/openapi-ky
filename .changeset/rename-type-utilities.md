---
"@nijesmik/openapi-ky": minor
"@nijesmik/openapi-ky-react-query": minor
---

### Breaking Changes / 호환성 깨짐

#### Type utility 이름 변경

Type utility 이름이 의미를 더 명확히 드러내도록 변경되었습니다. 단순 rename이므로 find-and-replace로 마이그레이션 가능합니다.

| Before | After |
|---|---|
| `PathOf<Paths, Method>` | `PathsFor<Paths, Method>` |
| `BodyOf<Paths, Path, Method>` | `RequestBody<Paths, Path, Method>` |
| `SuccessOf<Paths, Path, Method>` | `ResponseBody<Paths, Path, Method>` |

`ResponseBody`의 `Method` 파라미터는 기본값이 `'get'`으로 설정되어 GET 응답 타입은 `ResponseBody<paths, '/users/{id}'>`처럼 생략 가능합니다.

Type utility names have been renamed to better convey their meaning. Migration is a simple find-and-replace.

#### `client.get` / `client.delete`에서 request body 지원

스펙에 `requestBody`가 정의된 GET/DELETE 엔드포인트의 경우 `json` 필드를 타입 안전하게 전달할 수 있습니다. body가 없는 엔드포인트는 기존과 동일하게 동작합니다.

`client.get` and `client.delete` now support typed request bodies for endpoints that define `requestBody` in the spec. Endpoints without a body behave the same as before.
