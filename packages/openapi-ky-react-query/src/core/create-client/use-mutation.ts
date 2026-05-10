import type { HttpMethod, PathsFor, PathParams, ResponseBody } from "@nijesmik/openapi-ky";

import { useMutation as tanstackUseMutation, type UseMutationResult } from "@tanstack/react-query";

import type {
  CreateMutationOptions,
  MutationFnVariables,
  StaticPathsFor,
  StrictMutationFnOptions,
} from "@/types/mutation";

import type { createMutationOptions } from "./create-mutation-options";

export function useMutation<TPaths extends object>(
  mutationOptions: ReturnType<typeof createMutationOptions<TPaths>>,
) {
  function useMutation<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod> & {
      params: PathParams<TPaths, TPath, TMethod>;
    },
  ): UseMutationResult<
    ResponseBody<TPaths, TPath, TMethod>,
    Error,
    MutationFnVariables<TPaths, TPath, TMethod>
  >;
  function useMutation<TPath extends StaticPathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ): UseMutationResult<
    ResponseBody<TPaths, TPath, TMethod>,
    Error,
    MutationFnVariables<TPaths, TPath, TMethod>
  >;
  function useMutation<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ): UseMutationResult<
    ResponseBody<TPaths, TPath, TMethod>,
    Error,
    StrictMutationFnOptions<TPaths, TPath, TMethod>
  >;
  function useMutation<TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod>(
    options: CreateMutationOptions<TPaths, TPath, TMethod>,
  ):
    | UseMutationResult<
        ResponseBody<TPaths, TPath, TMethod>,
        Error,
        MutationFnVariables<TPaths, TPath, TMethod>
      >
    | UseMutationResult<
        ResponseBody<TPaths, TPath, TMethod>,
        Error,
        StrictMutationFnOptions<TPaths, TPath, TMethod>
      > {
    // `as never` escapes invariant `TVariables` to fit the union return.
    return tanstackUseMutation(mutationOptions(options)) as never;
  }

  return useMutation;
}
