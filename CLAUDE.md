# Project rules

## YAGNI

- Guard code only against actual paths in the current codebase. If a throw / `undefined` / `null` / wrong value can't flow through today, don't add defensive logic.
- Validate only at system boundaries (external libraries, network, user input).
- Extract repeated code only after 3+ identical instances with a clear "must change together" pattern emerge.
- When unsure whether to add something: don't. Removal is hard; adding later is cheap.

## Publishing checklist

- Before running `changeset version`, verify that README code examples match the current API (option names, import paths, default vs named exports, etc.).
- After running `changeset version`, review the generated CHANGELOG entries:
  - Remove commit hash prefixes from bullet items (`- d7ca1e5: message` → `- message`). Keep `[hash]` in `Updated dependencies [hash]`.
  - Fix heading structure: use `####` not `###` inside bullet items.
  - Confirm consistency with previous versions.
