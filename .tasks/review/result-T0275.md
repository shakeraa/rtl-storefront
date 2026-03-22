## Summary

Implemented product-popularity aggregation by locale in `app/services/analytics/tracker.ts`, ranking products by conversion count and revenue per language. Added analytics tests covering the new ranking output and an explicit `getEventCount()` assertion in `test/unit/analytics.test.ts`.

## Verification

### `npm run test:run -- analytics`

```text
> test:run
> vitest run analytics


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0275

 ✓ test/unit/analytics.test.ts (17 tests) 10ms

 Test Files  1 passed (1)
      Tests  17 passed (17)
   Start at  17:53:54
   Duration  728ms (transform 43ms, setup 38ms, collect 29ms, tests 10ms, environment 351ms, prepare 54ms)
```

### `npx eslint app/services/analytics/tracker.ts test/unit/analytics.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
