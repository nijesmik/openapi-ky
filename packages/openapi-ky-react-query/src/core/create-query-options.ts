import type { Internal } from "@openapi-ky/internal";

import {
  type Client,
  type HttpMethod,
  type PathsFor,
  type ResponseBody,
} from "@nijesmik/openapi-ky";
import { skipToken, queryOptions as tanstackQueryOptions } from "@tanstack/react-query";

import type { Flat } from "@/types/internal";
import type { QueryOptions } from "@/types/query";

import { apiOptions } from "@/lib/api-options";
import { queryKey } from "@/lib/query-key";

export function createQueryOptions<TPaths extends object>(api: Client<TPaths>) {
  return function queryOptions<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
    TData = ResponseBody<TPaths, TPath, TMethod>,
  >(options: QueryOptions<TPaths, TPath, TMethod, TData>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...rest } =
      options as Flat<QueryOptions<TPaths, TPath, TMethod, TData>, TPaths, TPath, TMethod>;

    if (params === null) {
      return tanstackQueryOptions<ResponseBody<TPaths, TPath, TMethod>, Error, TData>({
        queryKey: queryKey(path, { method }),
        queryFn: skipToken,
      });
    }

    return tanstackQueryOptions({
      queryKey: queryKey(path, { method, params: params as Internal.PathParams, searchParams }),
      queryFn: () =>
        api(
          path,
          apiOptions<TPaths, TPath, TMethod>({
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
