import type { Client, Options, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import { mutationOptions as buildMutationOptions } from "@tanstack/react-query";

import type {
  MutationMethod,
  MutationOptionsParams,
} from "./create-mutation-options.types";

export function createMutationOptions<Paths extends object>(api: Client<Paths>) {
  function mutationOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends MutationMethod,
    Variables extends Options<Paths, Path, Method>,
  >({
    method,
    path,
    ...mutationOpts
  }: MutationOptionsParams<Paths, Path, Method, Variables>) {
    return buildMutationOptions({
      mutationFn: (variables?: Variables) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (api as any)(path, { ...variables, method }).json() as Promise<ResponseBody<Paths, Path, Method>>,
      ...mutationOpts,
    });
  }

  function mutationOptionsWithMethod<Method extends MutationMethod>(method: Method) {
    return <
      Path extends PathsFor<Paths, Method>,
      Variables extends Options<Paths, Path, Method>,
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
