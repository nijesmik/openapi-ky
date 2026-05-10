import { isServer, QueryClient, type QueryClientConfig } from "@tanstack/react-query";

/**
 * Creates a callable `QueryClient` accessor following TanStack Query's SSR
 * singleton pattern: on the server, every call returns a fresh `QueryClient`
 * to prevent cache state leaking between concurrent requests; the browser
 * path is the standard cached singleton.
 *
 * Pass the result as the second argument to `createClient` to enable typed
 * imperative ops (`getQueryKey`, `setQueryData`, `invalidateQueries`).
 */
export function createQueryClient(config?: QueryClientConfig) {
  let browserQueryClient: QueryClient | undefined;

  return function getQueryClient() {
    if (isServer) {
      return new QueryClient(config);
    }
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient(config);
    }
    return browserQueryClient;
  };
}
