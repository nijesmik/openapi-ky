import type {
  HttpMethod,
  Params,
  PathsFor,
  RequestBody,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";
import type { Options as KyOptions } from "ky";

import type { UseMutationOptions } from "@tanstack/react-query";

export type MutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
  Variables extends RequestBody<Paths, Path, Method>,
> = Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
  method: Method;
  path: Path;
  params?: Params;
  searchParams?: SearchParams;
  kyOptions?: Omit<KyOptions, "json" | "method" | "searchParams">;
};
