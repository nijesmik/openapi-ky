import type { HttpMethod, PathsFor } from "@nijesmik/openapi-ky";

import type {
  CreateDynamicMutationOptions,
  CreateMutationOptions,
  CreateStaticMutationOptions,
  UseDynamicMutationOptions,
  UseStaticMutationOptions,
} from "@/types/mutation";
import type { DistributiveOmit } from "@/types/utils";

import type { mutationOptions } from "./mutation-options";

export function mutationOptionsWithMethod<Paths extends object, Method extends HttpMethod>(
  boundMutationOptions: ReturnType<typeof mutationOptions<Paths>>,
  method: Method,
) {
  function mutationOptionsWithMethod<Path extends PathsFor<Paths, Method>>(
    options: DistributiveOmit<CreateStaticMutationOptions<Paths, Path, Method>, "method">,
  ): UseStaticMutationOptions<Paths, Path, Method>;
  function mutationOptionsWithMethod<Path extends PathsFor<Paths, Method>>(
    options: DistributiveOmit<CreateDynamicMutationOptions<Paths, Path, Method>, "method">,
  ): UseDynamicMutationOptions<Paths, Path, Method>;
  function mutationOptionsWithMethod<Path extends PathsFor<Paths, Method>>(
    options: DistributiveOmit<CreateMutationOptions<Paths, Path, Method>, "method">,
  ) {
    return boundMutationOptions({ ...options, method });
  }

  return mutationOptionsWithMethod;
}
