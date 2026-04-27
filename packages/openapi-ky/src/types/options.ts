import type { HttpMethod } from "openapi-typescript-helpers";
import type { Options as BaseKyOptions } from "ky";

import type { Params, RequestBody } from "./common";

/**
 * Subset of ky's `Options` excluding fields this library lifts to the
 * top-level of its own option types (`json` / `method` / `searchParams`).
 *
 * Intended as the type for the `kyOptions` field on this library's
 * request-shaped options. If you need ky's full `Options`, import it
 * directly: `import type { Options } from "ky"`.
 */
export type KyOptions = Omit<BaseKyOptions, "json" | "method" | "searchParams">;

export type MethodField<Method extends HttpMethod = HttpMethod> = { method?: Method };

export type ParamsField = { params?: Params };

export type JsonField<Paths, Path extends keyof Paths, Method extends HttpMethod> = [
  RequestBody<Paths, Path, Method>,
] extends [never | void]
  ? unknown
  : { json: RequestBody<Paths, Path, Method> };

export type Options<Paths, Path extends keyof Paths, Method extends HttpMethod = "get"> = Omit<
  BaseKyOptions,
  "json" | "method"
> &
  MethodField<Method> &
  ParamsField &
  JsonField<Paths, Path, Method>;
