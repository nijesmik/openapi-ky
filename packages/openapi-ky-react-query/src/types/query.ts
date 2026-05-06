import type {
  HttpMethod,
  JsonField,
  KyOptions,
  PathsFor,
  PathParams,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";
import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

import type { queryKey } from "@/lib/query-key";

export type QueryKey = ReturnType<typeof queryKey>;

/**
 * `TMethod` must be inferable from an unconditional intersection position —
 * if `{ method?: TMethod }` is moved into the conditional branches, TS fixes
 * `TMethod` to the default `"get"` before resolving and rejects value-based
 * inference like `method: "post"` → `TMethod = "post"`. The non-GET branch's
 * `& { method: TMethod }` makes the field required so externally-bound
 * `TMethod` (e.g. `<TPath, "post">`) cannot pass with `method` omitted.
 */
type MethodField<TMethod extends HttpMethod> = { method?: TMethod } & (TMethod extends "get"
  ? unknown
  : { method: TMethod });

export type QueryRequestOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod = "get",
  TSearchParams extends SearchParams = SearchParams,
> = JsonField<TPaths, TPath, TMethod> &
  MethodField<TMethod> & {
    path: TPath;
    params?: PathParams<TPaths, TPath, TMethod>;
    searchParams?: TSearchParams;
    kyOptions?: KyOptions;
  };

export type CreateQueryOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod = "get",
  TData = ResponseBody<TPaths, TPath, TMethod>,
> = Omit<
  UseQueryOptions<ResponseBody<TPaths, TPath, TMethod>, Error, TData>,
  "queryFn" | "queryKey" | "select"
> &
  Omit<QueryRequestOptions<TPaths, TPath, TMethod>, "params"> & {
    /**
     * `null` is a sentinel that switches `queryFn` to TanStack's `skipToken`
     * (disables the query). Only `CreateQueryOptions` accepts it — suspense /
     * infinite always fire the query and do not expose this disable knob.
     */
    params?: PathParams<TPaths, TPath, TMethod> | null;
    select?: (data: ResponseBody<TPaths, TPath, TMethod>) => TData;
  };

export type CreateSuspenseQueryOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod = "get",
  TData = ResponseBody<TPaths, TPath, TMethod>,
> = Omit<
  UseSuspenseQueryOptions<ResponseBody<TPaths, TPath, TMethod>, Error, TData>,
  "queryFn" | "queryKey" | "select"
> &
  QueryRequestOptions<TPaths, TPath, TMethod> & {
    select?: (data: ResponseBody<TPaths, TPath, TMethod>) => TData;
  };

export type CreateInfiniteQueryOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
  TPageParam,
  TData = InfiniteData<ResponseBody<TPaths, TPath, TMethod>, TPageParam>,
> = Omit<
  UseInfiniteQueryOptions<ResponseBody<TPaths, TPath, TMethod>, Error, TData, QueryKey, TPageParam>,
  "queryFn" | "queryKey" | "initialPageParam" | "select"
> &
  QueryRequestOptions<
    TPaths,
    TPath,
    TMethod,
    Record<string, string | number | boolean | undefined>
  > & {
    pageParamKey?: string;
    initialPageParam: TPageParam;
    select?: (data: InfiniteData<ResponseBody<TPaths, TPath, TMethod>, TPageParam>) => TData;
  };
