## Summary

Implemented a public `/health` endpoint in `app/routes/health.ts` backed by `app/services/system/health.ts`, with runtime and database checks and non-cacheable responses suitable for uptime monitoring. Added unit coverage in `test/unit/health.test.ts` for healthy, degraded, and route-response behavior. Updated `CHANGELOG.md` with the health endpoint support.

## Verification

### `npm run test:run -- health`

```text
> test:run
> vitest run health

 ✓ test/unit/health.test.ts (3 tests) 7ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  21:01:23
   Duration  1.25s (transform 85ms, setup 62ms, collect 98ms, tests 7ms, environment 592ms, prepare 61ms)
```

### `./node_modules/.bin/eslint app/services/system/health.ts app/routes/health.ts test/unit/health.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
