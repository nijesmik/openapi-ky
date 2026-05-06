import type {
  HttpMethod,
  KyOptions,
  Options,
  PathsFor,
  PathParams,
  RequestBody,
  SearchParams,
} from "@nijesmik/openapi-ky";

/**
 * Prepares the options object for a `Client(path, options)` call so that
 * TypeScript can resolve the explicit-method overload from inside a generic
 * context, where it cannot otherwise be selected.
 *
 * Together (1)–(3) satisfy the overload's `{ method: Method }` constraint —
 * none works on its own:
 *
 * (1) Defaults `method` to `"get"` when omitted (queries map to HTTP GET).
 * (2) Asserts `method` as required (`{ method: Method }`).
 * (3) Casts the return shape to `Options<...> & { method: Method }` because
 *     `JsonField<Paths, Path, Method>` is method-conditional and cannot be
 *     reduced in a generic context — TS rejects the structural match even
 *     though the runtime shape is correct.
 */
export function apiOptions<
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
>({
  method,
  params,
  searchParams,
  kyOptions,
  json,
}: {
  method?: Method;
  params?: PathParams<Paths, Path, Method>;
  searchParams?: SearchParams;
  kyOptions?: KyOptions;
  json?: RequestBody<Paths, Path, Method>;
}): Options<Paths, Path, Method> & { method: Method } {
  return {
    ...kyOptions,
    method: method ?? ("get" as Method),
    params,
    searchParams,
    json,
  } as Options<Paths, Path, Method> & { method: Method };
}
