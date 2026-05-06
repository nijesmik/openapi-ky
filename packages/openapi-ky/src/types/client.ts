import type { ResponsePromise } from "ky";
import type { HttpMethod } from "openapi-typescript-helpers";

import type { PathsFor, ResponseBody } from "./common";
import type { Options, OptionsWithRequiredMethod } from "./options";
import type { Fetcher } from "./shortcut";

export interface Client<Paths extends object, DefaultMethod extends HttpMethod = "get"> {
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
  <Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    path: Path,
    options: OptionsWithRequiredMethod<Paths, Path, Method>,
  ): ResponsePromise<ResponseBody<Paths, Path, Method>>;

  get: Fetcher<Paths, "get">;
  post: Fetcher<Paths, "post">;
  put: Fetcher<Paths, "put">;
  patch: Fetcher<Paths, "patch">;
  delete: Fetcher<Paths, "delete">;
}
