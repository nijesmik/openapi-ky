import type { Client, Options, PathsFor, ResponseBody } from "@nijesmik/openapi-ky";
import type { ResponsePromise } from "ky";

import { mutationOptions as buildMutationOptions } from "@tanstack/react-query";

import type {
  MutationMethod,
  MutationOptionsParams,
} from "./create-mutation-options.types";

export function createMutationOptions<Paths extends object>(api: Client<Paths>) {
  function mutationOptions<
    Path extends PathsFor<Paths, Method>,
    Method extends MutationMethod,
    Variables extends Options<Paths, Path, Method>,
  >({
    method,
    path,
    ...mutationOpts
  }: MutationOptionsParams<Paths, Path, Method, Variables>) {
    // generic context에서 `Method extends MutationMethod`/`Path extends PathsFor<Paths, Method>`가
    // Client callable의 명시-method 오버로드 제약(`Method extends keyof Paths[Path] & HttpMethod`)과
    // 동치이지만 TS가 그것을 증명할 수 없음. 단일 함수 시그니처로 alias해 boundary cast.
    const call = api as unknown as (
      path: Path,
      options: Options<Paths, Path, Method> & { method: Method },
    ) => ResponsePromise<ResponseBody<Paths, Path, Method>>;
    return buildMutationOptions({
      mutationFn: (variables?: Variables) =>
        call(path, { ...variables, method } as Options<Paths, Path, Method> & { method: Method }).json(),
      ...mutationOpts,
    });
  }

  function mutationOptionsWithMethod<Method extends MutationMethod>(method: Method) {
    return <
      Path extends PathsFor<Paths, Method>,
      Variables extends Options<Paths, Path, Method>,
    >(
      args: Omit<MutationOptionsParams<Paths, Path, Method, Variables>, "method">,
    ) => mutationOptions({ ...args, method });
  }

  return Object.assign(mutationOptions, {
    post: mutationOptionsWithMethod("post"),
    put: mutationOptionsWithMethod("put"),
    patch: mutationOptionsWithMethod("patch"),
    delete: mutationOptionsWithMethod("delete"),
  });
}
