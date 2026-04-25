import type { Options, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";

import type { InfiniteData } from "@tanstack/react-query";

import type { buildQueryKey } from "./lib/build-query-key";

export type QueryKey = ReturnType<typeof buildQueryKey>;

type RequestInput<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  Params = Options["params"],
  SearchParams = Options["searchParams"],
> = {
  path: Path;
  params?: Params;
  searchParams?: SearchParams;
  kyOptions?: Omit<Options, "params" | "searchParams">;
};

export type QueryOptionsParams<
  Paths extends object,
  Path extends PathsFor<Paths, "get">,
  Data,
  Params = Options["params"],
> = RequestInput<Paths, Path, Params> & {
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
  Options["params"],
  Record<string, string | number | boolean | undefined>
> & {
  pageParamKey?: string;
  initialPageParam: PageParam;
  select?: (data: InfiniteData<ResponseBody<Paths, Path>, PageParam>) => Data;
};
