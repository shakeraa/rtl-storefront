## Summary

Implemented membership-app content translation helpers for plan names, renewal labels, member portal text, and benefit descriptions in `app/services/integrations/index.ts`. Added integration tests covering translated membership fields and metadata preservation in `test/unit/integrations.test.ts`. Updated `CHANGELOG.md` with the new integration support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- integrations`

```text
> test:run
> vitest run integrations


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0235

 ✓ test/unit/integrations.test.ts (10 tests) 5ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  16:59:43
   Duration  1.39s (transform 55ms, setup 57ms, collect 40ms, tests 5ms, environment 608ms, prepare 122ms)
```

### `npx eslint app/services/integrations/index.ts test/unit/integrations.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
