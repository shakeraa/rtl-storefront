---
id: "T0024"
title: "Shopify Checkout Extensions"
priority: high
assigned: claude-sec
branch: feature/checkout-extensions
status: done
created: 2026-03-22
depends_on: ["T0003"]
locks: ["extensions/checkout/"]
test_command: "npm run test:run -- checkout"
---

## Description
Build Shopify Checkout UI extensions for language/currency switcher and MENA payment methods during checkout.

Extensions to build:
- Language switcher on checkout
- Currency switcher on checkout
- MENA payment method blocks
- RTL checkout layout adjustments

## Files to create/modify
- `extensions/checkout/` - Checkout extension directory
- `extensions/checkout/shopify.extension.toml` - Extension config
- `extensions/checkout/src/LanguageSwitcher.tsx` - Language switcher block
- `extensions/checkout/src/CurrencySwitcher.tsx` - Currency switcher block
- `extensions/checkout/src/MenaPayments.tsx` - MENA payment block
- `extensions/checkout/locales/` - Extension translations

## Acceptance criteria
- [ ] Language switcher checkout extension
- [ ] Currency switcher checkout extension
- [ ] MENA payment methods in checkout
- [ ] RTL checkout layout support
- [ ] Checkout translation API integration
- [ ] Extension configuration UI
- [ ] Checkout branding API integration
- [ ] Post-purchase extension (optional)
- [ ] Order status page extension
