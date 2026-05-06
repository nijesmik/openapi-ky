import type { HttpMethod, PathsFor, RequestBody, SearchParams } from "@nijesmik/openapi-ky";
import type { Internal } from "@openapi-ky/internal";

import type { QueryRequestOptions } from "@/types/query";

/** @internal */
export type QueryKey = (string | Internal.PathParams)[];

/** @internal */
export type QueryKeyOptions = {
  method?: HttpMethod;
  params?: Internal.PathParams;
  searchParams?: SearchParams;
};

/** @internal */
export type URLSearchParamsInit = ConstructorParameters<typeof URLSearchParams>[0];

/**
 * Re-shapes the option-params type so `json` / `path` survive destructuring in
 * a generic context.
 *
 * Two TS limitations addressed:
 * 1. `JsonField` is method-conditional. In a generic context the conditional
 *    is not reduced until the generics resolve at the call site, so `json`
 *    cannot be destructured directly. Adding `json?` as an optional flat
 *    field collapses the conditional.
 * 2. Distributive indexed access over the underlying intersection makes the
 *    destructured `path` resolve to `QueryRequestOptions<...>["path"]` rather than
 *    the outer `TPath` generic. Re-injecting `path: TPath` short-circuits this
 *    indirection.
 *
 * @internal
 */
export type Flat<
  TOptions extends Omit<QueryRequestOptions<TPaths, TPath, TMethod>, "params">,
  TPaths extends object,
  TPath extends PathsFor<TPaths, TMethod>,
  TMethod extends HttpMethod,
> = Omit<TOptions, "path"> & {
  path: TPath;
  json?: RequestBody<TPaths, TPath, TMethod>;
};
