import type { HttpMethod, KyOptions, Options, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import type { UseMutationOptions } from "@tanstack/react-query";

export type MutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
  Variables extends Omit<Options<Paths, Path, Method>, "method">,
> = Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
  method: Method;
  path: Path;
  kyOptions?: KyOptions;
};
