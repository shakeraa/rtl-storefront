# T0399 — Fix Geolocation Stub

## Status: queue
## Priority: critical

## Problem
- `services/geolocation/index.ts:56-71` — `detectLocation()` always returns hardcoded Saudi Arabia
- `services/geolocation/index.ts:131-135` — `detectVPN()` always returns false

## Fix
Use request headers (CF-IPCountry, X-Vercel-IP-Country, or Shopify's built-in geolocation) for real detection.
