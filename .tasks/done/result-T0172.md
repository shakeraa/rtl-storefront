# Task T0172: Performance - Debounced Auto-Save

## Summary
Added debounced auto-save scheduling to the draft-translation service so repeated preview updates for the same job collapse into a single write. The service now also supports explicit flush and cancellation of pending saves.

## Files Modified

### Updated
- `app/services/draft-translation/index.ts`
- `CHANGELOG.md`
- `.tasks/review/T0172-performance-debounced-auto-save.md`

### Created
- `test/unit/draft-auto-save.test.ts`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added debounced preview persistence with flush/cancel support for draft translation jobs |
| Tests passing | ✅ | Focused draft auto-save unit tests passed |
| Documentation updated | ✅ | Changelog updated with the debounced auto-save note |

## Test Results

### `npm run test:run -- draft-auto-save`

```text
✓ test/unit/draft-auto-save.test.ts (3 tests) 3ms

Test Files  1 passed (1)
Tests       3 passed (3)
```

### Targeted ESLint

```text
npx eslint app/services/draft-translation/index.ts test/unit/draft-auto-save.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.

## Notes

- The auto-save behavior is intentionally scoped to the draft-translation service because this repository does not yet contain a dedicated translation editor route to wire into.
- Pending saves are cancelled automatically when a draft is cancelled or published.
