import type { Options as KyOptions } from "ky";
import type {
  FilterKeys,
  HttpMethod,
  OperationRequestBodyContent,
  PathsWithMethod,
  ResponseObjectMap,
  SuccessResponse,
} from "openapi-typescript-helpers";

export type Params = Record<string, boolean | number | string>;

export type SearchParams = NonNullable<KyOptions["searchParams"]>;

export type PathsFor<Paths extends object, Method extends HttpMethod> = PathsWithMethod<
  Paths,
  Method
> &
  string;

export type RequestBody<Paths, Path extends keyof Paths, Method extends HttpMethod> =
  OperationRequestBodyContent<FilterKeys<Paths[Path], Method>> extends undefined
    ? void
    : OperationRequestBodyContent<FilterKeys<Paths[Path], Method>>;

export type ResponseBody<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod = "get",
> = SuccessResponse<
  Extract<ResponseObjectMap<FilterKeys<Paths[Path], Method>>, Record<number | string, unknown>>
>;
