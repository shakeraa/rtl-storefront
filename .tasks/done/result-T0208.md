# Task T0208: Integration - Bundle Apps

## Summary
Extended the integrations service with bundle-app translation support for bundle titles, descriptions, and bundled item labels, and registered a bundle app in the integration registry.

## Files Modified

### Updated
- `app/services/integrations/index.ts`
- `test/unit/integrations.test.ts`
- `CHANGELOG.md`
- `.tasks/review/T0208-integration-bundle-apps.md`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added bundle-app translation helper and bundle integration registry entry |
| Tests passing | ✅ | Focused integrations unit tests passed |
| Documentation updated | ✅ | Changelog updated with the bundle-app note |

## Test Results

### `npm run test:run -- integrations`

```text
✓ test/unit/integrations.test.ts (9 tests) 3ms

Test Files  1 passed (1)
Tests       9 passed (9)
```

### Targeted ESLint

```text
npx eslint app/services/integrations/index.ts test/unit/integrations.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.
