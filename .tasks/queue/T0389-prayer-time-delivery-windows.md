# T0389 — Prayer Time-Aware Delivery Windows

## Status: queue
## Priority: medium
## Source: product_spec §3.5

## Description

Respect prayer times in delivery scheduling for MENA markets by blocking delivery slots around salah times.

## Requirements

### Prayer Time Integration
- Integrate with Aladhan API for accurate daily prayer times by city
- Delivery windows automatically exclude prayer times (especially Friday Jumu'ah)
- Customer-facing delivery time picker shows available slots with prayer times blocked
- Delivery estimates adjust for Friday (half-day in many MENA countries)
- Ramadan-aware: adjusted windows during fasting month (earlier mornings, later evenings)

### Salah Times Blocked
- Fajr (dawn) — typically not a delivery window
- Dhuhr (noon) — 30-min block
- Asr (afternoon) — 30-min block
- Maghrib (sunset) — 30-min block
- Isha (night) — 30-min block
- Jumu'ah (Friday noon) — 90-min block

### Configuration
- Merchant enables/disables per market
- Custom buffer time before/after prayer (default: 15 min)
- Applies to: delivery windows, live chat availability, support hours display

## Implementation Notes

- New service: `app/services/prayer-times/`
- Extend existing shipping service with prayer-aware scheduling
- External API: Aladhan API (free, no auth required)
- Cache prayer times daily per city
