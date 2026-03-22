---
id: "T0003"
title: "MENA Payment Methods - Tamara, Tabby, Mada Integration"
priority: high
assigned: claude
branch: feature/mena-payments
status: done
created: 2026-03-22
depends_on: []
locks: ["app/services/payments/mena/"]
test_command: "npm run test:run -- mena-payments"
---

## Description
Implement MENA-specific payment method integrations. This is a KEY DIFFERENTIATOR - no competitor offers these integrations natively.

Payment methods to support:
- Tamara (BNPL) - UAE, Saudi, Kuwait
- Tabby (BNPL) - MENA wide
- Cashew - UAE
- Telr - UAE, Saudi
- PayFort - MENA
- Mada (Saudi)
- STC Pay - Saudi Arabia

## Files to create/modify
- `app/services/payments/mena/tamara.ts` - Tamara BNPL integration
- `app/services/payments/mena/tabby.ts` - Tabby BNPL integration
- `app/services/payments/mena/mada.ts` - Mada card integration
- `app/services/payments/mena/stc-pay.ts` - STC Pay integration
- `app/services/payments/mena/telr.ts` - Telr gateway integration
- `app/services/payments/mena/index.ts` - MENA payment orchestrator
- `app/routes/api.payments.mena.$.ts` - API routes for MENA payments
- `extensions/mena-payments/` - Shopify checkout extension

## Acceptance criteria
- [ ] Tamara BNPL checkout flow working
- [ ] Tabby BNPL checkout flow working
- [ ] Mada card processing in SAR
- [ ] STC Pay mobile wallet integration
- [ ] Payment status webhooks handled
- [ ] Refund/cancellation support
- [ ] Multi-currency support (SAR, AED, USD)
- [ ] PCI compliance documentation
