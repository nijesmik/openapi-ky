import type { HttpMethod, PathsFor, RequestBody, SearchParams } from "@nijesmik/openapi-ky";
import type { Internal } from "@openapi-ky/internal";

import type { RequestInput } from "@/types/query";

/** @internal */
export type QueryKey = (string | Internal.PathParams)[];

/** @internal */
export type QueryKeyOptions = {
  method?: HttpMethod;
  params?: Internal.PathParams;
  searchParams?: SearchParams;
};

/**
 * Flattens the option-params shape so it can be safely destructured inside a
 * generic context.
 *
 * Two issues addressed:
 * 1. `JsonField` is method-conditional. In a generic context the conditional
 *    is deferred and never reduces, so `json` cannot be destructured directly.
 *    Adding `json?` as an optional flat field collapses the conditional.
 * 2. Distributive indexed access over the underlying intersection makes the
 *    destructured `path` resolve to `RequestInput<...>["path"]` rather than
 *    the outer `Path` generic. Re-injecting `path: Path` short-circuits this
 *    indirection so call sites (e.g. `api(path, ...)`) can satisfy
 *    `PathsFor<Paths, Method>`.
 *
 * @template T - The original option-params type (e.g. `CreateQueryOptions`).
 * @template Paths - The OpenAPI paths object.
 * @template Path - The narrowed path literal in the caller's generic context.
 * @template Method - The HTTP method matching `Path`.
 *
 * @internal
 */
export type Flat<
  T extends Omit<RequestInput<Paths, Path, Method>, "params">,
  Paths extends object,
  Path extends PathsFor<Paths, Method>,
  Method extends HttpMethod,
> = Omit<T, "path"> & {
  path: Path;
  json?: RequestBody<Paths, Path, Method>;
};
