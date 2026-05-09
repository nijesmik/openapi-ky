import type { Client } from "@nijesmik/openapi-ky";

import { vi, type Mock } from "vitest";

/**
 * Sentinel resolved by `await mock()` (the unparsed `ResponsePromise` path).
 * `.json()` resolves to `returnValue` instead. Any test that accidentally
 * forgets `.json()` will receive this sentinel and fail loudly.
 */
const UNPARSED_RESPONSE = "__RESPONSE_NOT_PARSED__";

const buildResponseMock = (returnValue: unknown) =>
  Object.assign(Promise.resolve(UNPARSED_RESPONSE), {
    json: () => Promise.resolve(returnValue),
  });

/**
 * Fakes a single shortcut method on `Client<TPaths>` (e.g. `"get"`, `"post"`).
 *
 * The fake mimics ky's `ResponsePromise` asymmetry: `await mock()` resolves to
 * a sentinel string, and `.json()` resolves to `returnValue`. A regression that
 * drops `.json()` from a wrapper produces an observable mismatch instead of
 * accidentally passing.
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
 * Use this for tests of wrappers that call `api(...)` directly. Mock access
 * goes through the {@link getCallableMock} helper.
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
