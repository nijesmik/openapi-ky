# @nijesmik/openapi-ky

`openapi-typescript`로 생성한 `schema.d.ts`를 기반으로 path, method, request/response 타입이 자동 추론되는 타입 세이프 API 클라이언트입니다.

## Installation

```bash
npm install @nijesmik/openapi-ky ky
```

> `ky`는 peer dependency입니다.

## Usage

### API 인스턴스 생성

```ts
import { API } from '@nijesmik/openapi-ky';
import type { paths } from './schema'; // openapi-typescript로 생성

const api = new API<paths>(
  // ky 옵션
  { prefixUrl: 'https://api.example.com' },
  // 에러 핸들링 (선택)
  {
    onHttpError: (error) => console.error(error.response.status),
    onTimeoutError: (error) => console.error('timeout', error),
    onError: (error) => console.error('unknown', error),
  },
);
```

### HTTP 메서드

```ts
// GET
const users = await api.get('/users');

// GET with path params
const user = await api.get('/users/{userId}', {
  params: { userId: 1 },
});

// POST with body
const created = await api.post('/posts', {
  json: { title: 'Hello', content: 'World' },
});

// PATCH with path params + body
await api.patch('/posts/{postId}', {
  params: { postId: 1 },
  json: { title: 'Updated' },
});

// DELETE
await api.delete('/posts/{postId}', {
  params: { postId: 1 },
});
```

### 타입 유틸리티

```ts
import type { BodyOf, SuccessOf } from '@nijesmik/openapi-ky';
import type { paths } from './schema';

// POST body 타입 추출
type CreatePostBody = BodyOf<paths, '/posts', 'post'>;

// 성공 응답 타입 추출
type UserResponse = SuccessOf<paths, '/users/{userId}', 'get'>;
```

## API

| 이름 | 설명 |
|---|---|
| `new API<paths>(kyOptions, errorOptions?)` | API 인스턴스 생성 |
| `api.get(path, options?)` | GET 요청 |
| `api.post(path, options?)` | POST 요청 |
| `api.put(path, options?)` | PUT 요청 |
| `api.patch(path, options?)` | PATCH 요청 |
| `api.delete(path, options?)` | DELETE 요청 |
| `BodyOf<paths, Path, Method>` | 요청 body 타입 추출 |
| `SuccessOf<paths, Path, Method>` | 성공 응답 타입 추출 |
| `PathOf<paths, Method>` | 메서드별 유효한 path 타입 추출 |

## License

MIT
