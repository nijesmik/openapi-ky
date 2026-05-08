# @nijesmik/openapi-ky

OpenAPI 스키마로 path / method / request / response 타입이 추론되는 ky 클라이언트.

[English](./README.md)

## 설치

```bash
npm install @nijesmik/openapi-ky ky
```

`ky`는 peer dependency입니다. `paths` 타입은 [`openapi-typescript`](https://github.com/openapi-ts/openapi-typescript)로 OpenAPI 문서에서 생성한 뒤 아래 예제처럼 import하세요.

## 사용법

```ts
import { createClient } from '@nijesmik/openapi-ky';
import type { paths } from './schema'; // openapi-typescript로 생성

const client = createClient<paths>({ prefixUrl: 'https://api.example.com' });

// path params가 있는 GET
const user = await client
  .get('/users/{userId}', { params: { userId: 1 } })
  .json();

// json body가 있는 POST
const created = await client
  .post('/posts', { json: { title: 'Hello', content: 'World' } })
  .json();
```

`params`는 ky에 없는 path template substitution 필드입니다 (예: `{userId}` → `1`). 그 외 ky 옵션(`headers`, `searchParams`, `hooks`, `retry`, `timeout`, …)은 그대로 전달됩니다. [ky 문서](https://github.com/sindresorhus/ky)를 참고하세요.

## 기본 메서드

```ts
import { createClient } from '@nijesmik/openapi-ky';
import type { paths } from './schema';

const client = createClient<paths, 'post'>({
  prefixUrl: 'https://api.example.com',
  method: 'post',
});

await client('/posts', { json: { title: 'Hello' } }).json();
```

`client` 자체가 callable이며 (`client(path, opts)`), 이 형태는 인스턴스 기본 method로 dispatch합니다. 단축 메서드(`client.get`, `client.post`, …)는 단축에 명시된 method를 항상 사용합니다.

메서드 우선순위: `options.method` (호출 시) → `defaultOptions.method` (인스턴스) → `'get'` (ky의 fallback).

## 타입 헬퍼

```ts
import type { RequestBody, ResponseBody } from '@nijesmik/openapi-ky';
import type { paths } from './schema';

type CreatePostBody = RequestBody<paths, '/posts', 'post'>; // method 필수
type User = ResponseBody<paths, '/users/{userId}'>; // method 기본값은 'get'
```

이 외에 `Client`, `PathsFor`, `PathParams`, `Options`, `OptionsWithRequiredMethod`, `JsonField`, `KyOptions`, `SearchParams`, `HttpMethod`를 export합니다.

## `isHTTPError`

```ts
import { isHTTPError } from '@nijesmik/openapi-ky';

try {
  await client.get('/users');
} catch (error) {
  if (isHTTPError<{ message: string }>(error)) {
    const body = await error.response.json();
    console.error(body.message);
  }
}
```

제네릭으로 `error.response.json()`의 반환 타입을 좁힐 수 있습니다.

## 주의사항

### `ky.stop`

`beforeRetry` 훅이 [`ky.stop`](https://github.com/sindresorhus/ky#stop)을 반환하면 응답이 `undefined`로 resolve됩니다. 체이닝된 body 메서드(`.json()`, `.text()`, …)는 `TypeError`를 던집니다. `await` 패턴에 `undefined` 가드를 사용하세요:

```ts
const response = await client.get('/users');
if (!response) {
  return; // beforeRetry에서 ky.stop을 반환한 경우
}
const users = await response.json();
```

### 빈 응답 body

`.json()`은 빈 body (예: `204 No Content`)에 대해 `""` (빈 문자열)을 반환합니다 — ky의 체이닝 `.json()` 동작과 일치합니다. `.json<Post[]>()` 같은 타입 단언은 런타임 형태와 불일치할 수 있으니 `response.status`를 확인하거나 `.text()`로 읽어 조건부로 파싱하세요.

## 라이선스

MIT
