# Task T0212: Integration - Product Tabs Apps

## Summary
Extended the integrations service with product-tab translation support for tab titles and bodies, and registered a product-tabs integration in the registry.

## Files Modified

### Updated
- `app/services/integrations/index.ts`
- `test/unit/integrations.test.ts`
- `CHANGELOG.md`
- `.tasks/review/T0212-integration-product-tabs-apps.md`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added product-tab translation helper and integration registry entry |
| Tests passing | ✅ | Focused integrations unit tests passed |
| Documentation updated | ✅ | Changelog updated with the product-tabs note |

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
