import type { Client, HttpMethod, Options, PathsFor } from "@nijesmik/openapi-ky";

import { mutationOptions as buildMutationOptions } from "@tanstack/react-query";

import type { MutationOptionsParams } from "./types/mutation";

export function createMutationOptions<Paths extends object>(api: Client<Paths>) {
  function mutationOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod,
    Variables extends Omit<Options<Paths, Path, Method>, "method">,
  >({
    method,
    path,
    kyOptions,
    ...mutationOpts
  }: MutationOptionsParams<Paths, Path, Method, Variables>) {
    return buildMutationOptions({
      mutationFn: (variables: Variables) =>
        api(path, {
          ...kyOptions,
          ...variables,
          method,
        }).json(),
      ...mutationOpts,
    });
  }

  function mutationOptionsWithMethod<Method extends HttpMethod>(method: Method) {
    return <
      Path extends PathsFor<Paths, Method>,
      Variables extends Omit<Options<Paths, Path, Method>, "method">,
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
