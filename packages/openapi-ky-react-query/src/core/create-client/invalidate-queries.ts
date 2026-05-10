import type { HttpMethod, PathsFor } from "@nijesmik/openapi-ky";
import type { InvalidateOptions, InvalidateQueryFilters, QueryClient } from "@tanstack/react-query";

import type { QueryKeyOptions } from "@/types/query-key";

import { getQueryKey } from "./get-query-key";

export function invalidateQueries<TPaths extends object>(queryClient: () => QueryClient) {
  return function invalidateQueries<
    TPath extends PathsFor<TPaths, TMethod>,
    TMethod extends HttpMethod = "get",
  >(
    filters: Omit<InvalidateQueryFilters, "queryKey"> &
      QueryKeyOptions<TPaths, TPath, TMethod> & {
        path: TPath;
      },
    options?: InvalidateOptions,
  ) {
    const { method, path, params, searchParams, ...rest } = filters;
    return queryClient().invalidateQueries(
      {
        queryKey: getQueryKey(path, { method, params, searchParams }),
        ...rest,
      },
      options,
    );
  };
}
