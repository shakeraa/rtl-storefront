---
id: "T0011"
title: "Commerce Localization - Multi-Currency Support"
priority: medium
assigned: unassigned
branch: feature/multi-currency
status: queue
created: 2026-03-22
depends_on: []
locks: ["app/services/currency/"]
test_command: "npm run test:run -- currency"
---

## Description
Implement multi-currency support with real-time exchange rates, allowing customers to shop in their local currency.

Features:
- 168+ currency support
- Real-time exchange rates
- Manual rate override
- Rounding rules
- Geolocation auto-switching
- Currency switcher widget

## Files to create/modify
- `app/services/currency/exchange.ts` - Exchange rate service
- `app/services/currency/converter.ts` - Currency conversion
- `app/services/currency/rounding.ts` - Price rounding rules
- `extensions/currency-switcher/` - Currency switcher extension
- `app/routes/api.currency.rates.ts` - Exchange rate API
- `prisma/schema.prisma` - CurrencySettings model

## Acceptance criteria
- [ ] 168+ currency support
- [ ] Real-time exchange rate updates
- [ ] Manual rate override capability
- [ ] Currency-specific rounding rules
- [ ] Geolocation-based auto-switching
- [ ] Currency switcher widget
- [ ] Multi-currency checkout flow
- [ ] Currency-specific pricing display
- [ ] Exchange rate history tracking
