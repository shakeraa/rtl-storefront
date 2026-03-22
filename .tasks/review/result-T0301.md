## Summary

Implemented per-language glossary management helpers in `app/services/translation-memory/glossary.ts`, including target-locale discovery, glossary bucket grouping, and grouped export output for separate target-language glossaries. Exported the new helpers and bucket type through `app/services/translation-memory/index.ts` and `app/services/translation-memory/types.ts`, and added unit coverage in `test/unit/translation-memory-store.test.ts`. Updated `CHANGELOG.md` with the new glossary bucketing support and resolved the existing conflict markers in the Unreleased section on this branch.

## Verification

### `npm run test:run -- translation-memory`

```text
> test:run
> vitest run translation-memory


 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront-codex-t0301

 ✓ test/unit/translation-memory.test.ts (21 tests) 3ms
 ✓ test/unit/translation-memory-store.test.ts (7 tests) 7ms

 Test Files  2 passed (2)
      Tests  28 passed (28)
   Start at  18:56:21
   Duration  1.32s (transform 81ms, setup 106ms, collect 95ms, tests 9ms, environment 890ms, prepare 105ms)
```

### `./node_modules/.bin/eslint app/services/translation-memory/types.ts app/services/translation-memory/glossary.ts app/services/translation-memory/index.ts test/unit/translation-memory-store.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
