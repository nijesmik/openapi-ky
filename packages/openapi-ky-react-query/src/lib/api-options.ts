import type {
  HttpMethod,
  KyOptions,
  OptionsWithRequiredMethod,
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
 * Together (1)–(3) satisfy `OptionsWithRequiredMethod` — none works on its
 * own:
 *
 * (1) Defaults `method` to `"get"` when omitted (queries map to HTTP GET).
 * (2) Asserts the value as `TMethod` so the required method field is
 *     concretely typed.
 * (3) Casts the return shape because `JsonField<TPaths, TPath, TMethod>` is
 *     method-conditional and cannot be reduced in a generic context — TS
 *     rejects the structural match even though the runtime shape is correct.
 */
export function apiOptions<
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
>({
  method,
  params,
  searchParams,
  kyOptions,
  json,
}: {
  method?: TMethod;
  params?: PathParams<TPaths, TPath, TMethod>;
  searchParams?: SearchParams;
  kyOptions?: KyOptions;
  json?: RequestBody<TPaths, TPath, TMethod>;
}): OptionsWithRequiredMethod<TPaths, TPath, TMethod> {
  return {
    ...kyOptions,
    method: method ?? ("get" as TMethod),
    params,
    searchParams,
    json,
  } as OptionsWithRequiredMethod<TPaths, TPath, TMethod>;
}
