import type { Client } from "@nijesmik/openapi-ky";

import { mutationOptions } from "./mutation-options";
import { mutationOptionsWithMethod } from "./mutation-options-with-method";

/**
 * Creates a typed factory of TanStack Query mutation option builders bound to
 * an `openapi-ky` `Client`.
 *
 * The returned value is itself the default `mutationOptions` builder. It also
 * exposes `.post`, `.put`, `.patch`, and `.delete` shortcuts that pre-bind
 * `method`:
 *
 * ```ts
 * const mutationOptions = createMutationOptions(client);
 *
 * useMutation(mutationOptions({ method: "post", path: "/posts" }));
 * useMutation(mutationOptions.post({ path: "/posts" }));
 * ```
 *
 * **`mutate` argument shape:** depends on whether `params` / `searchParams`
 * are provided at create time. The builder runs in one of two modes:
 *
 * (1) **Static mode** — pass `params` / `searchParams` to the builder when
 * their values are known in the surrounding scope (`useParams`, props,
 * closure). `mutate` then takes the request body directly.
 *
 * ```ts
 * const opts = mutationOptions.put({
 *   path: "/posts/{postId}",
 *   params: { postId },
 * });
 * mutate({ title: "..." }); // body only
 * ```
 *
 * (2) **Dynamic mode** — omit `params` / `searchParams` at create time when
 * they vary per call. `mutate` then takes a ky-options shape (`json`,
 * `params`, `searchParams`, etc.).
 *
 * ```ts
 * const opts = mutationOptions.put({ path: "/posts/{postId}" });
 * mutate({ params: { postId }, json: { title: "..." } });
 * ```
 *
 * For read endpoints (queries), use `createQueryOptions` instead.
 */
export function createMutationOptions<Paths extends object>(api: Client<Paths>) {
  const mutationOptionsForApi = mutationOptions(api);

  return Object.assign(mutationOptionsForApi, {
    post: mutationOptionsWithMethod(mutationOptionsForApi, "post"),
    put: mutationOptionsWithMethod(mutationOptionsForApi, "put"),
    patch: mutationOptionsWithMethod(mutationOptionsForApi, "patch"),
    delete: mutationOptionsWithMethod(mutationOptionsForApi, "delete"),
  });
}
