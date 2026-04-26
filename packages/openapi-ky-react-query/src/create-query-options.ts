import type {
  Client,
  HttpMethod,
  Options,
  PathsFor,
  ResponseBody,
} from "@nijesmik/openapi-ky";
import type { ResponsePromise } from "ky";

import {
  infiniteQueryOptions as buildInfiniteQueryOptions,
  queryOptions as buildQueryOptions,
  skipToken,
  type InfiniteData,
} from "@tanstack/react-query";

import type {
  InfiniteQueryOptionsParams,
  QueryOptionsParams,
  SuspenseQueryOptionsParams,
} from "./create-query-options.types";
import { buildQueryKey } from "./lib/build-query-key";

export function createQueryOptions<Paths extends object>(api: Client<Paths>) {
  function queryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >({
    path,
    method,
    params,
    searchParams,
    kyOptions,
    select,
    ...queryOptions
  }: QueryOptionsParams<Paths, Path, Method, Data>) {
    // generic context의 (Path, Method)가 Client callable의 명시-method 오버로드 제약을 동치로
    // 만족시키지만 TS가 증명 못함. mutation과 동일 boundary cast 패턴 (단일 시그니처 alias).
    // method가 optional인 점만 mutation과 다름 — query는 GET 기본 지원.
    const call = api as unknown as (
      p: Path,
      o: Options<Paths, Path, Method> & { method?: Method },
    ) => ResponsePromise<ResponseBody<Paths, Path, Method>>;

    if (params !== null) {
      const requestOptions = { method, params, searchParams, ...kyOptions } as Options<
        Paths,
        Path,
        Method
      > & { method?: Method };

      return buildQueryOptions({
        queryKey: buildQueryKey(path, { method, params, searchParams }),
        queryFn: () => call(path, requestOptions).json(),
        select,
        ...queryOptions,
      });
    }

    return buildQueryOptions<ResponseBody<Paths, Path, Method>, Error, Data>({
      queryKey: buildQueryKey(path, { method }),
      queryFn: skipToken,
    });
  }

  function suspenseQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    Data = ResponseBody<Paths, Path, Method>,
  >({
    path,
    method,
    params,
    searchParams,
    kyOptions,
    select,
    ...queryOptions
  }: SuspenseQueryOptionsParams<Paths, Path, Method, Data>) {
    const call = api as unknown as (
      p: Path,
      o: Options<Paths, Path, Method> & { method?: Method },
    ) => ResponsePromise<ResponseBody<Paths, Path, Method>>;

    const requestOptions = { method, params, searchParams, ...kyOptions } as Options<
      Paths,
      Path,
      Method
    > & { method?: Method };

    return buildQueryOptions({
      queryKey: buildQueryKey(path, { method, params, searchParams }),
      queryFn: () => call(path, requestOptions).json(),
      select,
      ...queryOptions,
    });
  }

  function infiniteQueryOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends HttpMethod = "get",
    PageParam extends string | number | undefined = string | undefined,
    Data = InfiniteData<ResponseBody<Paths, Path, Method>, PageParam>,
  >({
    path,
    method,
    params,
    searchParams,
    pageParamKey = "cursor",
    kyOptions,
    initialPageParam,
    select,
    ...queryOptions
  }: InfiniteQueryOptionsParams<Paths, Path, Method, PageParam, Data>) {
    const call = api as unknown as (
      p: Path,
      o: Options<Paths, Path, Method> & { method?: Method },
    ) => ResponsePromise<ResponseBody<Paths, Path, Method>>;

    return buildInfiniteQueryOptions({
      queryKey: buildQueryKey(path, { method, params, searchParams }),
      queryFn: ({ pageParam }) =>
        call(path, {
          method,
          params,
          ...kyOptions,
          searchParams: {
            ...searchParams,
            [pageParamKey]: pageParam as PageParam,
          },
        } as Options<Paths, Path, Method> & { method?: Method }).json(),
      initialPageParam,
      select,
      ...queryOptions,
    });
  }

  return Object.assign(queryOptions, {
    suspense: suspenseQueryOptions,
    infinite: infiniteQueryOptions,
  });
}
