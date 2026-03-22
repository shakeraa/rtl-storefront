## Summary

Integrated grammar checking into `app/services/quality-score/index.ts` with rule-based issue detection for repeated words, spacing, punctuation, unbalanced delimiters, and English sentence capitalization. Added unit coverage in `test/unit/quality-score.test.ts` for direct grammar checks and quality-score integration behavior. Updated `CHANGELOG.md` with the grammar-check support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- quality-score`

```text
> test:run
> vitest run quality-score


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0304

 ✓ test/unit/quality-score.test.ts (15 tests) 6ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  20:32:31
   Duration  3.98s (transform 164ms, setup 235ms, collect 185ms, tests 6ms, environment 1.63s, prepare 362ms)
```

### `./node_modules/.bin/eslint app/services/quality-score/index.ts test/unit/quality-score.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
