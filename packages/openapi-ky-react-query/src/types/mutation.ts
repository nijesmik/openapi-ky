import type {
  HttpMethod,
  KyOptions,
  Options,
  Params,
  PathsFor,
  RequestBody,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";

import type { UseMutationOptions } from "@tanstack/react-query";

// ----- mutationFn variables (mutate() argument shapes) -----

export type StaticMutationFunctionVariables<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> = RequestBody<Paths, Path, Method>;

export type DynamicMutationFunctionVariables<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> = Omit<Options<Paths, Path, Method>, "method">;

export type MutationFunctionVariables<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> =
  | StaticMutationFunctionVariables<Paths, Path, Method>
  | DynamicMutationFunctionVariables<Paths, Path, Method>;

// ----- mutationOptions input params -----

type BaseMutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
  Variables extends MutationFunctionVariables<Paths, Path, Method>,
> = Omit<UseMutationOptions<ResponseBody<Paths, Path, Method>, Error, Variables>, "mutationFn"> & {
  method: Method;
  path: Path;
  kyOptions?: KyOptions;
};

export type StaticMutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> = BaseMutationOptionsParams<
  Paths,
  Path,
  Method,
  StaticMutationFunctionVariables<Paths, Path, Method>
> &
  (
    | { params: Params; searchParams?: SearchParams }
    | { params?: never; searchParams: SearchParams }
  );

export type DynamicMutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> = BaseMutationOptionsParams<
  Paths,
  Path,
  Method,
  DynamicMutationFunctionVariables<Paths, Path, Method>
> & {
  params?: never;
  searchParams?: never;
};

export type MutationOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> =
  | StaticMutationOptionsParams<Paths, Path, Method>
  | DynamicMutationOptionsParams<Paths, Path, Method>;

// ----- useMutation options output (UseMutationOptions aliases) -----

export type UseStaticMutationOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> = UseMutationOptions<
  ResponseBody<Paths, Path, Method>,
  Error,
  StaticMutationFunctionVariables<Paths, Path, Method>
>;

export type UseDynamicMutationOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> = UseMutationOptions<
  ResponseBody<Paths, Path, Method>,
  Error,
  DynamicMutationFunctionVariables<Paths, Path, Method>
>;
