import type { Internal } from "@openapi-ky/internal";

import {
  type Client,
  type HttpMethod,
  type PathsFor,
  type ResponseBody,
} from "@nijesmik/openapi-ky";
import { queryOptions as tanstackQueryOptions } from "@tanstack/react-query";

import type { Flat } from "@/types/internal";
import type { CreateSuspenseQueryOptions } from "@/types/query";

import { apiOptions } from "@/lib/api-options";
import { queryKey } from "@/lib/query-key";

export function suspenseQueryOptions<TPaths extends object>(api: Client<TPaths>) {
  return function suspenseQueryOptions<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
    TData = ResponseBody<TPaths, TPath, TMethod>,
  >(options: CreateSuspenseQueryOptions<TPaths, TPath, TMethod, TData>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...rest } =
      options as Flat<
        CreateSuspenseQueryOptions<TPaths, TPath, TMethod, TData>,
        TPaths,
        TPath,
        TMethod
      >;

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
