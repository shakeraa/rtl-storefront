# T0400 — Fix Currency Exchange Stub

## Status: queue
## Priority: significant

## Problem
- `services/currency/exchange.ts:87-141` — `fetchExchangeRate` uses hardcoded mock rates
- `services/currency/exchange.ts:220-245` — `getRateHistory` uses `Math.random()`

## Fix
Integrate with a real exchange rate API (e.g., exchangerate-api.com, Open Exchange Rates, or Shopify's own currency data).
