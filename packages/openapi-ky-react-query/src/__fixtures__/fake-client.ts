import type { Client } from "@nijesmik/openapi-ky";

import { vi, type Mock } from "vitest";

const buildResponseMock = (returnValue: unknown, status = 200) =>
  Object.assign(Promise.resolve({ status, json: () => Promise.resolve(returnValue) }), {
    json: () => Promise.resolve(returnValue),
  });

/**
 * Fakes a single shortcut method on `Client<TPaths>` (e.g. `"get"`, `"post"`).
 *
 * Return type is plain `Client<TPaths>` (not the intersection
 * `Client<TPaths> & { [M]: Mock }`) on purpose: an intersection breaks
 * `TPaths` inference inside `createMutationOptions` / `createClient`,
 * collapsing every downstream generic to `never`. Mock access goes through
 * the separate {@link getMock} helper.
 */
export function createFakeClient<TPaths extends object, M extends string>(
  method: M,
  returnValue: unknown,
): Client<TPaths> {
  const mock = vi.fn(() => buildResponseMock(returnValue));
  return { [method]: mock } as unknown as Client<TPaths>;
}

/**
 * Fakes the callable body of `Client<TPaths>` (`api(path, options)`).
 *
 * Mock access goes through the {@link getCallableMock} helper.
 */
export function createFakeCallableClient<TPaths extends object>(
  returnValue: unknown,
): Client<TPaths> {
  const mock = vi.fn(() => buildResponseMock(returnValue));
  return mock as unknown as Client<TPaths>;
}

export function getMock<M extends string>(api: object, method: M): Mock {
  return (api as Record<M, Mock>)[method];
}

export function getCallableMock(api: object): Mock {
  return api as unknown as Mock;
}
