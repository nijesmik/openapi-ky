import type {
  FilterKeys,
  HttpMethod,
  OperationRequestBodyContent,
  PathsWithMethod,
  ResponseObjectMap,
  SuccessResponse,
} from "openapi-typescript-helpers";

import { HTTPError, TimeoutError, type Options as KyOptions } from "ky";

export type Params = Record<string, boolean | number | string>;

export type Options<Body = never> = Omit<KyOptions, "json"> &
  ([Body] extends [never | undefined] ? unknown : { json: Body }) & {
    params?: Params;
  };

export type BodyOf<
  Paths,
  Path extends keyof Paths,
  Method extends HttpMethod,
> = OperationRequestBodyContent<FilterKeys<Paths[Path], Method>>;

export type SuccessOf<Paths, Path extends keyof Paths, Method extends HttpMethod> = SuccessResponse<
  Extract<ResponseObjectMap<FilterKeys<Paths[Path], Method>>, Record<number | string, unknown>>
>;

export type PathOf<Paths extends object, Method extends HttpMethod> = PathsWithMethod<
  Paths,
  Method
> &
  string;

export type ErrorHook = (error: unknown) => void;
export type HttpErrorHook = (error: HTTPError) => void;
export type TimeoutErrorHook = (error: TimeoutError) => void;

export interface ErrorOptions {
  onError?: ErrorHook;
  onHttpError?: HttpErrorHook;
  onTimeoutError?: TimeoutErrorHook;
}
