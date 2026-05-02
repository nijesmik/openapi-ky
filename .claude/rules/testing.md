# Testing Rules

## 1. Test scope — only our code

Test only the logic we write or override on top of external libraries.

**Heuristic**: identify at least one mutation of our code that would cause this test to fail. If you can't, drop it. Exception: if our wrapper *is* the sibling unit (no other test covers it), test it here.

Apply the same heuristic when adding tests for untested code paths. If no meaningful mutation can be caught beyond what sibling tests already cover, skip the test rather than add a weak or redundant one.

## 2. Mark regression tests with `[회귀 테스트]`

Prefix tests that exist to lock in a specific bug fix (not ordinary feature behavior).

```ts
it("[회귀 테스트] 호출자가 catch한 요청 실패가 unhandledRejection을 발동시키지 않는다", ...)
```

## 3. Verify the assertion catches the regression

Before adding a regression test, revert the fix and confirm the test fails. If the fix can't be reverted cleanly, mutate the expected value to force failure.

⚠️ **Trap**: a mock that collapses two distinct paths (e.g., `mock()` and `mock().json()` resolving to the same value) makes the assertion meaningless. Fix the fake or skip the test.

## 4. Avoid duplication across test layers

Behavior already covered by a sibling unit test should not be re-verified by an integration test. Integration tests verify the integration itself (e.g., `request` → `buildUrl` → `ky` flow), not the individual pieces.

## 5. Test naming

- Korean for `describe` / `it`. Describe behavior, not mechanics.
- For `it.each`, interpolate the case plainly into the name.
- Long files may number tests sequentially (`"1. ..."`, `"2. [회귀 테스트] ..."`) for PR review.
