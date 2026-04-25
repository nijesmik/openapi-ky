import type { Client, Options, PathsFor, RequestBody, ResponseBody } from "@nijesmik/openapi-ky";

import { mutationOptions, type UseMutationOptions } from "@tanstack/react-query";

type MutationMethod = "delete" | "patch" | "post" | "put";

export function createMutation<Paths extends object>(api: Client<Paths>) {
  function options<
    Method extends MutationMethod,
    Path extends PathsFor<Paths, Method>,
    Variables extends Options<RequestBody<Paths, Path, Method>>,
  >({
    method,
    path,
    ...mutationOpts
  }: Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
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
