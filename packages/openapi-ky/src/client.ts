import type { Options, PathsFor, RequestBody, ResponseBody } from "./types";
import type { HttpMethod } from "openapi-typescript-helpers";

import ky, { type KyInstance, type Options as KyOptions, type ResponsePromise } from "ky";

import { buildUrl } from "./lib/build-url";

export class Client<Paths extends object> {
  protected api: KyInstance;

  constructor(options: KyOptions) {
    this.api = ky.create(options);
  }

  get<Path extends PathsFor<Paths, "get">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "get">>,
  ) {
    return this.request("get", path, options);
  }

  post<Path extends PathsFor<Paths, "post">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "post">>,
  ) {
    return this.request("post", path, options);
  }

  put<Path extends PathsFor<Paths, "put">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "put">>,
  ) {
    return this.request("put", path, options);
  }

  patch<Path extends PathsFor<Paths, "patch">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "patch">>,
  ) {
    return this.request("patch", path, options);
  }

  delete<Path extends PathsFor<Paths, "delete">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "delete">>,
  ) {
    return this.request("delete", path, options);
  }

  /**
   * Issues an HTTP request and returns ky's `ResponsePromise<T>`. The result can
   * be consumed by chaining a body parser (`.json()`, `.text()`, ...) or by
   * `await`ing the response and parsing it manually.
   *
   * If a `beforeRetry` hook returns `ky.stop`, the resolved value is `undefined`
   * at runtime, and chained body methods will throw `TypeError`. This is an
   * upstream ky limitation — use the `await` pattern with a `null`/`undefined`
   * guard if you rely on `ky.stop`.
   */
  request<
    Method extends Extract<HttpMethod, "delete" | "get" | "patch" | "post" | "put">,
    Path extends PathsFor<Paths, Method>,
    Body extends RequestBody<Paths, Path, Method>,
    T extends ResponseBody<Paths, Path, Method>,
  >(method: Method, path: Path, options?: Options<Body>): ResponsePromise<T> {
    const { params, ...kyOptions } = options ?? {};
    const url = buildUrl(path, params);
    const promise = this.api[method]<T>(url, kyOptions);

    void promise
      .then((response) => {
        // `response` is `undefined` at runtime when `ky.stop` is returned in a `beforeRetry` hook, despite ky's types.
        if (!response) {
          return;
        }
        const parseJson = response.json.bind(response);
        response.json = async <J = T>(): Promise<J> => {
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
  }
}

export function createClient<Paths extends object>(options: KyOptions) {
  return new Client<Paths>(options);
}
