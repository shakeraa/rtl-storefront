# T0406 — Fix Bugs

## Status: queue
## Priority: high

## Bugs
1. `components/seasonal-banners/SeasonalBanner.tsx:57,85` — `await import()` in synchronous function body (will crash at runtime)
2. `extensions/rtl-fashion-sections/shopify.extension.toml` — uses `type = "theme"` instead of `type = "theme_app_extension"`, no blocks registered
3. `services/analytics/ai-usage.ts:334` — `reduce((sum, e) => e.characters, 0)` missing `sum +` (tracked in T0403 too)
