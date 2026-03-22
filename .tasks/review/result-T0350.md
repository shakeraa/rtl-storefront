## Summary

Implemented locale-aware input-mask helpers in `app/services/input-masks/index.ts` for phone, postal code, and tax identifier formats, plus masked-input normalization for storage. Added unit coverage in `test/unit/input-masks.test.ts` for locale mask lookup, mask application, and normalization behavior. Updated `CHANGELOG.md` with the localized input-mask support.

## Verification

### `npm run test:run -- input-masks`

```text
> test:run
> vitest run input-masks

 ✓ test/unit/input-masks.test.ts (3 tests) 2ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  21:59:03
   Duration  977ms (transform 30ms, setup 40ms, collect 10ms, tests 2ms, environment 425ms, prepare 106ms)
```

### `./node_modules/.bin/eslint app/services/input-masks/index.ts test/unit/input-masks.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
