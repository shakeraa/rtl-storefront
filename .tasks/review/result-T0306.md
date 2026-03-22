## Summary

Implemented style-guide enforcement helpers in `app/services/style-guide/index.ts` for banned terms, preferred wording replacements, and punctuation normalization. Added unit coverage in `test/unit/style-guide.test.ts` for violation detection and compliant text handling. Updated `CHANGELOG.md` with the style-guide enforcement support.

## Verification

### `npm run test:run -- style-guide`

```text
> test:run
> vitest run style-guide

 ✓ test/unit/style-guide.test.ts (2 tests) 2ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  21:59:03
   Duration  1.18s (transform 34ms, setup 44ms, collect 12ms, tests 2ms, environment 648ms, prepare 59ms)
```

### `./node_modules/.bin/eslint app/services/style-guide/index.ts test/unit/style-guide.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
