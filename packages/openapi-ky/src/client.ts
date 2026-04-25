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
   * Issues an HTTP request and returns ky's `ResponsePromise<T>`. The result can
   * be consumed by chaining a body parser (`.json()`, `.text()`, ...) or by
   * `await`ing the response and parsing it manually.
   *
   * Method resolution priority: `options.method` (call-site) → `defaultOptions.method`
   * (instance, set via `createClient`) → ky's built-in `"get"` fallback.
   *
   * If a `beforeRetry` hook returns `ky.stop`, the resolved value is `undefined`
   * at runtime, and chained body methods will throw `TypeError`. This is an
   * upstream ky limitation — use the `await` pattern with a `null`/`undefined`
   * guard if you rely on `ky.stop`.
   */
  <Path extends PathsFor<Paths, DefaultMethod>>(
    path: Path,
    options?: Options<Paths, Path, DefaultMethod>,
  ): ResponsePromise<ResponseBody<Paths, Path, DefaultMethod>>;
  <
    Method extends HttpMethod,
    Path extends PathsFor<Paths, Method>,
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
        // `response` is `undefined` at runtime when `ky.stop` is returned in a `beforeRetry` hook, despite ky's types.
        if (!response) {
          return;
        }
        // Patch native `Response.json()` to match ky's chained `.json()` behavior on empty bodies (returns `""` instead of throwing).
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
        // `.then()` creates a derived promise that rejects independently when `promise` rejects.
        // The caller awaits/catches `promise` itself, so swallow this branch to avoid `unhandledRejection`.
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
