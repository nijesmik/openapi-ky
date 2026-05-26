import type { Internal } from "@openapi-ky/internal";

import {
  type Client,
  type HttpMethod,
  type PathsFor,
  type ResponseBody,
} from "@nijesmik/openapi-ky";
import { queryOptions as tanstackQueryOptions } from "@tanstack/react-query";

import type { Flat } from "@/types/internal";
import type { SuspenseQueryOptions } from "@/types/query";

import { apiOptions } from "@/lib/api-options";
import { queryKey } from "@/lib/query-key";
import { safeJson } from "@/lib/safe-json";

export function createSuspenseQueryOptions<TPaths extends object>(api: Client<TPaths>) {
  return function suspenseQueryOptions<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
    TData = ResponseBody<TPaths, TPath, TMethod>,
  >(options: SuspenseQueryOptions<TPaths, TPath, TMethod, TData>) {
    const { path, method, params, searchParams, kyOptions, select, json, ...rest } =
      options as Flat<SuspenseQueryOptions<TPaths, TPath, TMethod, TData>, TPaths, TPath, TMethod>;

    return tanstackQueryOptions({
      queryKey: queryKey(path, { method, params: params as Internal.PathParams, searchParams }),
      queryFn: () =>
        safeJson(
          api(
            path,
            apiOptions<TPaths, TPath, TMethod>({
              method,
              params,
              searchParams,
              kyOptions,
              json,
            }),
          ),
        ),
      select,
      ...rest,
    });
  };
}
