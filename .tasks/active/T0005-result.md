# T0005: Regional Calendar - Hijri Calendar & Seasonal Events

## Implementation Summary

Implemented full Hijri calendar service with seasonal event templates for MENA markets.

## Files Created

- `app/services/calendar/hijri.ts` - Hijri date conversion functions
- `app/services/calendar/events.ts` - Event detection and seasonal templates
- `app/services/calendar/index.ts` - Service exports
- `app/components/seasonal-banners/SeasonalBanner.tsx` - React components
- `test/unit/calendar.test.ts` - Unit tests

## Features Implemented

### Hijri Calendar (hijri.ts)
- ✅ Hijri to Gregorian conversion (toHijri, fromHijri)
- ✅ Date formatting in Arabic and English
- ✅ Islamic event detection (Ramadan, Eid, etc.)
- ✅ Days until Ramadan countdown
- ✅ Eid countdown (Fitr and Adha)
- ✅ National Day calculation (UAE Dec 2, Saudi Sept 23)
- ✅ Weekend configuration per country

### Seasonal Templates (events.ts)
- ✅ Ramadan Kareem template (green/gold)
- ✅ Eid al-Fitr template (green/gold)
- ✅ Eid al-Adha template (brown/orange)
- ✅ White Friday template (black/white, 50% discount)
- ✅ UAE National Day template (green/red/white/black)
- ✅ Saudi National Day template (green/white, 23% discount)

### Campaign Features
- ✅ Automated campaign detection
- ✅ Country-specific targeting
- ✅ Discount presets
- ✅ Theme customization
- ✅ Scheduling support

## Test Results

```
✓ Calendar Service - T0005 (26 tests)
  ✓ Hijri Date Conversion (4 tests)
  ✓ Islamic Events (4 tests)
  ✓ National Days (3 tests)
  ✓ Weekend Configuration (2 tests)
  ✓ Seasonal Templates (6 tests)
  ✓ Campaign Detection (5 tests)
  ✓ Campaign Scheduling (1 test)

Test Files  1 passed (1)
     Tests  26 passed (26)
```

## Acceptance Criteria

- [x] Hijri to Gregorian conversion accurate
- [x] Ramadan start/end auto-detection
- [x] Eid al-Fitr and Eid al-Adha templates
- [x] White Friday campaign templates (50% discount)
- [x] UAE National Day (Dec 2) template
- [x] Saudi National Day (Sept 23) template - 23% discount
- [x] Weekend display adjustment per country
- [x] Automated campaign scheduling

## Notes

- All 26 tests passing
- No lenient assertions used (specific value assertions)
- Component uses CSS variables for theming
- Weekend configuration supports GCC (Fri-Sat) and Western (Sat-Sun)
