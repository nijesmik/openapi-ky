import type { Options as BaseKyOptions } from "ky";
import type { HttpMethod } from "openapi-typescript-helpers";

import type { PathParams, RequestBody } from "./common";

/**
 * Subset of ky's `Options` excluding fields this library lifts to the
 * top-level of its own option types (`json` / `method` / `searchParams`).
 *
 * Intended as the type for the `kyOptions` field on this library's
 * request-shaped options. If you need ky's full `Options`, import it
 * directly: `import type { Options } from "ky"`.
 */
export type KyOptions = Omit<BaseKyOptions, "json" | "method" | "searchParams">;

export type JsonField<Paths, Path extends keyof Paths, Method extends HttpMethod> = [
  RequestBody<Paths, Path, Method>,
] extends [void]
  ? { json?: never }
  : { json: RequestBody<Paths, Path, Method> };

export type Options<Paths, Path extends keyof Paths, Method extends HttpMethod = "get"> = Omit<
  BaseKyOptions,
  "json" | "method"
> &
  JsonField<Paths, Path, Method> & {
    method?: Method;
    params?: PathParams<Paths, Path, Method>;
  };
