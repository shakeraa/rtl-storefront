# Task T0174: Performance - Incremental Static Regeneration

## Summary
Added translation-aware ISR header helpers and wired them into the public landing-page loader so translated marketing requests can be cached with `stale-while-revalidate` semantics in shared caches.

## Files Modified

### Updated
- `app/routes/_index/route.tsx`
- `app/services/performance/index.ts`
- `CHANGELOG.md`
- `.tasks/review/T0174-performance-incremental-static-regeneration.md`

### Created
- `app/services/performance/isr.ts`
- `test/unit/isr.test.ts`
- `test/integration/index-route.test.ts`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added ISR header generation and applied it to translated landing-page responses |
| Tests passing | ✅ | Helper and route tests passed |
| Documentation updated | ✅ | Changelog updated with the ISR note |

## Test Results

### `npx vitest run test/unit/isr.test.ts test/integration/index-route.test.ts`

```text
✓ test/unit/isr.test.ts (2 tests) 2ms
✓ test/integration/index-route.test.ts (1 test) 6ms

Test Files  2 passed (2)
Tests       3 passed (3)
```

### Targeted ESLint

```text
npx eslint app/services/performance/isr.ts app/services/performance/index.ts app/routes/_index/route.tsx test/unit/isr.test.ts test/integration/index-route.test.ts --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.

## Notes

- ISR is applied to the public `_index` route because that is the cacheable translated page surface already present in this repository.
- The helper derives TTL defaults from the existing translation cache strategy so static translated content gets a longer shared-cache lifetime than dynamic fragments.
