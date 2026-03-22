# T0084 Floating Switcher - Test Results

**Date:** 2026-03-22
**Branch:** feature/T0084-floating-switcher

## Summary
All tests passing successfully.

## Test Results
```
✓ test/unit/floating-switcher.test.ts (64 tests) 6ms

Test Files  1 passed (1)
     Tests  64 passed (64)
```

## Coverage

### getFloatingSwitcherConfig (9 tests)
- ✓ Returns default config for English locale
- ✓ Flips position to bottom-left for Arabic RTL locale
- ✓ Flips position to bottom-left for Hebrew RTL locale
- ✓ Flips position correctly for Persian locale
- ✓ Keeps position for Urdu RTL locale when set to top-right
- ✓ Applies overrides while respecting RTL for Arabic
- ✓ Applies overrides without RTL flip for English
- ✓ Handles region-specific locales like ar-SA
- ✓ Handles region-specific locales like he-IL

### getPositionStyles (9 tests)
- ✓ Returns correct desktop styles for bottom-right position
- ✓ Returns correct desktop styles for bottom-left position
- ✓ Returns correct desktop styles for top-right position
- ✓ Returns correct desktop styles for top-left position
- ✓ Returns correct desktop styles for bottom-center position with transform
- ✓ Returns correct desktop styles for top-center position
- ✓ Returns scaled mobile styles
- ✓ Returns desktop styles for tablet
- ✓ Uses default offsets when not provided

### getVisibilityRules (4 tests)
- ✓ Returns correct rules for "always" visibility
- ✓ Returns correct rules for "scroll" visibility
- ✓ Returns correct rules for "hover" visibility
- ✓ Returns correct rules for "minimize-on-scroll" visibility

### getSwitcherLabels (10 tests)
- ✓ Returns English labels for en locale
- ✓ Returns Arabic labels for ar locale
- ✓ Returns Hebrew labels for he locale
- ✓ Returns Persian labels for fa locale
- ✓ Returns French labels for fr locale
- ✓ Returns German labels for de locale
- ✓ Returns Spanish labels for es locale
- ✓ Falls back to English for unknown locale
- ✓ Handles region-specific locales like en-US
- ✓ Handles region-specific Arabic locales like ar-SA

### getRTLPositionAdjustments (2 tests)
- ✓ Returns all true adjustments for RTL
- ✓ Returns all false adjustments for LTR

### getResponsiveOffsets (5 tests)
- ✓ Returns scaled offsets for mobile viewport (< 768px)
- ✓ Returns minimum 8px for mobile even with small base offsets
- ✓ Returns 75% offsets for tablet viewport (768px - 1024px)
- ✓ Returns full offsets for desktop viewport (>= 1024px)
- ✓ Handles exact mobile breakpoint (768px) as tablet

### shouldMinimizeOnScroll (5 tests)
- ✓ Returns true when scrollY exceeds threshold and not minimized
- ✓ Returns false when scrollY is below threshold and not minimized
- ✓ Returns false when scrollY is below half threshold and already minimized
- ✓ Returns true when scrollY is above half threshold and already minimized
- ✓ Returns false when at exact threshold and not minimized

### getMobileOptimizedConfig (3 tests)
- ✓ Returns compact config for mobile
- ✓ Scales down offsets for mobile
- ✓ Enforces minimum offset of 8px

### shouldShowOnMobile (3 tests)
- ✓ Returns true when not mobile
- ✓ Returns true when mobile and mobileOptimized is true
- ✓ Returns false when mobile and mobileOptimized is false

### getAccessibilityAttributes (3 tests)
- ✓ Returns correct aria attributes when expanded
- ✓ Returns correct aria attributes when collapsed
- ✓ Returns correct aria attributes for Arabic labels

### getBestPositionForLocale (5 tests)
- ✓ Returns same position for LTR locale
- ✓ Flips horizontal position for Arabic RTL locale
- ✓ Flips horizontal position for Hebrew RTL locale
- ✓ Keeps center positions unchanged for RTL
- ✓ Handles Persian RTL locale

### buildFloatingSwitcherStyles (6 tests)
- ✓ Returns correct styles for LTR locale
- ✓ Returns RTL styles for Arabic locale
- ✓ Returns minimized styles when minimized
- ✓ Returns non-minimized styles when not minimized
- ✓ Applies correct position styles for bottom-right
- ✓ Applies RTL adjustments correctly for Hebrew

## Files Created
- `/Users/shaker/shopify-dev/rtl-storefront/app/services/language-switcher/floating.ts`
- `/Users/shaker/shopify-dev/rtl-storefront/test/unit/floating-switcher.test.ts`

## Features Implemented
- Floating language switcher component logic
- Position management (left/right/corner) with RTL support
- Visibility toggles (always, scroll, hover, minimize-on-scroll)
- Responsive breakpoints (mobile, tablet, desktop)
- Accessibility attributes for screen readers
- Multi-language label support (en, ar, he, fa, fr, de, es)
