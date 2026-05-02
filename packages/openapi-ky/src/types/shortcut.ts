import type { ResponsePromise } from "ky";
import type { HttpMethod } from "openapi-typescript-helpers";

import type { PathsFor, ResponseBody } from "./common";
import type { Options } from "./options";

export type Fetcher<Paths extends object, Method extends HttpMethod> = <
  Path extends PathsFor<Paths, Method>,
>(
  path: Path,
  options?: Options<Paths, Path, Method>,
) => ResponsePromise<ResponseBody<Paths, Path, Method>>;
