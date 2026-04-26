import type {
  HttpMethod,
  JsonField,
  KyOptions,
  Params,
  PathsFor,
  ResponseBody,
  SearchParams,
} from "@nijesmik/openapi-ky";

import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions,
} from "@tanstack/react-query";

import type { buildQueryKey } from "./lib/build-query-key";

export type QueryKey = ReturnType<typeof buildQueryKey>;

type RequestInput<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  S extends SearchParams = SearchParams,
> = {
  path: Path;
  method?: Method;
  params?: Params;
  searchParams?: S;
  kyOptions?: Omit<KyOptions, "json" | "method" | "searchParams">;
} & JsonField<Paths, Path, Method>;

export type QueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  Data = ResponseBody<Paths, Path, Method>,
> = Omit<RequestInput<Paths, Path, Method>, "params"> & {
  params?: Params | null;
  select?: (data: ResponseBody<Paths, Path, Method>) => Data;
} & Omit<
    UseQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>,
    "queryFn" | "queryKey" | "select"
  >;

export type SuspenseQueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod = "get",
  Data = ResponseBody<Paths, Path, Method>,
> = RequestInput<Paths, Path, Method> & {
  select?: (data: ResponseBody<Paths, Path, Method>) => Data;
} & Omit<
    UseSuspenseQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>,
    "queryFn" | "queryKey" | "select"
  >;

export type InfiniteQueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
  PageParam,
  Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
> = RequestInput<Paths, Path, Method, Record<string, string | number | boolean | undefined>> & {
  pageParamKey?: string;
  initialPageParam: PageParam;
  select?: (data: InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>) => Data;
} & Omit<
    UseInfiniteQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data, QueryKey, PageParam>,
    "queryFn" | "queryKey" | "initialPageParam" | "select"
  >;
