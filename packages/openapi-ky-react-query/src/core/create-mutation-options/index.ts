import type { Client } from "@nijesmik/openapi-ky";

import { mutationOptions } from "./mutation-options";
import { mutationOptionsWithMethod } from "./mutation-options-with-method";

/**
 * Returns a `mutationOptions` builder bound to `client`, with `.post`,
 * `.put`, `.patch`, and `.delete` shortcuts that pre-bind `method`:
 *
 * ```ts
 * const mutationOptions = createMutationOptions(client);
 *
 * useMutation(mutationOptions({ method: "post", path: "/posts" }));
 * useMutation(mutationOptions.post({ path: "/posts" }));
 * ```
 *
 * **`mutate` argument shape** — determined at runtime by whether `params`
 * or `searchParams` are passed at create time.
 *
 * By default, `mutate` takes the full request shape (`json`, `params`,
 * `searchParams`, etc.) so per-call values are passed at mutate time:
 *
 * ```ts
 * const opts = mutationOptions.put({ path: "/posts/{postId}" });
 * mutate({ params: { postId }, json: { title: "..." } });
 * ```
 *
 * If `params` or `searchParams` are stable at create time, passing them to
 * the builder lifts them out of `mutate`, which then takes the request body
 * directly:
 *
 * ```ts
 * const opts = mutationOptions.put({
 *   path: "/posts/{postId}",
 *   params: { postId },
 * });
 * mutate({ title: "..." }); // body only
 * ```
 *
 * For read endpoints (queries), use `createQueryOptions` instead.
 */
export function createMutationOptions<TPaths extends object>(api: Client<TPaths>) {
  const mutationOptionsForApi = mutationOptions(api);

  return Object.assign(mutationOptionsForApi, {
    post: mutationOptionsWithMethod(mutationOptionsForApi, "post"),
    put: mutationOptionsWithMethod(mutationOptionsForApi, "put"),
    patch: mutationOptionsWithMethod(mutationOptionsForApi, "patch"),
    delete: mutationOptionsWithMethod(mutationOptionsForApi, "delete"),
  });
}
