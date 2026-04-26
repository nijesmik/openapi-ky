import type { HttpMethod } from "openapi-typescript-helpers";
import type { Options as KyOptions } from "ky";

import type { Params, RequestBody } from "./common";

export type Options<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod = "get",
> = Omit<KyOptions, "json" | "method"> & {
  method?: Method;
  params?: Params;
} & JsonField<Paths, Path, Method>;

export type JsonField<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod,
> = [RequestBody<Paths, Path, Method>] extends [never | undefined]
  ? unknown
  : { json: RequestBody<Paths, Path, Method> };
