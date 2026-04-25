import type { Client } from "@nijesmik/openapi-ky";

import { vi, type Mock } from "vitest";

/**
 * Sentinel resolved by `await mock()` (the unparsed `ResponsePromise` path).
 * `.json()` resolves to `returnValue` instead. Any test that accidentally
 * forgets `.json()` will receive this sentinel and fail loudly.
 */
const UNPARSED_RESPONSE = "__RESPONSE_NOT_PARSED__";

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
 * The fake mimics ky's `ResponsePromise` asymmetry: `await mock()` resolves to
 * a sentinel string, and `.json()` resolves to `returnValue`. This way a
 * regression that drops `.json()` from a wrapper produces an observable
 * mismatch instead of accidentally passing.
 *
 * @param method - Name of the `Client` method to mock (e.g. `"get"`, `"request"`).
 * @param returnValue - Value the mock's `.json()` resolves to on every call.
 */
export function createFakeClient<Paths extends object, M extends string>(
  method: M,
  returnValue: unknown,
): Client<Paths> {
  const mock = vi.fn(() =>
    Object.assign(Promise.resolve(UNPARSED_RESPONSE), {
      json: () => Promise.resolve(returnValue),
    }),
  );
  return { [method]: mock } as unknown as Client<Paths>;
}

export function getMock<M extends string>(api: object, method: M): Mock {
  return (api as Record<M, Mock>)[method];
}
