---
"@nijesmik/openapi-ky": minor
"@nijesmik/openapi-ky-react-query": minor
---

### Breaking Changes / 호환성 깨짐

Type utility 이름이 의미를 더 명확히 드러내도록 변경되었습니다. 단순 rename이므로 find-and-replace로 마이그레이션 가능합니다.

| Before | After |
|---|---|
| `PathOf<Paths, Method>` | `PathsFor<Paths, Method>` |
| `BodyOf<Paths, Path, Method>` | `RequestBody<Paths, Path, Method>` |
| `SuccessOf<Paths, Path, Method>` | `ResponseBody<Paths, Path, Method>` |

Type utility names have been renamed to better convey their meaning. Migration is a simple find-and-replace.
