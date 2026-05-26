import type { Options as KyOptions, ResponsePromise } from "ky";
import type { HttpMethod } from "openapi-typescript-helpers";

import ky from "ky";

import type { Client } from "@/types/client";
import type { TypeError } from "@/types/error";
import type * as Internal from "@/types/internal";

import { buildUrl } from "@/lib/build-url";

function createClient<TPaths extends object, TDefaultMethod extends HttpMethod = never>(
  defaultOptions: Omit<KyOptions, "method"> & {
    method?: [TDefaultMethod] extends [never]
      ? TypeError<"Specify <TPaths, TDefaultMethod> generic to set method">
      : TDefaultMethod;
  },
): Client<TPaths, [TDefaultMethod] extends [never] ? "get" : TDefaultMethod>;
function createClient(defaultOptions: Omit<KyOptions, "method"> & { method?: HttpMethod }) {
  const api = ky.create(defaultOptions);

  const request = (path: string, options: Internal.Options = {}): ResponsePromise => {
    const { params, ...kyOptions } = options;
    const url = buildUrl(path, params);
    return api(url, kyOptions);
  };

  return Object.assign(request, {
    get: (path: string, options?: Internal.Options) => request(path, { ...options, method: "get" }),
    post: (path: string, options?: Internal.Options) =>
      request(path, { ...options, method: "post" }),
    put: (path: string, options?: Internal.Options) => request(path, { ...options, method: "put" }),
    patch: (path: string, options?: Internal.Options) =>
      request(path, { ...options, method: "patch" }),
    delete: (path: string, options?: Internal.Options) =>
      request(path, { ...options, method: "delete" }),
  }) as Client<object, HttpMethod>;
}

export default createClient;
