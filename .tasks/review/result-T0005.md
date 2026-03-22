# Result: T0005 — Regional Calendar: Hijri Calendar & Seasonal Events

## Status: Complete

## What Was Implemented

### 1. Events API Route
**File:** `app/routes/api.calendar.events.ts`

- `GET /api/calendar/events` — Returns upcoming Islamic events, active/upcoming campaign events, Hijri date for today, countdown timers (Ramadan, Eid al-Fitr, Eid al-Adha), and national day dates. Accepts `country`, `days`, and `hijri` query params. Filters campaigns by country code.
- `POST /api/calendar/events` — Creates/schedules a custom campaign event. Validates required fields (`id`, `name`, `startDate`, `endDate`, `type`, `countries`, `template`), validates date ordering, calls `scheduleCampaign()`, and resolves the associated `SeasonalTemplate`. Returns 201 with event and template details.
- Authenticates all requests via `authenticate.admin(request)`.

### 2. Seasonal Templates

**Directory:** `app/services/calendar/templates/`

| File | Exports |
|------|---------|
| `ramadan.ts` | `RAMADAN_TEMPLATE`, `getRamadanDates(year)` |
| `eid.ts` | `EID_AL_FITR_TEMPLATE`, `EID_AL_ADHA_TEMPLATE`, `getEidAlFitrDate(year)`, `getEidAlAdhaDate(year)` |
| `white-friday.ts` | `WHITE_FRIDAY_TEMPLATE`, `getWhiteFridayDate(year)`, `getWhiteFridayDateRange(year)` |
| `national-days.ts` | `UAE_NATIONAL_DAY_TEMPLATE`, `SAUDI_NATIONAL_DAY_TEMPLATE`, `NATIONAL_DAY_TEMPLATES`, `getNationalDayCampaignRange(countryCode, year)` |
| `index.ts` | Re-exports all of the above |

Each template includes:
- English + Arabic banner text and sub-text
- Full color scheme (primary, secondary, accent, background, text)
- CSS class suggestions for storefront styling
- Default discount percentage, free shipping flag, bundle deals flag
- Target country list
- Dynamic date calculation helpers

Key design choices:
- Ramadan: deep Islamic green (`#1a5f2a`) + gold (`#d4af37`), 20% discount
- Eid al-Fitr: sea green + gold, 25% discount
- Eid al-Adha: earthy saddle brown + sandy tones, 30% discount
- White Friday: high-contrast white/black + urgency red, 50% discount, 4-day duration
- UAE National Day (Dec 2): UAE flag colors, 15% discount
- Saudi National Day (Sept 23): Saudi flag green + white, 23% discount (matching Sept 23)

## Test Output

```
Test Files  1 passed (1)
Tests  26 passed (26)
```

All 26 tests in `test/unit/calendar.test.ts` pass, including:
- Hijri/Gregorian date conversion
- Hijri date formatting (Arabic + English)
- Islamic event detection
- National day lookup (UAE, Saudi, unknown country)
- Weekend configuration per country
- All seasonal template assertions (colors, discounts, types)
- Campaign detection (Ramadan, White Friday, UAE National Day, Saudi National Day)
- Campaign scheduling
