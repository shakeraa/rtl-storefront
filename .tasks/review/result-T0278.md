## Summary

Implemented locale-aware browser breakdown analytics in `app/services/analytics/tracker.ts`, including browser classification for Chrome, Safari, Firefox, Edge, Opera, and unknown traffic across page views and conversions. Added analytics tests covering browser classification, per-locale breakdown output, page-view user-agent capture, and total event count access in `test/unit/analytics.test.ts`. Updated `CHANGELOG.md` with the new analytics support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- analytics`

```text
> test:run
> vitest run analytics


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0278

 ✓ test/unit/analytics.test.ts (18 tests) 8ms

 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  18:50:31
   Duration  737ms (transform 44ms, setup 37ms, collect 30ms, tests 8ms, environment 362ms, prepare 76ms)
```

### `npx eslint app/services/analytics/tracker.ts test/unit/analytics.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
