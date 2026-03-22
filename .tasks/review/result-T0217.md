# Task T0217: Integration - Upsell Apps

## Summary
Extended the integrations service with upsell translation support for section titles, CTA labels, and recommendation reasons, and registered an upsell integration in the registry.

## Files Modified

### Updated
- `app/services/integrations/index.ts`
- `test/unit/integrations.test.ts`
- `CHANGELOG.md`
- `.tasks/review/T0217-integration-upsell-apps.md`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added upsell translation helper and integration registry entry |
| Tests passing | ✅ | Focused integrations unit tests passed |
| Documentation updated | ✅ | Changelog updated with the upsell note |

## Test Results

### `npm run test:run -- integrations`

```text
✓ test/unit/integrations.test.ts (10 tests) 3ms
```

### Targeted ESLint

```text
npx eslint app/services/integrations/index.ts test/unit/integrations.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.
