---
id: "T0012"
title: "Analytics - Translation & Conversion Tracking"
priority: medium
assigned: claude
branch: feature/analytics
status: active
created: 2026-03-22
depends_on: []
locks: ["app/services/analytics/"]
test_command: "npm run test:run -- analytics"
---

## Description
Build analytics system to track translation performance, sales by language, and ROI calculations.

Metrics to track:
- Translation volume by language
- Coverage percentage
- Sales by language
- Conversion by language
- SEO ranking by language
- AI confidence scoring

## Files to create/modify
- `app/services/analytics/tracker.ts` - Analytics tracking service
- `app/services/analytics/reports.ts` - Report generation
- `app/routes/app.analytics.tsx` - Analytics dashboard
- `app/components/analytics/` - Analytics chart components
- `prisma/schema.prisma` - AnalyticsEvent model

## Acceptance criteria
- [ ] Translation volume tracking
- [ ] Coverage percentage dashboard
- [ ] Sales by language report
- [ ] Conversion rate by language
- [ ] AI confidence scoring display
- [ ] Most/least translated content report
- [ ] User language preferences analytics
- [ ] Geolocation analytics
- [ ] ROI calculation by language
- [ ] Exportable reports (CSV, PDF)
