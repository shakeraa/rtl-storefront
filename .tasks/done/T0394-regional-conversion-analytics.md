# T0394 — Regional Conversion Analytics Dashboard

status: done
## Priority: high
## Source: product_spec §5.1
## Depends: partial implementation exists (language-level analytics, ROI by language)

## Description

Extend existing analytics to include country-level, dialect-specific, and payment method conversion breakdowns.

## What Already Exists

- `app/services/analytics/reports.ts` — ROI by language, translation volume, coverage metrics
- `app/services/analytics/tracker.ts` — event tracking
- `app/routes/app.analytics.tsx` — analytics dashboard

## What's Missing

### Country-Level Breakdown
- Conversion rate by country (UAE vs. Saudi vs. Israel vs. Egypt)
- Revenue by country, not just language
- Conversion funnel by market (cart abandonment by country)

### Dialect Performance
- Gulf Arabic pages vs. MSA pages conversion comparison
- Dialect-specific revenue attribution

### Payment Method Analytics
- Which payment methods convert best per market (Tabby vs. COD vs. credit card)

### Holiday Impact
- Revenue lift during Ramadan, Eid, Hanukkah vs. baseline

### Localization ROI
- Revenue increase attributed to RTL Pro features (before/after)
- AI-generated recommendations based on analytics patterns

### Reporting
- Weekly market performance summary (automated email)
- Monthly geo analytics deep-dive
- Export to CSV / Google Sheets

## Implementation Notes

- Extend `app/services/analytics/reports.ts` with regional breakdowns
- Extend `app/routes/app.analytics.tsx` with new dashboard sections
- Add country detection to analytics tracker (extend geolocation service)
