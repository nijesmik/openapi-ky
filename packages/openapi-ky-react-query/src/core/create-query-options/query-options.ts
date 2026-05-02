import {
  type Client,
  type HttpMethod,
  type PathsFor,
  type ResponseBody,
} from "@nijesmik/openapi-ky";
import { skipToken, queryOptions as tanstackQueryOptions } from "@tanstack/react-query";

import type { CreateQueryOptions, Flat } from "@/types/query";

import { buildQueryKey } from "@/lib/build-query-key";

import { apiOptions } from "./api-options";

export function queryOptions<Paths extends object>(api: Client<Paths>) {
  return function queryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >(options: CreateQueryOptions<Paths, Path, Method, Data>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...rest } =
      options as Flat<CreateQueryOptions<Paths, Path, Method, Data>, Paths, Path, Method>;

    if (params === null) {
      return tanstackQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>({
        queryKey: buildQueryKey(path, { method }),
        queryFn: skipToken,
      });
    }

    return tanstackQueryOptions({
      queryKey: buildQueryKey(path, { method, params, searchParams }),
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
