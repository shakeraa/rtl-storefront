# T0397 — Fix Hardcoded Route Loaders

## Status: queue
## Priority: critical

## Problem
Multiple route loaders return entirely hardcoded data instead of querying Shopify/DB:
- `app._index.tsx` — dashboard stats hardcoded
- `app.translations.tsx` — entire loader hardcoded
- `app.coverage.tsx` — all coverage data hardcoded at module level
- `app.export.tsx` — uses sampleData array
- `app.translate.tsx` — items list and language stats hardcoded
- `app.analytics.tsx` — hardcoded fallback + always-hardcoded weekly/language tables
- `app.alerts.tsx` — real service over hardcoded UNTRANSLATED_COUNTS

## Fix
Query Shopify Admin GraphQL API for translatableResources and real coverage data.
