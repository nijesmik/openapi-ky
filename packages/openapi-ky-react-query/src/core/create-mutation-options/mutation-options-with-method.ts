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

export function mutationOptionsWithMethod<TPaths extends object, TMethod extends HttpMethod>(
  boundMutationOptions: ReturnType<typeof mutationOptions<TPaths>>,
  method: TMethod,
) {
  function mutationOptionsWithMethod<TPath extends PathsFor<TPaths, TMethod>>(
    options: DistributiveOmit<CreateStaticMutationOptions<TPaths, TPath, TMethod>, "method">,
  ): UseStaticMutationOptions<TPaths, TPath, TMethod>;
  function mutationOptionsWithMethod<TPath extends PathsFor<TPaths, TMethod>>(
    options: DistributiveOmit<CreateDynamicMutationOptions<TPaths, TPath, TMethod>, "method">,
  ): UseDynamicMutationOptions<TPaths, TPath, TMethod>;
  function mutationOptionsWithMethod<TPath extends PathsFor<TPaths, TMethod>>(
    options: DistributiveOmit<CreateMutationOptions<TPaths, TPath, TMethod>, "method">,
  ) {
    return boundMutationOptions({ ...options, method });
  }

  return mutationOptionsWithMethod;
}
