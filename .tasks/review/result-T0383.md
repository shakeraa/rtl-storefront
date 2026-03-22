## Summary

Implemented backup-management helpers in `app/services/system/backup.ts` for listing, creating, and restoring backup records behind the existing system UI contracts. Added unit coverage in `test/unit/backup.test.ts` for backup creation, ordering, and restore behavior. Updated `CHANGELOG.md` with the backup system support.

## Verification

### `npm run test:run -- backup`

```text
> test:run
> vitest run backup

 ✓ test/unit/backup.test.ts (3 tests) 12ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  21:12:29
   Duration  876ms (transform 70ms, setup 86ms, collect 10ms, tests 12ms, environment 390ms, prepare 73ms)
```

### `./node_modules/.bin/eslint app/services/system/backup.ts test/unit/backup.test.ts --rule 'jest/no-deprecated-functions: off'`

```text
⚠️ REMIX FUTURE CHANGE: The `@remix-run/eslint-config` package is deprecated and will not be included in React Router v7.  We recommend moving towards a streamlined ESLint config such as the ones included in the Remix templates. See https://github.com/remix-run/remix/blob/v2/templates/remix/.eslintrc.cjs.
```
