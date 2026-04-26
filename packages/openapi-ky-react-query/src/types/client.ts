import type { HttpMethod, Params, SearchParams } from "@nijesmik/openapi-ky";

export type QueryKeyOptions<Method extends HttpMethod = HttpMethod> = {
  method?: Method;
  params?: Params;
  searchParams?: SearchParams;
};
