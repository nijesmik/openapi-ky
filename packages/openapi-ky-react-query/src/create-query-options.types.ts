import type { Params, PathsFor, ResponseBody, SearchParams } from "@nijesmik/openapi-ky";
import type { Options as KyOptions } from "ky";

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
  Path extends PathsFor<Paths, "get">,
  S extends SearchParams = SearchParams,
> = {
  path: Path;
  params?: Params;
  searchParams?: S;
  kyOptions?: Omit<KyOptions, "json" | "method" | "searchParams">;
};

export type QueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  Data,
  QueryOptions extends UseQueryOptions<
    ResponseBody<Paths, Path>,
    Error,
    Data
  > = UseQueryOptions<ResponseBody<Paths, Path>, Error, Data>,
> = Omit<RequestInput<Paths, Path>, "params"> & {
  params?: Params | null;
  select?: (data: ResponseBody<Paths, Path>) => Data;
} & Omit<QueryOptions, "queryFn" | "queryKey" | "select">;

export type SuspenseQueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  Data,
> = RequestInput<Paths, Path> & {
  select?: (data: ResponseBody<Paths, Path>) => Data;
} & Omit<
    UseSuspenseQueryOptions<ResponseBody<Paths, Path>, Error, Data>,
    "queryFn" | "queryKey" | "select"
  >;

export type InfiniteQueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  PageParam,
  Data,
  InfiniteQueryOptions extends UseInfiniteQueryOptions<
    ResponseBody<Paths, Path>,
    Error,
    Data,
    QueryKey,
    PageParam
  > = UseInfiniteQueryOptions<ResponseBody<Paths, Path>, Error, Data, QueryKey, PageParam>,
> = RequestInput<Paths, Path, Record<string, string | number | boolean | undefined>> & {
  pageParamKey?: string;
  initialPageParam: PageParam;
  select?: (data: InfiniteData<ResponseBody<Paths, Path>, PageParam>) => Data;
} & Omit<InfiniteQueryOptions, "queryFn" | "queryKey" | "initialPageParam" | "select">;
