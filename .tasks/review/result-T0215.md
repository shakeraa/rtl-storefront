# Task T0215: Integration - Countdown Timer Apps

## Summary
Extended the integrations service with countdown-timer translation support for headings and countdown unit labels, and registered a countdown-timer integration in the registry.

## Files Modified

### Updated
- `app/services/integrations/index.ts`
- `test/unit/integrations.test.ts`
- `CHANGELOG.md`
- `.tasks/review/T0215-integration-countdown-timer-apps.md`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added countdown-timer translation helper and integration registry entry |
| Tests passing | ✅ | Focused integrations unit tests passed |
| Documentation updated | ✅ | Changelog updated with the countdown-timer note |

## Test Results

### `npm run test:run -- integrations`

```text
✓ test/unit/integrations.test.ts (10 tests) 8ms
```

### Targeted ESLint

```text
npx eslint app/services/integrations/index.ts test/unit/integrations.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.
