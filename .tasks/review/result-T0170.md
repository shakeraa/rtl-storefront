# Task T0170: Performance - Memory Usage Optimization

## Summary
Reduced long-lived in-memory growth in two hot paths: the cost monitor now prunes old records and caps retained entries, and the content translator cache now uses TTL-based cleanup plus LRU eviction when it reaches its configured size limit.

## Files Modified

### Updated
- `app/services/performance/cost-monitor.ts`
- `app/services/content-translator/index.ts`
- `CHANGELOG.md`
- `.tasks/review/T0170-performance-memory-usage-optimization.md`

### Created
- `test/unit/memory-optimization.test.ts`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added retention/entry caps to cost tracking and LRU/TTL pruning to content translation cache |
| Tests passing | ✅ | Focused memory-optimization unit tests passed |
| Documentation updated | ✅ | Changelog updated with the memory optimization note |

## Test Results

### `npm run test:run -- memory-optimization`

```text
✓ test/unit/memory-optimization.test.ts (4 tests) 4ms

Test Files  1 passed (1)
Tests       4 passed (4)
```

### Targeted ESLint

```text
npx eslint app/services/performance/cost-monitor.ts app/services/content-translator/index.ts test/unit/memory-optimization.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.

## Notes

- The memory reductions are scoped to service-layer stores that already existed in this repo, so the branch avoids changing route behavior or introducing new persistence requirements.
- The content translator eviction policy is access-ordered: cache hits move entries to the back so the oldest unused key is evicted first.
