## Summary

Implemented duplicate-content detection in `app/services/plagiarism-check/index.ts` using normalized similarity scoring from the translation-memory matcher, with configurable thresholds, capped match lists, and risk bands. Added unit coverage in `test/unit/plagiarism-check.test.ts` for exact duplicates, unrelated content filtering, match capping, and risk classification. Updated `CHANGELOG.md` with the duplicate-content detection support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- plagiarism-check`

```text
> test:run
> vitest run plagiarism-check


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0305

 ✓ test/unit/plagiarism-check.test.ts (4 tests) 56ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  20:32:31
   Duration  3.94s (transform 171ms, setup 256ms, collect 85ms, tests 56ms, environment 1.61s, prepare 345ms)
```

### `./node_modules/.bin/eslint app/services/plagiarism-check/index.ts test/unit/plagiarism-check.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
