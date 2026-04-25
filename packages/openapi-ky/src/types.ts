import type {
  FilterKeys,
  HttpMethod,
  OperationRequestBodyContent,
  PathsWithMethod,
  ResponseObjectMap,
  SuccessResponse,
} from "openapi-typescript-helpers";
import type { Options as KyOptions } from "ky";

export type Params = Record<string, boolean | number | string>;

export type Options<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod = "get",
> = Omit<KyOptions, "json" | "method"> & {
  method?: Method;
  params?: Params;
} & ([RequestBody<Paths, Path, Method>] extends [never | undefined]
    ? unknown
    : { json: RequestBody<Paths, Path, Method> });

export type RequestBody<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod,
> = OperationRequestBodyContent<FilterKeys<Paths[Path], Method>>;

export type ResponseBody<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod = "get",
> = SuccessResponse<
  Extract<ResponseObjectMap<FilterKeys<Paths[Path], Method>>, Record<number | string, unknown>>
>;

export type PathsFor<Paths extends object, Method extends HttpMethod> = PathsWithMethod<
  Paths,
  Method
> &
  string;
