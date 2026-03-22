---
task_id: "T0011"
status: review
completed: 2026-03-22
agent: codex
branch: feature/T0203-mailchimp-final
---

# T0011 Result: Multi-Currency Support — Missing Parts Implemented

## What was added

### 1. `app/services/currency/rounding.ts`
New module implementing per-currency rounding rules.

- `RoundingRule` interface (`currency`, `strategy`, `precision`)
- `getDefaultRoundingRules()` — returns full list of rules for 55+ currencies
- `getRoundingRule(currency)` — lookup with fallback to `{ strategy: 'nearest', precision: 2 }`
- `roundPrice(amount, currency)` — applies the correct strategy via `Math.round/ceil/floor`
- Handles zero-decimal currencies (JPY, KRW, VND, …), three-decimal currencies (KWD, BHD, OMR, …), and standard two-decimal currencies
- Exported from `app/services/currency/index.ts`

### 2. `extensions/currency-switcher/`
New Shopify theme app extension.

**`shopify.extension.toml`**
- `type = "theme_app_extension"`, handle `rtl-currency-switcher`
- Declares the `currency-switcher` block

**`blocks/currency-switcher.liquid`**
- Renders `shop.enabled_currencies` as an accessible dropdown (`role="listbox"`, `aria-expanded`, `aria-selected`)
- Keyboard navigation: Arrow up/down to move, Enter/Space to open, Escape to close
- Currency selection: posts to `/cart/update` with the selected currency code, or calls `window.Shopify.updateCurrency()` when available (Shopify Markets)
- Persists selection in a 30-day `rtl_currency` cookie
- Schema settings: position (header/footer/inline), show_symbol, show_currency_name, show_icon

**`assets/currency-switcher.css`**
- Uses CSS custom properties (`--color-border`, `--color-background-secondary`, etc.) — no hardcoded colors
- Full RTL support via `[dir="rtl"]` overrides and `inset-inline-*` logical properties
- `prefers-reduced-motion` and `forced-colors` media query guards
- Animated dropdown open/close (respects reduced motion)

### 3. `app/routes/api.currency.rates.ts`
New Remix loader route at `GET /api/currency/rates`.

- Authenticates via `authenticate.admin(request)`
- Query params: `base` (default `USD`), `targets` (comma-separated, default `POPULAR_CURRENCIES`)
- Returns `{ base, timestamp, rates: { [code]: { rate, source, expiresAt } } }`
- HTTP `Cache-Control: public, max-age=300, stale-while-revalidate=60`
- Returns 503 JSON on exchange-rate fetch failure

## Test results

```
npx vitest run test/unit/currency.test.ts

 ✓ test/unit/currency.test.ts (36 tests)

Test Files  1 passed (1)
Tests       36 passed (36)
```

All 36 pre-existing currency tests pass. No regressions.
