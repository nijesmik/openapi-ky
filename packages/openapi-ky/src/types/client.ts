import type { ResponsePromise } from "ky";
import type { HttpMethod } from "openapi-typescript-helpers";

import type { PathsFor, ResponseBody } from "./common";
import type { Options, OptionsWithRequiredMethod } from "./options";
import type { Fetcher } from "./shortcut";

export interface Client<TPaths extends object, TDefaultMethod extends HttpMethod = "get"> {
  /**
   * Issues an HTTP request and returns ky's `ResponsePromise<T>`. The result can
   * be consumed by chaining a body parser (`.json()`, `.text()`, ...) or by
   * `await`ing the response and parsing it manually.
   *
   * Method resolution priority: `options.method` (call-site) → `defaultOptions.method`
   * (instance, set via `createKyClient`) → ky's built-in `"get"` fallback.
   *
   * If a `beforeRetry` hook returns `ky.stop`, the resolved value is `undefined`
   * at runtime, and chained body methods will throw `TypeError`. This is an
   * upstream ky limitation — use the `await` pattern with an `undefined` guard
   * if you rely on `ky.stop`.
   *
   * Empty response bodies (e.g. `204 No Content`) resolve via `.json()` to `""`
   * (the library's `Response.json()` override matches ky's chained `.json()`).
   * Type assertions like `.json<Post[]>()` lie about the runtime shape; check
   * `response.status` or read via `response.text()` and parse conditionally.
   */
  <TPath extends PathsFor<TPaths, TDefaultMethod>>(
    path: TPath,
    options?: Options<TPaths, TPath, TDefaultMethod>,
  ): ResponsePromise<ResponseBody<TPaths, TPath, TDefaultMethod>>;
  <TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    path: TPath,
    options: OptionsWithRequiredMethod<TPaths, TPath, TMethod>,
  ): ResponsePromise<ResponseBody<TPaths, TPath, TMethod>>;

  get: Fetcher<TPaths, "get">;
  post: Fetcher<TPaths, "post">;
  put: Fetcher<TPaths, "put">;
  patch: Fetcher<TPaths, "patch">;
  delete: Fetcher<TPaths, "delete">;
}
