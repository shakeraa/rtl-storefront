# Task T0216: Integration - Stock Counter Apps

## Summary
Extended the integrations service with stock-counter translation support for in-stock, low-stock, sold-out, and remaining-units labels, and registered a stock-counter integration in the registry.

## Files Modified

### Updated
- `app/services/integrations/index.ts`
- `test/unit/integrations.test.ts`
- `CHANGELOG.md`
- `.tasks/review/T0216-integration-stock-counter-apps.md`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added stock-counter translation helper and integration registry entry |
| Tests passing | ✅ | Focused integrations unit tests passed |
| Documentation updated | ✅ | Changelog updated with the stock-counter note |

## Test Results

### `npm run test:run -- integrations`

```text
✓ test/unit/integrations.test.ts (10 tests) 4ms
```

### Targeted ESLint

```text
npx eslint app/services/integrations/index.ts test/unit/integrations.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.
