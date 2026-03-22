## Summary

Implemented configurable retention settings for the in-memory analytics event store in `app/services/analytics/tracker.ts`, including age-based pruning, max-event pruning, and accessors for the current configuration. Added analytics tests covering default settings, stale-event cleanup, max-count trimming, and total event count access in `test/unit/analytics.test.ts`. Updated `CHANGELOG.md` with the new analytics retention support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- analytics`

```text
> test:run
> vitest run analytics


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0280

 ✓ test/unit/analytics.test.ts (19 tests) 10ms

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  18:57:02
   Duration  793ms (transform 47ms, setup 38ms, collect 28ms, tests 10ms, environment 379ms, prepare 75ms)
```

### `./node_modules/.bin/eslint app/services/analytics/tracker.ts test/unit/analytics.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
