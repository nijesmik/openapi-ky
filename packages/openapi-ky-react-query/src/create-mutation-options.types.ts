import type { Options, PathsFor, RequestBody, ResponseBody } from "@nijesmik/openapi-ky";

import type { UseMutationOptions } from "@tanstack/react-query";

export type MutationMethod = "delete" | "patch" | "post" | "put";

export type MutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends MutationMethod,
  Variables extends Options<RequestBody<Paths, Path, Method>>,
> = Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
  method: Method;
  path: Path;
};
