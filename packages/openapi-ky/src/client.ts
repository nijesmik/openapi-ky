import type { Options, PathsFor, RequestBody, ResponseBody } from "./types";
import type { HttpMethod } from "openapi-typescript-helpers";

import ky, { type KyInstance, type Options as KyOptions } from "ky";

import { buildUrl } from "./lib/build-url";

export class Client<Paths extends object> {
  protected api: KyInstance;

  constructor(options: KyOptions) {
    this.api = ky.create(options);
  }

  get<Path extends PathsFor<Paths, "get">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "get">>,
  ) {
    return this.request("get", path, options);
  }

  post<Path extends PathsFor<Paths, "post">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "post">>,
  ) {
    return this.request("post", path, options);
  }

  put<Path extends PathsFor<Paths, "put">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "put">>,
  ) {
    return this.request("put", path, options);
  }

  patch<Path extends PathsFor<Paths, "patch">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "patch">>,
  ) {
    return this.request("patch", path, options);
  }

  delete<Path extends PathsFor<Paths, "delete">>(
    path: Path,
    options?: Options<RequestBody<Paths, Path, "delete">>,
  ) {
    return this.request("delete", path, options);
  }

  async request<
    Method extends Extract<HttpMethod, "delete" | "get" | "patch" | "post" | "put">,
    Path extends PathsFor<Paths, Method>,
    Body extends RequestBody<Paths, Path, Method>,
  >(method: Method, path: Path, options?: Options<Body>) {
    const { params, ...kyOptions } = options ?? {};
    const url = buildUrl(path, params);

    const response = await this.api[method]<ResponseBody<Paths, Path, Method>>(url, kyOptions);

    // `response` is `undefined` at runtime when `ky.stop` is returned in a `beforeRetry` hook, despite ky's types.
    if (!response) {
      return response;
    }

    const parseJson = response.json.bind(response);
    response.json = async <J = ResponseBody<Paths, Path, Method>>(): Promise<J> => {
      const text = await response.clone().text();
      if (!text) {
        return undefined as J;
      }
      return parseJson<J>();
    };
    return response;
  }
}

export function createClient<Paths extends object>(options: KyOptions) {
  return new Client<Paths>(options);
}
