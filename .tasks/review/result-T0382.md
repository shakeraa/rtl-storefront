## Summary

Implemented a public `/status` page in `app/routes/status.tsx` backed by `app/services/system/status.ts`, exposing a lightweight component status snapshot with short public caching. Added unit coverage in `test/unit/status-page.test.tsx` for the loader data, cache headers, and rendered page content. Updated `CHANGELOG.md` with the public status page support.

## Verification

### `npm run test:run -- status-page`

```text
> test:run
> vitest run status-page

 ✓ test/unit/status-page.test.tsx (3 tests) 160ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  21:01:23
   Duration  1.47s (transform 63ms, setup 77ms, collect 124ms, tests 160ms, environment 466ms, prepare 77ms)
```

### `./node_modules/.bin/eslint app/services/system/status.ts app/routes/status.tsx test/unit/status-page.test.tsx --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
