import type { Client, HttpMethod, PathsFor } from "@nijesmik/openapi-ky";

import { mutationOptions as buildMutationOptions } from "@tanstack/react-query";

import type {
  CreateDynamicMutationOptions,
  CreateMutationOptions,
  CreateStaticMutationOptions,
  DynamicMutationFunctionVariables,
  StaticMutationFunctionVariables,
  UseDynamicMutationOptions,
  UseStaticMutationOptions,
} from "@/types/mutation";
import type { DistributiveOmit } from "@/types/utils";

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
  function _mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateStaticMutationOptions<Paths, Path, Method>,
  ): UseStaticMutationOptions<Paths, Path, Method>;
  function _mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateDynamicMutationOptions<Paths, Path, Method>,
  ): UseDynamicMutationOptions<Paths, Path, Method>;
  function _mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateMutationOptions<Paths, Path, Method>,
  ): UseStaticMutationOptions<Paths, Path, Method> | UseDynamicMutationOptions<Paths, Path, Method>;
  function _mutationOptions<Path extends PathsFor<Paths, Method>, Method extends HttpMethod>(
    options: CreateMutationOptions<Paths, Path, Method>,
  ) {
    if (options.params !== undefined || options.searchParams !== undefined) {
      const { method, path, params, searchParams, kyOptions, ...mutationOptions } = options;
      return buildMutationOptions({
        mutationFn: (variables: StaticMutationFunctionVariables<Paths, Path, Method>) =>
          api(path, {
            ...kyOptions,
            params,
            searchParams,
            json: variables,
            method,
          }).json(),
        ...mutationOptions,
      });
    }

    const { method, path, kyOptions, ...mutationOptions } = options;
    return buildMutationOptions({
      mutationFn: (variables: DynamicMutationFunctionVariables<Paths, Path, Method>) =>
        api(path, {
          ...kyOptions,
          ...variables,
          method,
        }).json(),
      ...mutationOptions,
    });
  }

  function createMutationOptionsWithMethod<Method extends HttpMethod>(method: Method) {
    function mutationOptionsWithMethod<Path extends PathsFor<Paths, Method>>(
      options: DistributiveOmit<CreateStaticMutationOptions<Paths, Path, Method>, "method">,
    ): UseStaticMutationOptions<Paths, Path, Method>;
    function mutationOptionsWithMethod<Path extends PathsFor<Paths, Method>>(
      options: DistributiveOmit<CreateDynamicMutationOptions<Paths, Path, Method>, "method">,
    ): UseDynamicMutationOptions<Paths, Path, Method>;
    function mutationOptionsWithMethod<Path extends PathsFor<Paths, Method>>(
      options: DistributiveOmit<CreateMutationOptions<Paths, Path, Method>, "method">,
    ) {
      return _mutationOptions({ ...options, method });
    }

    return mutationOptionsWithMethod;
  }

  return Object.assign(_mutationOptions, {
    post: createMutationOptionsWithMethod("post"),
    put: createMutationOptionsWithMethod("put"),
    patch: createMutationOptionsWithMethod("patch"),
    delete: createMutationOptionsWithMethod("delete"),
  });
}
