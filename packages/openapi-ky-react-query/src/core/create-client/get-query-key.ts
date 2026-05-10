import type { HttpMethod, PathsFor } from "@nijesmik/openapi-ky";

import type * as Internal from "@/types/internal";
import type { QueryKeyOptions } from "@/types/query-key";

import { queryKey } from "@/lib/query-key";

export function getQueryKey<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod = "get",
>(path: TPath, options?: QueryKeyOptions<TPaths, TPath, TMethod>) {
  return queryKey(path, options as Internal.QueryKeyOptions);
}
