# T0403 — Fix Analytics Stubs + AI Usage Bug

## Status: queue
## Priority: significant

## Problem
- `services/analytics/tracker.ts:43-76` — in-memory store, console.log placeholder
- `services/analytics/reports.ts:285-293` — hardcoded mock contentStats and costs
- `services/analytics/ai-usage.ts:334` — BUG: `reduce((sum, e) => e.characters, 0)` missing `sum +`

## Fix
- Fix the reduce bug immediately
- Wire analytics tracker to DB persistence
- Replace hardcoded report data with real queries
