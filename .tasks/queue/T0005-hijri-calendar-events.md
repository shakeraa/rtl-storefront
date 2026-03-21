---
id: "T0005"
title: "Regional Calendar - Hijri Calendar & Seasonal Events"
priority: medium
assigned: unassigned
branch: feature/hijri-calendar
status: queue
created: 2026-03-22
depends_on: []
locks: ["app/services/calendar/"]
test_command: "npm run test:run -- calendar"
---

## Description
Implement Hijri calendar integration and seasonal event templates for MENA markets. Critical for Ramadan, Eid, and national day promotions.

Features:
- Hijri calendar integration
- Ramadan seasonal templates
- Eid seasonal templates
- White Friday templates (MENA Black Friday)
- National Day templates (UAE Dec 2, Saudi Sept 23)
- Weekend adjustment (Friday-Saturday vs Saturday-Sunday)

## Files to create/modify
- `app/services/calendar/hijri.ts` - Hijri date conversion
- `app/services/calendar/events.ts` - Event detection and scheduling
- `app/services/calendar/templates/` - Seasonal templates
- `app/routes/api.calendar.events.ts` - Events API
- `app/components/seasonal-banners/` - React components for seasonal UI

## Acceptance criteria
- [ ] Hijri to Gregorian conversion accurate
- [ ] Ramadan start/end auto-detection
- [ ] Eid al-Fitr and Eid al-Adha templates
- [ ] White Friday campaign templates
- [ ] UAE National Day (Dec 2) template
- [ ] Saudi National Day (Sept 23) template
- [ ] Weekend display adjustment per country
- [ ] Automated campaign scheduling
