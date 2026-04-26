import type { HttpMethod } from "openapi-typescript-helpers";
import type { Options as KyOptions } from "ky";

import type { Params, RequestBody } from "./common";

export type MethodField<Method extends HttpMethod> = { method?: Method };

export type ParamsField = { params?: Params };

export type JsonField<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod,
> = [RequestBody<Paths, Path, Method>] extends [never | void]
  ? unknown
  : { json: RequestBody<Paths, Path, Method> };

export type Options<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod = "get",
> = Omit<KyOptions, "json" | "method"> &
  MethodField<Method> &
  ParamsField &
  JsonField<Paths, Path, Method>;
