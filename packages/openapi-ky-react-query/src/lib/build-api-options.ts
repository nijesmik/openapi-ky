import type {
  HttpMethod,
  KyOptions,
  Options,
  Params,
  PathsFor,
  RequestBody,
  SearchParams,
} from "@nijesmik/openapi-ky";

export function buildApiOptions<
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
  params?: Params;
  searchParams?: SearchParams;
  kyOptions?: KyOptions;
  json?: RequestBody<Paths, Path, Method>;
}): Options<Paths, Path, Method> & { method: Method } {
  return {
    method: method ?? ("get" as Method),
    params,
    searchParams,
    ...kyOptions,
    json,
  };
}
