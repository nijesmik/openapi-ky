import type { HttpMethod, PathsFor } from "@nijesmik/openapi-ky";

import type { createInfiniteQueryOptions } from "@/core/create-client/create-infinite-query-options";
import type { createMutationOptions } from "@/core/create-client/create-mutation-options";
import type { createQueryOptions } from "@/core/create-client/create-query-options";
import type { createSuspenseQueryOptions } from "@/core/create-client/create-suspense-query-options";
import type { invalidateQueries } from "@/core/create-client/invalidate-queries";
import type { setQueryData } from "@/core/create-client/set-query-data";
import type { useInfiniteQuery } from "@/core/create-client/use-infinite-query";
import type { useMutation } from "@/core/create-client/use-mutation";
import type { useQuery } from "@/core/create-client/use-query";
import type { useSuspenseQuery } from "@/core/create-client/use-suspense-query";

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
