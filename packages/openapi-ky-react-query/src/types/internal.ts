import type { HttpMethod, SearchParams } from "@nijesmik/openapi-ky";
import type { Internal } from "@nijesmik/openapi-ky/internal";

/** @internal */
export type QueryKey = (string | Internal.PathParams)[];

/** @internal */
export type QueryKeyOptions = {
  method?: HttpMethod;
  params?: Internal.PathParams;
  searchParams?: SearchParams;
};
