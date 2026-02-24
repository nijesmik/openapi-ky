import type { BodyOf, Options, PathOf, SuccessOf } from "@nijesmik/openapi-ky";

import { mutationOptions, type UseMutationOptions } from "@tanstack/react-query";

import type { API } from "@nijesmik/openapi-ky";

type MutationMethod = "delete" | "patch" | "post" | "put";

export function createMutation<Paths extends object>(api: API<Paths>) {
  function options<
    Method extends MutationMethod,
    Path extends PathOf<Paths, Method>,
    Variables extends Options<BodyOf<Paths, Path, Method>>,
  >({
    method,
    path,
    ...mutationOpts
  }: Omit<UseMutationOptions<SuccessOf<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
    method: Method;
    path: Path;
  }) {
    return mutationOptions({
      mutationFn: (variables?: Variables) => api.request(method, path, variables),
      ...mutationOpts,
    });
  }

  return { options };
}
