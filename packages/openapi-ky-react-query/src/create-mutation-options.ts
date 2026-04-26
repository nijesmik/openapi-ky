import type { Client, HttpMethod, PathsFor, RequestBody } from "@nijesmik/openapi-ky";

import { mutationOptions as buildMutationOptions } from "@tanstack/react-query";

import type { MutationOptionsParams } from "./create-mutation-options.types";

export function createMutationOptions<Paths extends object>(api: Client<Paths>) {
  function mutationOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod,
    Variables extends RequestBody<Paths, Path, Method>,
  >({
    method,
    path,
    params,
    searchParams,
    kyOptions,
    ...mutationOpts
  }: MutationOptionsParams<Paths, Path, Method, Variables>) {
    return buildMutationOptions({
      mutationFn: (variables: Variables) =>
        api(path, {
          method,
          params,
          searchParams,
          ...kyOptions,
          json: variables,
        }).json(),
      ...mutationOpts,
    });
  }

  function mutationOptionsWithMethod<Method extends HttpMethod>(method: Method) {
    return <
      Path extends PathsFor<Paths, Method>,
      Variables extends RequestBody<Paths, Path, Method>,
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
