import type {
  HttpMethod,
  KyOptions,
  Options,
  PathsFor,
  PathParams,
  RequestBody,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";
import type { UseMutationOptions } from "@tanstack/react-query";

/** Paths without `{...}` parameters (e.g. `/posts`, not `/posts/{id}`). */
export type StaticPathsFor<TPaths extends object, TMethod extends HttpMethod> = {
  [TPath in PathsFor<TPaths, TMethod>]: [PathParams<TPaths, TPath, TMethod>] extends [never]
    ? TPath
    : never;
}[PathsFor<TPaths, TMethod>];

export type MutationFnOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = Omit<Options<TPaths, TPath, TMethod>, "method">;

export type StrictMutationFnOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = MutationFnOptions<TPaths, TPath, TMethod> &
  ([PathParams<TPaths, TPath, TMethod>] extends [never]
    ? unknown
    : { params: PathParams<TPaths, TPath, TMethod> });

export type MutationFnVariables<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = RequestBody<TPaths, TPath, TMethod> | MutationFnOptions<TPaths, TPath, TMethod>;

export type CreateMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
  TVariables extends MutationFnVariables<TPaths, TPath, TMethod> = MutationFnVariables<
    TPaths,
    TPath,
    TMethod
  >,
> = Omit<
  UseMutationOptions<ResponseBody<TPaths, TPath, TMethod>, Error, TVariables>,
  "mutationFn"
> & {
  method: TMethod;
  path: TPath;
  params?: PathParams<TPaths, TPath, TMethod>;
  searchParams?: SearchParams;
  kyOptions?: KyOptions;
};
