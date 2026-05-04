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
 * `Method` must be inferable from an unconditional intersection position —
 * if `{ method?: Method }` is moved into the conditional branches, TS fixes
 * `Method` to the default `"get"` before resolving and rejects value-based
 * inference like `method: "post"` → `Method = "post"`. The non-GET branch's
 * `& { method: Method }` makes the field required so externally-bound
 * `Method` (e.g. `<Path, "post">`) cannot pass with `method` omitted.
 */
type MethodField<Method extends HttpMethod> = { method?: Method } & (Method extends "get"
  ? unknown
  : { method: Method });

export type RequestInput<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  S extends SearchParams = SearchParams,
> = JsonField<Paths, Path, Method> &
  MethodField<Method> & {
    path: Path;
    params?: PathParams<Paths, Path, Method>;
    searchParams?: S;
    kyOptions?: KyOptions;
  };

export type CreateQueryOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  Data = ResponseBody<Paths, Path, Method>,
> = Omit<
  UseQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>,
  "queryFn" | "queryKey" | "select"
> &
  Omit<RequestInput<Paths, Path, Method>, "params"> & {
    params?: PathParams<Paths, Path, Method> | null;
    select?: (data: ResponseBody<Paths, Path, Method>) => Data;
  };

export type CreateSuspenseQueryOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  Data = ResponseBody<Paths, Path, Method>,
> = Omit<
  UseSuspenseQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>,
  "queryFn" | "queryKey" | "select"
> &
  RequestInput<Paths, Path, Method> & {
    select?: (data: ResponseBody<Paths, Path, Method>) => Data;
  };

export type CreateInfiniteQueryOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
  PageParam,
  Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
> = Omit<
  UseInfiniteQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data, QueryKey, PageParam>,
  "queryFn" | "queryKey" | "initialPageParam" | "select"
> &
  RequestInput<Paths, Path, Method, Record<string, string | number | boolean | undefined>> & {
    pageParamKey?: string;
    initialPageParam: PageParam;
    select?: (data: InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>) => Data;
  };
