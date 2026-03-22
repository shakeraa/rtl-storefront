## Summary

Implemented reusable analytics date-range helpers in `app/services/analytics/reports.ts`, including preset resolution for today, last 7 days, last 30 days, month-to-date, and validated custom ranges. Updated analytics report tests in `test/unit/analytics.test.ts` to cover preset/custom range handling and to build report configs through the new helper paths. Updated `CHANGELOG.md` with the analytics filtering entry and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- analytics`

```text
> test:run
> vitest run analytics


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0279

 ✓ test/unit/analytics.test.ts (19 tests) 13ms

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  18:48:26
   Duration  1.11s (transform 61ms, setup 47ms, collect 36ms, tests 13ms, environment 399ms, prepare 130ms)
```

### `npx eslint app/services/analytics/reports.ts test/unit/analytics.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
