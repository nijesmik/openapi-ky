import type {
  Client,
  HttpMethod,
  KyOptions,
  OptionsWithRequiredMethod,
  PathsFor,
  PathParams,
  RequestBody,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";

import {
  mutationOptions as tanstackMutationOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import type {
  CreateMutationOptions,
  MutationFnVariables,
  StaticPathsFor,
  StrictMutationFnOptions,
} from "@/types/mutation";

import { apiOptions } from "@/lib/api-options";

/**
 * When the path has placeholders and `params` is not bound at create time,
 * `params` is required at mutate time (narrows TVariables).
 */
export function createMutationOptions<TPaths extends object>(api: Client<TPaths>) {
  function mutationOptions<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod> & {
      params: PathParams<TPaths, TPath, TMethod>;
    },
  ): UseMutationOptions<
    ResponseBody<TPaths, TPath, TMethod>,
    Error,
    MutationFnVariables<TPaths, TPath, TMethod>
  >;
  function mutationOptions<
    TPath extends StaticPathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod,
  >(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ): UseMutationOptions<
    ResponseBody<TPaths, TPath, TMethod>,
    Error,
    MutationFnVariables<TPaths, TPath, TMethod>
  >;
  function mutationOptions<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ): UseMutationOptions<
    ResponseBody<TPaths, TPath, TMethod>,
    Error,
    StrictMutationFnOptions<TPaths, TPath, TMethod>
  >;
  function mutationOptions<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ) {
    const { method, path, params, searchParams, kyOptions, ...rest } = options;

    return tanstackMutationOptions({
      mutationFn: (variables: MutationFnVariables<TPaths, TPath, TMethod>) =>
        api(
          path,
          mutationApiOptions({
            method,
            params,
            searchParams,
            kyOptions,
            variables,
          }),
        ).json(),
      ...rest,
    });
  }

  return mutationOptions;
}

function mutationApiOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
>({
  method,
  params,
  searchParams,
  kyOptions,
  variables,
}: {
  method: TMethod;
  params?: PathParams<TPaths, TPath, TMethod>;
  searchParams?: SearchParams;
  kyOptions?: KyOptions;
  variables: MutationFnVariables<TPaths, TPath, TMethod>;
}): OptionsWithRequiredMethod<TPaths, TPath, TMethod> {
  if (isRequestBody(variables)) {
    return apiOptions<TPaths, TPath, TMethod>({
      method,
      params,
      searchParams,
      kyOptions,
      json: variables,
    });
  }

  // mutate-time이 우선이지만 `params` / `searchParams`가 명시적으로
  // `undefined`인 경우 create-time 값이 silently 클로버되지 않도록 nullish coalesce.
  return {
    ...kyOptions,
    ...variables.kyOptions,
    json: variables.json,
    params: variables.params ?? params,
    searchParams: variables.searchParams ?? searchParams,
    method,
  } as OptionsWithRequiredMethod<TPaths, TPath, TMethod>;
}

function isRequestBody<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
>(
  variables: MutationFnVariables<TPaths, TPath, TMethod>,
): variables is RequestBody<TPaths, TPath, TMethod> {
  return (
    variables === null ||
    typeof variables !== "object" ||
    !(
      "json" in variables ||
      "params" in variables ||
      "searchParams" in variables ||
      "kyOptions" in variables
    )
  );
}
