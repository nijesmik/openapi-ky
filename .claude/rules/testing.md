# Testing Rules

## 1. Test scope — only our code

Do not test the behavior of other libraries (e.g., `ky`, `@tanstack/react-query`).
Only verify the logic we add or override on top of them.

**Do NOT test**:
- ky's `.json()` chaining returning a parsed body
- ky's `beforeRetry` hook returning `undefined` when `ky.stop` is used
- Native `Response.json()` throwing on an empty body

**Do test**:
- Logic we wrap or override (e.g., `response.json` empty-body handling)
- Dispatch logic we author (e.g., `Client.request`'s `this.api[method]`)
- Side effects we add (e.g., `.catch(() => {})` to suppress `unhandledRejection`)

**Heuristic**: identify at least one specific mutation of our code that would cause this test to fail. If you can't, drop it. Exception: if our wrapper *is* the sibling unit (no other test covers it), test it here.

Apply the same heuristic when *adding* tests for untested code paths. If no meaningful mutation can be caught beyond what sibling unit tests already cover, leave the code untested rather than ship a weak or redundant guard.

## 2. Mark regression tests with `[회귀 테스트]`

Prefix tests that exist to lock in a specific bug fix (not ordinary feature behavior).

```ts
it("[회귀 테스트] 호출자가 catch한 요청 실패가 unhandledRejection을 발동시키지 않는다", ...)
```

## 3. Verify the assertion actually catches the regression

Before adding a regression test, confirm the assertion would fail if the protected logic were removed.

- **How**: temporarily revert the fix and run the test. It must fail.
- **If the fix can't be reverted cleanly**: mutate the assertion's expected value to confirm the test would fail on a wrong implementation.
- **Common trap**: a mock/fake that collapses two distinct paths (e.g., `await mock()` and `await mock().json()` resolving to the same value) makes the assertion meaningless. Fix the fake or skip the test — don't ship a meaningless assertion.

## 4. Avoid duplication across test layers

Behavior already covered by a sibling unit test should not be re-verified by an integration test.

- `buildUrl` has its own unit tests for path substitution → `client.test.ts` must not retest it end-to-end.
- Integration tests verify the integration itself (e.g., `request` → `buildUrl` → `ky` flow), not the individual pieces.

## 5. Test naming

- Korean for `describe` / `it`.
- Describe behavior/intent, not mechanics.
- For `it.each`, interpolate the case plainly into the name.
- Long files may number tests sequentially (`"1. ..."`, `"2. [회귀 테스트] ..."`) for PR-review reference.
