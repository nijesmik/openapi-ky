import type { ResponsePromise } from "ky";
import type { HttpMethod } from "openapi-typescript-helpers";

import type { PathsFor, ResponseBody } from "./common";
import type { Options } from "./options";

export type Fetcher<TPaths extends object, TMethod extends HttpMethod> = <
  TPath extends PathsFor<TPaths, TMethod>,
>(
  path: TPath,
  options?: Omit<Options<TPaths, TPath, TMethod>, "method">,
) => ResponsePromise<ResponseBody<TPaths, TPath, TMethod>>;
