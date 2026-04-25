import type { Client, Options, PathsFor, RequestBody, ResponseBody } from "@nijesmik/openapi-ky";

import {
  mutationOptions as buildMutationOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

type MutationMethod = "delete" | "patch" | "post" | "put";

type MutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends MutationMethod,
  Variables extends Options<RequestBody<Paths, Path, Method>>,
> = Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
  method: Method;
  path: Path;
};

export function createMutationOptions<Paths extends object>(api: Client<Paths>) {
  function mutationOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends MutationMethod,
    Variables extends Options<RequestBody<Paths, Path, Method>>,
  >({
    method,
    path,
    ...mutationOpts
  }: MutationOptionsParams<Paths, Path, Method, Variables>) {
    return buildMutationOptions({
      mutationFn: (variables?: Variables) => api.request(method, path, variables),
      ...mutationOpts,
    });
  }

  function mutationOptionsWithMethod<Method extends MutationMethod>(method: Method) {
    return <
      Path extends PathsFor<Paths, Method>,
      Variables extends Options<RequestBody<Paths, Path, Method>>,
    >(
      args: Omit<MutationOptionsParams<Paths, Path, Method, Variables>, "method">,
    ) => mutationOptions({ ...args, method });
  }

  return Object.assign(mutationOptions, {
    post: mutationOptionsWithMethod("post"),
    put: mutationOptionsWithMethod("put"),
    patch: mutationOptionsWithMethod("patch"),
    delete: mutationOptionsWithMethod("delete"),
  });
}
