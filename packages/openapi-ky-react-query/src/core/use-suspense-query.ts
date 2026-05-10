import { type HttpMethod, type PathsFor, type ResponseBody } from "@nijesmik/openapi-ky";
import {
  useSuspenseQuery as tanstackUseSuspenseQuery,
  type UseSuspenseQueryResult,
} from "@tanstack/react-query";

import type { SuspenseQueryOptions } from "@/types/query";

import type { createSuspenseQueryOptions } from "./create-suspense-query-options";

export function useSuspenseQuery<TPaths extends object>(
  suspenseQueryOptions: ReturnType<typeof createSuspenseQueryOptions<TPaths>>,
) {
  return function useSuspenseQuery<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
    TData = ResponseBody<TPaths, TPath, TMethod>,
  >(
    options: SuspenseQueryOptions<TPaths, TPath, TMethod, TData>,
  ): UseSuspenseQueryResult<TData, Error> {
    return tanstackUseSuspenseQuery(suspenseQueryOptions(options));
  };
}
