## Summary

Implemented SEO-app translation helpers for SEO tool titles, metadata field labels, and optimization field descriptions in `app/services/integrations/index.ts`. Added integration tests covering translated SEO app content and metadata preservation in `test/unit/integrations.test.ts`. Updated `CHANGELOG.md` with the new integration support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- integrations`

```text
> test:run
> vitest run integrations


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0250

 ✓ test/unit/integrations.test.ts (10 tests) 4ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  17:53:14
   Duration  1.13s (transform 50ms, setup 40ms, collect 19ms, tests 4ms, environment 393ms, prepare 142ms)
```

### `npx eslint app/services/integrations/index.ts test/unit/integrations.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
