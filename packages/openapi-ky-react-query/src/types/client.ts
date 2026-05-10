import type { HttpMethod, PathsFor } from "@nijesmik/openapi-ky";

import type { createInfiniteQueryOptions } from "@/core/create-infinite-query-options";
import type { createMutationOptions } from "@/core/create-mutation-options";
import type { createQueryOptions } from "@/core/create-query-options";
import type { createSuspenseQueryOptions } from "@/core/create-suspense-query-options";
import type { invalidateQueries } from "@/core/invalidate-queries";
import type { setQueryData } from "@/core/set-query-data";
import type { useInfiniteQuery } from "@/core/use-infinite-query";
import type { useMutation } from "@/core/use-mutation";
import type { useQuery } from "@/core/use-query";
import type { useSuspenseQuery } from "@/core/use-suspense-query";

import type { QueryKey, QueryKeyOptions } from "./query-key";

export type ClientHooks<TPaths extends object> = {
  queryOptions: ReturnType<typeof createQueryOptions<TPaths>>;
  suspenseQueryOptions: ReturnType<typeof createSuspenseQueryOptions<TPaths>>;
  infiniteQueryOptions: ReturnType<typeof createInfiniteQueryOptions<TPaths>>;
  mutationOptions: ReturnType<typeof createMutationOptions<TPaths>>;
  useQuery: ReturnType<typeof useQuery<TPaths>>;
  useSuspenseQuery: ReturnType<typeof useSuspenseQuery<TPaths>>;
  useInfiniteQuery: ReturnType<typeof useInfiniteQuery<TPaths>>;
  useMutation: ReturnType<typeof useMutation<TPaths>>;
};

export type ClientImperative<TPaths extends object> = {
  setQueryData: ReturnType<typeof setQueryData<TPaths>>;
  invalidateQueries: ReturnType<typeof invalidateQueries<TPaths>>;
  getQueryKey: <TPath extends PathsFor<TPaths, TMethod>, TMethod extends HttpMethod = "get">(
    path: TPath,
    options?: QueryKeyOptions<TPaths, TPath, TMethod>,
  ) => QueryKey;
};

export type Client<TPaths extends object> = ClientHooks<TPaths> & ClientImperative<TPaths>;
