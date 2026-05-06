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

import { apiOptions } from "@/lib/api-options";

export function mutationOptions<TPaths extends object>(api: Client<TPaths>) {
  function mutationOptions<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateStaticMutationOptions<TPaths, TPath, TMethod>,
  ): UseStaticMutationOptions<TPaths, TPath, TMethod>;
  function mutationOptions<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateDynamicMutationOptions<TPaths, TPath, TMethod>,
  ): UseDynamicMutationOptions<TPaths, TPath, TMethod>;
  function mutationOptions<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ):
    | UseStaticMutationOptions<TPaths, TPath, TMethod>
    | UseDynamicMutationOptions<TPaths, TPath, TMethod>;
  function mutationOptions<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ) {
    if (isStaticMutationOptions(options)) {
      const { method, path, params, searchParams, kyOptions, ...rest } = options;
      return tanstackMutationOptions({
        mutationFn: (variables: StaticMutationFunctionVariables<TPaths, TPath, TMethod>) =>
          api(
            path,
            apiOptions<TPaths, TPath, TMethod>({
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
      mutationFn: (variables: DynamicMutationFunctionVariables<TPaths, TPath, TMethod>) =>
        api(
          path,
          // `JsonField` is method-conditional and cannot be reduced in a
          // generic context. `apiOptions` covers this via destructured args,
          // but `variables` here carries the full ky-options shape, so we
          // cast inline instead.
          {
            ...kyOptions,
            ...variables,
            method,
          } as OptionsWithRequiredMethod<TPaths, TPath, TMethod>,
        ).json(),
      ...rest,
    });
  }

  return mutationOptions;
}

function isStaticMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
>(
  options: CreateMutationOptions<TPaths, TPath, TMethod>,
): options is CreateStaticMutationOptions<TPaths, TPath, TMethod> {
  return options.params !== undefined || options.searchParams !== undefined;
}
