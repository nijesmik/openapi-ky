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

export type JsonField<TPaths, TPath extends keyof TPaths, TMethod extends HttpMethod> = [
  RequestBody<TPaths, TPath, TMethod>,
] extends [void]
  ? { json?: never }
  : { json: RequestBody<TPaths, TPath, TMethod> };

export type Options<TPaths, TPath extends keyof TPaths, TMethod extends HttpMethod = "get"> = Omit<
  BaseKyOptions,
  "json" | "method"
> &
  JsonField<TPaths, TPath, TMethod> & {
    method?: TMethod;
    params?: PathParams<TPaths, TPath, TMethod>;
  };

export type OptionsWithRequiredMethod<
  TPaths,
  TPath extends keyof TPaths,
  TMethod extends HttpMethod,
> = Options<TPaths, TPath, TMethod> & { method: TMethod };
