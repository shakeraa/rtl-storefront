## Summary

Added unit coverage for HTML and Markdown formatting preservation in `app/services/translation-formatting/index.ts` via `test/unit/formatting-preservation.test.ts`. The tests verify placeholder protection and round-trip restoration for HTML tags and Markdown constructs. Updated `CHANGELOG.md` with the formatting-preservation verification support.

## Verification

### `npm run test:run -- formatting-preservation`

```text
> test:run
> vitest run formatting-preservation

 ✓ test/unit/formatting-preservation.test.ts (2 tests) 2ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  22:09:53
   Duration  1.19s (transform 38ms, setup 39ms, collect 17ms, tests 2ms, environment 409ms, prepare 147ms)
```

### `./node_modules/.bin/eslint test/unit/formatting-preservation.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
