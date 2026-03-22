## Summary

Integrated spell checking into `app/services/quality-score/index.ts` by adding locale-aware misspelling detection, quality flags for spelling issues, and score/suggestion updates when spelling problems are found. Added unit coverage in `test/unit/quality-score.test.ts` for direct spelling detection and quality-score integration behavior. Updated `CHANGELOG.md` with the spell-check integration support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- quality-score`

```text
> test:run
> vitest run quality-score


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0303

 ✓ test/unit/quality-score.test.ts (15 tests) 6ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  20:21:58
   Duration  1.45s (transform 50ms, setup 70ms, collect 30ms, tests 6ms, environment 544ms, prepare 86ms)
```

### `./node_modules/.bin/eslint app/services/quality-score/index.ts test/unit/quality-score.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
