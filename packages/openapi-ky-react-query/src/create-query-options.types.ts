import type { Params, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";
import type { Options as KyOptions } from "ky";

import type { InfiniteData } from "@tanstack/react-query";

import type { buildQueryKey } from "./lib/build-query-key";

export type QueryKey = ReturnType<typeof buildQueryKey>;

type RequestInput<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  PathParams = Params,
  SearchParams = KyOptions["searchParams"],
> = {
  path: Path;
  params?: PathParams;
  searchParams?: SearchParams;
  kyOptions?: Omit<KyOptions, "json" | "method" | "searchParams">;
};

export type QueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  Data,
  PathParams = Params,
> = RequestInput<Paths, Path, PathParams> & {
  select?: (data: ResponseBody<Paths, Path>) => Data;
};

export type InfiniteQueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  PageParam,
  Data,
> = RequestInput<
  Paths,
  Path,
  Params,
  Record<string, string | number | boolean | undefined>
> & {
  pageParamKey?: string;
  initialPageParam: PageParam;
  select?: (data: InfiniteData<ResponseBody<Paths, Path>, PageParam>) => Data;
};
