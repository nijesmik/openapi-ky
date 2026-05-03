import type { Internal } from "@nijesmik/openapi-ky/internal";

import {
  type Client,
  type HttpMethod,
  type PathsFor,
  type ResponseBody,
} from "@nijesmik/openapi-ky";
import { queryOptions as tanstackQueryOptions } from "@tanstack/react-query";

import type { CreateSuspenseQueryOptions, Flat } from "@/types/query";

import { queryKey } from "@/lib/query-key";

import { apiOptions } from "./api-options";

export function suspenseQueryOptions<Paths extends object>(api: Client<Paths>) {
  return function suspenseQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >(options: CreateSuspenseQueryOptions<Paths, Path, Method, Data>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...rest } =
      options as Flat<CreateSuspenseQueryOptions<Paths, Path, Method, Data>, Paths, Path, Method>;

    return tanstackQueryOptions({
      queryKey: queryKey(path, { method, params: params as Internal.PathParams, searchParams }),
      queryFn: () =>
        api(
          path,
          apiOptions<Paths, Path, Method>({
            method,
            params,
            searchParams,
            kyOptions,
            json,
          }),
        ).json(),
      select,
      ...rest,
    });
  };
}
