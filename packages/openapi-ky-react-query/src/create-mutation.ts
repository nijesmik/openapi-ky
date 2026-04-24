import type { BodyOf, Client, Options, PathOf, SuccessOf } from "@nijesmik/openapi-ky";

import { mutationOptions, type UseMutationOptions } from "@tanstack/react-query";

type MutationMethod = "delete" | "patch" | "post" | "put";

export function createMutation<Paths extends object>(api: Client<Paths>) {
  function options<
    Method extends MutationMethod,
    Path extends PathOf<Paths, Method>,
    Variables extends Options<BodyOf<Paths, Path, Method>>,
  >({
    method,
    path,
    ...mutationOpts
  }: Omit<UseMutationOptions<SuccessOf<Paths, Path, Method> | undefined, Error, Variables>, "mutationFn"> & {
    method: Method;
    path: Path;
  }) {
    return mutationOptions({
      mutationFn: async (variables?: Variables) => {
        const response = await api.request(method, path, variables);
        return await response?.json();
      },
      ...mutationOpts,
    });
  }

  return { options };
}
