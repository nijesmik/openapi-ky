import type { HttpMethod } from "openapi-typescript-helpers";
import type {
  Options as KyOptions,
  ResponsePromise,
} from "ky";
import ky from "ky";

import type { Options, Params, PathsFor, ResponseBody } from "./types";
import { buildUrl } from "./lib/build-url";

export interface Client<
  Paths extends object,
  DefaultMethod extends HttpMethod = "get",
> {
  /**
   * Issues an HTTP request and returns ky's `ResponsePromise<T>`. Method 우선순위는
   * 호출 시 `options.method` → `createClient`의 `defaultOptions.method` → ky 내장 `"get"`.
   *
   * 결과는 body parser 체이닝(`.json()`, `.text()`, ...) 또는 `await` + 수동 파싱으로 소비.
   *
   * `beforeRetry` 훅이 `ky.stop`을 반환하면 resolved value는 런타임에 `undefined`이고,
   * chained body 메서드는 `TypeError`로 던진다 — ky의 upstream 한계. `ky.stop`에 의존한다면
   * `await` 패턴 + `null`/`undefined` 가드를 사용.
   */
  <Path extends PathsFor<Paths, DefaultMethod>>(
    path: Path,
    options?: Options<Paths, Path, DefaultMethod>,
  ): ResponsePromise<ResponseBody<Paths, Path, DefaultMethod>>;
  <
    Path extends keyof Paths & string,
    Method extends keyof Paths[Path] & HttpMethod,
  >(
    path: Path,
    options: Options<Paths, Path, Method> & { method: Method },
  ): ResponsePromise<ResponseBody<Paths, Path, Method>>;

  get<Path extends PathsFor<Paths, "get">>(
    path: Path,
    options?: Options<Paths, Path, "get">,
  ): ResponsePromise<ResponseBody<Paths, Path, "get">>;
  post<Path extends PathsFor<Paths, "post">>(
    path: Path,
    options?: Options<Paths, Path, "post">,
  ): ResponsePromise<ResponseBody<Paths, Path, "post">>;
  put<Path extends PathsFor<Paths, "put">>(
    path: Path,
    options?: Options<Paths, Path, "put">,
  ): ResponsePromise<ResponseBody<Paths, Path, "put">>;
  patch<Path extends PathsFor<Paths, "patch">>(
    path: Path,
    options?: Options<Paths, Path, "patch">,
  ): ResponsePromise<ResponseBody<Paths, Path, "patch">>;
  delete<Path extends PathsFor<Paths, "delete">>(
    path: Path,
    options?: Options<Paths, Path, "delete">,
  ): ResponsePromise<ResponseBody<Paths, Path, "delete">>;
}

export function createClient<
  Paths extends object,
  DefaultMethod extends HttpMethod = "get",
>(
  defaultOptions: Omit<KyOptions, "method"> & { method?: DefaultMethod },
): Client<Paths, DefaultMethod> {
  const api = ky.create(defaultOptions);

  const request = (
    path: string,
    options: KyOptions & { params?: Params } = {},
  ): ResponsePromise => {
    const { params, ...kyOptions } = options;
    const url = buildUrl(path, params);
    const promise = api(url, kyOptions);

    void promise
      .then((response) => {
        if (!response) {
          return;
        }
        // 빈 본문일 때 ky의 chained `.json()`은 `""`를 반환하지만 native `Response.json()`은 throw한다.
        // 일관성을 위해 native 쪽도 빈 본문에서 `""`를 반환하도록 패치.
        const parseJson = response.json.bind(response);
        response.json = async <J>(): Promise<J> => {
          const text = await response.clone().text();
          if (!text) {
            return "" as J;
          }
          return parseJson<J>();
        };
      })
      .catch(() => {
        // `.then()`이 만든 derived promise는 원본 reject 시 독립적으로 reject된다.
        // 호출자는 원본 promise를 await/catch하므로 derived rejection은 흡수해
        // unhandledRejection 발동을 막는다.
      });

    return promise;
  };

  return Object.assign(request, {
    get: (path: string, options: KyOptions & { params?: Params } = {}) =>
      request(path, { ...options, method: "get" }),
    post: (path: string, options: KyOptions & { params?: Params } = {}) =>
      request(path, { ...options, method: "post" }),
    put: (path: string, options: KyOptions & { params?: Params } = {}) =>
      request(path, { ...options, method: "put" }),
    patch: (path: string, options: KyOptions & { params?: Params } = {}) =>
      request(path, { ...options, method: "patch" }),
    delete: (path: string, options: KyOptions & { params?: Params } = {}) =>
      request(path, { ...options, method: "delete" }),
  }) as unknown as Client<Paths, DefaultMethod>;
}
