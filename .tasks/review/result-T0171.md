# Task T0171: Performance - Request Batching

## Summary
Extended the batch translation service into a real execution layer that deduplicates identical translation inputs, runs them in bounded chunks with configurable concurrency, tracks progress in-memory, and fans the result back out to every original request ID in order.

## Files Modified

### Updated
- `app/services/performance/batch-translator.ts`
- `CHANGELOG.md`
- `.tasks/review/T0171-performance-request-batching.md`

### Created
- `test/unit/batch-translator.test.ts`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added executable batch translation flow with dedupe, chunking, progress tracking, and error fan-out |
| Tests passing | ✅ | Focused batch translator unit tests passed |
| Documentation updated | ✅ | Changelog updated with the batching note |

## Test Results

### `npm run test:run -- batch-translator`

```text
✓ test/unit/batch-translator.test.ts (3 tests) 3ms

Test Files  1 passed (1)
Tests       3 passed (3)
```

### Targeted ESLint

```text
npx eslint app/services/performance/batch-translator.ts test/unit/batch-translator.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.

## Notes

- The batching layer is execution-oriented rather than provider-specific, so it can wrap the existing translation engine without assuming a provider-native bulk API exists.
- Duplicate requests are detected on the full translation input shape, including locales, context, format, preferred provider, and cache-bypass intent.
