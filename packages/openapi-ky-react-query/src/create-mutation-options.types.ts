import type { Options, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import type { UseMutationOptions } from "@tanstack/react-query";

export type MutationMethod = "delete" | "patch" | "post" | "put";

export type MutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends MutationMethod,
  Variables extends Options<Paths, Path, Method>,
> = Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
  method: Method;
  path: Path;
};
