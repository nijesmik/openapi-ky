import type { Options as KyOptions } from "ky";
import type {
  FilterKeys,
  HttpMethod,
  OperationRequestBodyContent,
  PathsWithMethod,
  ResponseObjectMap,
  SuccessResponse,
} from "openapi-typescript-helpers";

export type SearchParams = NonNullable<KyOptions["searchParams"]>;

export type PathsFor<TPaths extends object, TMethod extends HttpMethod> = PathsWithMethod<
  TPaths,
  TMethod
> &
  string;

export type RequestBody<TPaths, TPath extends keyof TPaths, TMethod extends HttpMethod> =
  OperationRequestBodyContent<FilterKeys<TPaths[TPath], TMethod>> extends undefined
    ? void
    : OperationRequestBodyContent<FilterKeys<TPaths[TPath], TMethod>>;

export type ResponseBody<
  TPaths,
  TPath extends keyof TPaths,
  TMethod extends HttpMethod = "get",
> = SuccessResponse<
  Extract<ResponseObjectMap<FilterKeys<TPaths[TPath], TMethod>>, Record<number | string, unknown>>
>;

export type PathParams<
  TPaths,
  TPath extends keyof TPaths,
  TMethod extends HttpMethod,
> = TPaths[TPath] extends { [M in TMethod]?: { parameters: { path: infer P } } } ? P : never;
