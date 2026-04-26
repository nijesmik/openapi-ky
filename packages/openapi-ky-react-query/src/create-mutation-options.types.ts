import type {
  Params,
  PathsFor,
  RequestBody,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";
import type { Options as KyOptions } from "ky";

import type { UseMutationOptions } from "@tanstack/react-query";

export type MutationMethod = "delete" | "patch" | "post" | "put";

export type MutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends MutationMethod,
  Variables extends RequestBody<Paths, Path, Method>,
> = Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
  method: Method;
  path: Path;
  params?: Params;
  searchParams?: SearchParams;
  kyOptions?: Omit<KyOptions, "json" | "method" | "searchParams">;
};
