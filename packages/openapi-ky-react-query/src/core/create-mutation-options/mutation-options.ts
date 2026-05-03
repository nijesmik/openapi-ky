import type { Client, HttpMethod, PathsFor } from "@nijesmik/openapi-ky";

import { mutationOptions as tanstackMutationOptions } from "@tanstack/react-query";

import type {
  CreateDynamicMutationOptions,
  CreateMutationOptions,
  CreateStaticMutationOptions,
  DynamicMutationFunctionVariables,
  StaticMutationFunctionVariables,
  UseDynamicMutationOptions,
  UseStaticMutationOptions,
} from "@/types/mutation";

export function mutationOptions<Paths extends object>(api: Client<Paths>) {
  function mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateStaticMutationOptions<Paths, Path, Method>,
  ): UseStaticMutationOptions<Paths, Path, Method>;
  function mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateDynamicMutationOptions<Paths, Path, Method>,
  ): UseDynamicMutationOptions<Paths, Path, Method>;
  function mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateMutationOptions<Paths, Path, Method>,
  ): UseStaticMutationOptions<Paths, Path, Method> | UseDynamicMutationOptions<Paths, Path, Method>;
  function mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateMutationOptions<Paths, Path, Method>,
  ) {
    if (options.params !== undefined || options.searchParams !== undefined) {
      // Narrow: the runtime guard above implies the static branch, but TS
      // can't discriminate the union by `params`/`searchParams` presence —
      // both branches type those fields, so we assert the narrowing here.
      const { method, path, params, searchParams, kyOptions, ...rest } =
        options as CreateStaticMutationOptions<Paths, Path, Method>;
      return tanstackMutationOptions({
        mutationFn: (variables: StaticMutationFunctionVariables<Paths, Path, Method>) =>
          api(path, {
            ...kyOptions,
            params,
            searchParams,
            json: variables,
            method,
          }).json(),
        ...rest,
      });
    }

    const { method, path, kyOptions, ...rest } = options as CreateDynamicMutationOptions<
      Paths,
      Path,
      Method
    >;
    return tanstackMutationOptions({
      mutationFn: (variables: DynamicMutationFunctionVariables<Paths, Path, Method>) =>
        api(path, {
          ...kyOptions,
          ...variables,
          method,
        }).json(),
      ...rest,
    });
  }

  return mutationOptions;
}
