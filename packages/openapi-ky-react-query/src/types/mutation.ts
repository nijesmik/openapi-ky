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

export type StaticMutationFunctionVariables<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = RequestBody<TPaths, TPath, TMethod>;

export type DynamicMutationFunctionVariables<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = Omit<Options<TPaths, TPath, TMethod>, "method">;

export type MutationFunctionVariables<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> =
  | StaticMutationFunctionVariables<TPaths, TPath, TMethod>
  | DynamicMutationFunctionVariables<TPaths, TPath, TMethod>;

type CreateBaseMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
  TVariables extends MutationFunctionVariables<TPaths, TPath, TMethod>,
> = Omit<
  UseMutationOptions<ResponseBody<TPaths, TPath, TMethod>, Error, TVariables>,
  "mutationFn"
> & {
  method: TMethod;
  path: TPath;
  kyOptions?: KyOptions;
};

export type CreateStaticMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = CreateBaseMutationOptions<
  TPaths,
  TPath,
  TMethod,
  StaticMutationFunctionVariables<TPaths, TPath, TMethod>
> &
  (
    | { params: PathParams<TPaths, TPath, TMethod>; searchParams?: SearchParams }
    | { params?: never; searchParams: SearchParams }
  );

export type CreateDynamicMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = CreateBaseMutationOptions<
  TPaths,
  TPath,
  TMethod,
  DynamicMutationFunctionVariables<TPaths, TPath, TMethod>
> & {
  params?: never;
  searchParams?: never;
};

export type CreateMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> =
  | CreateStaticMutationOptions<TPaths, TPath, TMethod>
  | CreateDynamicMutationOptions<TPaths, TPath, TMethod>;

export type UseStaticMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = UseMutationOptions<
  ResponseBody<TPaths, TPath, TMethod>,
  Error,
  StaticMutationFunctionVariables<TPaths, TPath, TMethod>
>;

export type UseDynamicMutationOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = UseMutationOptions<
  ResponseBody<TPaths, TPath, TMethod>,
  Error,
  DynamicMutationFunctionVariables<TPaths, TPath, TMethod>
>;
