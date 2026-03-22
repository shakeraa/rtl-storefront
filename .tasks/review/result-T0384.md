## Summary

Implemented disaster-recovery configuration helpers in `app/services/system/disaster-recovery.ts` with validation for backup cadence, retention limits, and notification email handling. Added unit coverage in `test/unit/disaster-recovery.test.ts` for defaults, updates, validation, and persistence failures. Updated `CHANGELOG.md` with the disaster-recovery configuration support.

## Verification

### `npm run test:run -- disaster-recovery`

```text
> test:run
> vitest run disaster-recovery

 ✓ test/unit/disaster-recovery.test.ts (4 tests) 3ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  21:11:33
   Duration  731ms (transform 33ms, setup 37ms, collect 13ms, tests 3ms, environment 379ms, prepare 79ms)
```

### `./node_modules/.bin/eslint app/services/system/disaster-recovery.ts test/unit/disaster-recovery.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
