import type { Params, PathsFor, ResponseBody, SearchParams } from "@nijesmik/openapi-ky";
import type { Options as KyOptions } from "ky";

import type { InfiniteData } from "@tanstack/react-query";

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
> = Omit<RequestInput<Paths, Path>, "params"> & {
  params?: Params | null;
  select?: (data: ResponseBody<Paths, Path>) => Data;
};

export type SuspenseQueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  Data,
> = RequestInput<Paths, Path> & {
  select?: (data: ResponseBody<Paths, Path>) => Data;
};

export type InfiniteQueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  PageParam,
  Data,
> = RequestInput<Paths, Path, Record<string, string | number | boolean | undefined>> & {
  pageParamKey?: string;
  initialPageParam: PageParam;
  select?: (data: InfiniteData<ResponseBody<Paths, Path>, PageParam>) => Data;
};
