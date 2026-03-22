# Task T0209: Integration - Wishlist Apps

## Summary
Extended the integrations service with wishlist-app label translation support for add/remove actions, wishlist titles, empty states, and count labels, and registered a wishlist integration in the registry.

## Files Modified

### Updated
- `app/services/integrations/index.ts`
- `test/unit/integrations.test.ts`
- `CHANGELOG.md`
- `.tasks/review/T0209-integration-wishlist-apps.md`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added wishlist label translation helper and wishlist integration registry entry |
| Tests passing | ✅ | Focused integrations unit tests passed |
| Documentation updated | ✅ | Changelog updated with the wishlist-app note |

## Test Results

### `npm run test:run -- integrations`

```text
✓ test/unit/integrations.test.ts (10 tests) 3ms

Test Files  1 passed (1)
Tests       10 passed (10)
```

### Targeted ESLint

```text
npx eslint app/services/integrations/index.ts test/unit/integrations.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.
