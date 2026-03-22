## Summary

Implemented category-performance analytics grouped by locale in `app/services/analytics/tracker.ts`, aggregating conversion counts and revenue by category or collection identifier. Added analytics tests covering category ranking output and total event count access in `test/unit/analytics.test.ts`. Updated `CHANGELOG.md` with the new analytics support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- analytics`

```text
> test:run
> vitest run analytics


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0276

 ✓ test/unit/analytics.test.ts (17 tests) 10ms

 Test Files  1 passed (1)
      Tests  17 passed (17)
   Start at  18:22:14
   Duration  1.27s (transform 59ms, setup 62ms, collect 32ms, tests 10ms, environment 469ms, prepare 172ms)
```

### `npx eslint app/services/analytics/tracker.ts test/unit/analytics.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
