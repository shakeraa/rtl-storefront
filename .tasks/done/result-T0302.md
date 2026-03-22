## Summary

Implemented terminology extraction helpers in `app/services/never-translate/index.ts` that identify recurring brand-like source terms and promote them into never-translate protection rules without duplicating existing entries. Added unit coverage in `test/unit/never-translate.test.ts` for repeated brand extraction and config updates from extracted terms. Updated `CHANGELOG.md` with the terminology extraction support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- never-translate`

```text
> test:run
> vitest run never-translate


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0302

 ✓ test/unit/never-translate.test.ts (13 tests) 10ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
   Start at  20:22:23
   Duration  3.10s (transform 123ms, setup 164ms, collect 64ms, tests 10ms, environment 1.44s, prepare 458ms)
```

### `./node_modules/.bin/eslint app/services/never-translate/index.ts test/unit/never-translate.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
