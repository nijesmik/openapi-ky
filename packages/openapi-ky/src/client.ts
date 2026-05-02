import type { Options as KyOptions, ResponsePromise } from "ky";
import type { HttpMethod } from "openapi-typescript-helpers";

import ky from "ky";

import type { Client } from "./types/client";
import type { Params } from "./types/common";
import type { TypeError } from "./types/error";

import { buildUrl } from "./lib/build-url";

type _Options = KyOptions & { params?: Params };

export function createClient<Paths extends object, DefaultMethod extends HttpMethod = never>(
  defaultOptions: Omit<KyOptions, "method"> & {
    method?: [DefaultMethod] extends [never]
      ? TypeError<"Specify <Paths, Method> generic to set method">
      : DefaultMethod;
  },
): Client<Paths, [DefaultMethod] extends [never] ? "get" : DefaultMethod>;
export function createClient(defaultOptions: Omit<KyOptions, "method"> & { method?: HttpMethod }) {
  const api = ky.create(defaultOptions);

  const request = (path: string, options: _Options = {}): ResponsePromise => {
    const { params, ...kyOptions } = options;
    const url = buildUrl(path, params);
    const promise = api(url, kyOptions);

    void promise
      .then((response) => {
        // `response` is `undefined` at runtime when `ky.stop` is returned in a `beforeRetry` hook, despite ky's types.
        if (!response) {
          return;
        }
        // Patch native `Response.json()` to match ky's chained `.json()` behavior on empty bodies (returns `""` instead of throwing).
        const parseJson = response.json.bind(response);
        response.json = async <J>(): Promise<J> => {
          const text = await response.clone().text();
          if (!text) {
            return "" as J;
          }
          return parseJson<J>();
        };
      })
      .catch(() => {
        // `.then()` creates a derived promise that rejects independently when `promise` rejects.
        // The caller awaits/catches `promise` itself, so swallow this branch to avoid `unhandledRejection`.
      });

    return promise;
  };

  return Object.assign(request, {
    get: (path: string, options: _Options = {}) => request(path, { ...options, method: "get" }),
    post: (path: string, options: _Options = {}) => request(path, { ...options, method: "post" }),
    put: (path: string, options: _Options = {}) => request(path, { ...options, method: "put" }),
    patch: (path: string, options: _Options = {}) => request(path, { ...options, method: "patch" }),
    delete: (path: string, options: _Options = {}) =>
      request(path, { ...options, method: "delete" }),
  });
}
