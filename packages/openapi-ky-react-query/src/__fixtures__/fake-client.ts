import type { Client } from "@nijesmik/openapi-ky";

import { vi, type Mock } from "vitest";

/**
 * Builds a partial `Client<Paths>` that only mocks the single HTTP method our
 * wrappers actually call. A real `Client` instance would require ky and other
 * external setup, which is unnecessary for unit tests of the option factories.
 *
 * The return type is plain `Client<Paths>` rather than
 * `Client<Paths> & { [M]: Mock }` on purpose: an intersection return type
 * breaks `Paths` inference inside `createMutationOptions` /
 * `createQueryOptions`, causing every downstream generic to collapse to
 * `never`. Mock access goes through the separate {@link getMock} helper.
 *
 * Note: this fake collapses `ResponsePromise`'s asymmetry — both `await mock()`
 * and `await mock().json()` resolve to `returnValue`. The real client's
 * `await client.get(...)` resolves to `KyResponse`, not the parsed body.
 * The wrappers here always chain `.json()` so the simplification is safe, but
 * any future wrapper that uses `(await api.get(...)).json()` cannot be tested
 * with this fake.
 *
 * @param method - Name of the `Client` method to mock (e.g. `"get"`, `"request"`).
 * @param returnValue - Value the mock resolves to on every call.
 */
export function createFakeClient<Paths extends object, M extends string>(
  method: M,
  returnValue: unknown,
): Client<Paths> {
  const mock = vi.fn(() =>
    Object.assign(Promise.resolve(returnValue), {
      json: () => Promise.resolve(returnValue),
    }),
  );
  return { [method]: mock } as unknown as Client<Paths>;
}

export function getMock<M extends string>(api: object, method: M): Mock {
  return (api as Record<M, Mock>)[method];
}
