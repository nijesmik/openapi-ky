import type {
  BeforeAnyErrorHook,
  BodyOf,
  ClientOptions,
  Options,
  PathOf,
  SuccessOf,
} from "./types";
import type { HttpMethod } from "openapi-typescript-helpers";

import ky, { type KyInstance } from "ky";

import { buildUrl } from "./lib/build-url";

export class Client<Paths extends object> {
  protected api: KyInstance;
  private readonly beforeAnyErrorHooks: BeforeAnyErrorHook[];

  constructor(options: ClientOptions) {
    const { beforeAnyError, beforeHTTPError, ...kyHooks } = options.hooks ?? {};

    this.api = ky.create({
      ...options,
      hooks: { ...kyHooks, beforeError: beforeHTTPError },
    });

    this.beforeAnyErrorHooks = beforeAnyError ?? [];
  }

  get<Path extends PathOf<Paths, "get">>(path: Path, options?: Options) {
    return this.request("get", path, options);
  }

  post<Path extends PathOf<Paths, "post">>(
    path: Path,
    options?: Options<BodyOf<Paths, Path, "post">>,
  ) {
    return this.request("post", path, options);
  }

  put<Path extends PathOf<Paths, "put">>(
    path: Path,
    options?: Options<BodyOf<Paths, Path, "put">>,
  ) {
    return this.request("put", path, options);
  }

  patch<Path extends PathOf<Paths, "patch">>(
    path: Path,
    options?: Options<BodyOf<Paths, Path, "patch">>,
  ) {
    return this.request("patch", path, options);
  }

  delete<Path extends PathOf<Paths, "delete">>(path: Path, options?: Options) {
    return this.request("delete", path, options);
  }

  async request<
    Method extends Extract<HttpMethod, "delete" | "get" | "patch" | "post" | "put">,
    Path extends PathOf<Paths, Method>,
    Body extends BodyOf<Paths, Path, Method>,
  >(method: Method, path: Path, options?: Options<Body>) {
    const { params, ...kyOptions } = options ?? {};
    const url = buildUrl(path, params);

    try {
      const response = await this.api[method]<SuccessOf<Paths, Path, Method>>(url, kyOptions);
      if (response.status === 204) {
        return undefined as SuccessOf<Paths, Path, Method>;
      }
      return await response.json();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown) {
    for (const hook of this.beforeAnyErrorHooks) {
      hook(error);
    }
  }
}

export function createClient<Paths extends object>(options: ClientOptions) {
  return new Client<Paths>(options);
}
