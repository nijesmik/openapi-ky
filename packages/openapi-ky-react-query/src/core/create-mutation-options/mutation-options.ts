import type { Client, HttpMethod, OptionsWithRequiredMethod, PathsFor } from "@nijesmik/openapi-ky";

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

import { apiOptions } from "../create-query-options/api-options";

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
    if (isStaticMutationOptions(options)) {
      const { method, path, params, searchParams, kyOptions, ...rest } = options;
      return tanstackMutationOptions({
        mutationFn: (variables: StaticMutationFunctionVariables<Paths, Path, Method>) =>
          api(
            path,
            apiOptions<Paths, Path, Method>({
              method,
              params,
              searchParams,
              kyOptions,
              json: variables,
            }),
          ).json(),
        ...rest,
      });
    }

    const { method, path, kyOptions, ...rest } = options;
    return tanstackMutationOptions({
      mutationFn: (variables: DynamicMutationFunctionVariables<Paths, Path, Method>) =>
        api(
          path,
          // `variables` carries the full ky-options shape; `JsonField` is
          // method-conditional and cannot be reduced in a generic context, so
          // assert the call-site type after merging method.
          {
            ...kyOptions,
            ...variables,
            method,
          } as OptionsWithRequiredMethod<Paths, Path, Method>,
        ).json(),
      ...rest,
    });
  }

  return mutationOptions;
}

function isStaticMutationOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
>(
  options: CreateMutationOptions<Paths, Path, Method>,
): options is CreateStaticMutationOptions<Paths, Path, Method> {
  return options.params !== undefined || options.searchParams !== undefined;
}
