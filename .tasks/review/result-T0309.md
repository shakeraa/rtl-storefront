## Summary

Added unit coverage for emoji detection, preservation, and restoration in `app/services/translation-formatting/index.ts` via `test/unit/emoji-handling.test.ts`. The tests verify emoji presence/count detection and placeholder-based round-trip restoration. Updated `CHANGELOG.md` with the emoji-handling verification support.

## Verification

### `npm run test:run -- emoji-handling`

```text
> test:run
> vitest run emoji-handling

 ✓ test/unit/emoji-handling.test.ts (2 tests) 2ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  22:09:53
   Duration  1.19s (transform 44ms, setup 36ms, collect 19ms, tests 2ms, environment 430ms, prepare 133ms)
```

### `./node_modules/.bin/eslint test/unit/emoji-handling.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
