# Task T0173: Performance - Virtual Scrolling

## Summary
Added a reusable virtualized translation-list component and a pure visible-range calculator so long translation queues can render only the visible window of rows instead of mounting the full list at once.

## Files Modified

### Updated
- `CHANGELOG.md`
- `.tasks/review/T0173-performance-virtual-scrolling.md`

### Created
- `app/components/translation/VirtualTranslationList.tsx`
- `test/unit/virtual-translation-list.test.tsx`

## Acceptance Criteria Status

| Criterion | Status | Notes |
|-----------|--------|-------|
| Feature implemented | ✅ | Added reusable virtual scrolling component for long translation lists |
| Tests passing | ✅ | Focused virtual-list unit tests passed |
| Documentation updated | ✅ | Changelog updated with the virtual scrolling note |

## Test Results

### `npm run test:run -- virtual-translation-list`

```text
✓ test/unit/virtual-translation-list.test.tsx (4 tests) 33ms

Test Files  1 passed (1)
Tests       4 passed (4)
```

### Targeted ESLint

```text
npx eslint app/components/translation/VirtualTranslationList.tsx test/unit/virtual-translation-list.test.tsx --rule 'jest/no-deprecated-functions: off'
```

No lint errors after fixes.

## Notes

- This repository does not yet contain a dedicated translation-editor route, so the task is delivered as a reusable component rather than patching a nonexistent screen.
- The visible range calculation is separated from the React component so future editor pages can reuse and test the virtualization math independently.
