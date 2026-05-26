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
import createClient from '@nijesmik/openapi-ky';
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

## 기본 메서드 설정 (선택)

기본적으로 `client(path, opts)` 형태 호출은 `GET`으로 dispatch됩니다. 다른 method를 기본으로 두려면 두 번째 제네릭과 `defaultOptions.method`에 동일하게 명시하세요:

```ts
import createClient from '@nijesmik/openapi-ky';
import type { paths } from './schema';

const client = createClient<paths, 'post'>({
  prefixUrl: 'https://api.example.com',
  method: 'post',
});

await client('/posts', { json: { title: 'Hello' } }).json();
```

단축 메서드(`client.get`, `client.post`, …)는 인스턴스 기본값과 무관하게 단축에 명시된 method를 항상 사용합니다.

메서드 우선순위: `options.method` (호출 시) → `defaultOptions.method` (인스턴스) → `'get'` (ky의 fallback).

## 타입 헬퍼

```ts
import type { RequestBody, ResponseBody } from '@nijesmik/openapi-ky';
import type { paths } from './schema';

type CreatePostBody = RequestBody<paths, '/posts', 'post'>; // method 필수
type User = ResponseBody<paths, '/users/{userId}'>; // method 기본값은 'get'
```

이 외에 `Client`, `PathsFor`, `PathParams`, `Options`, `OptionsWithRequiredMethod`, `JsonField`, `KyOptions`, `SearchParams`, `HttpMethod`를 export합니다.

## 라이선스

MIT
