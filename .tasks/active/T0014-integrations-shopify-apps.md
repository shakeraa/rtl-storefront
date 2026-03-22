---
id: "T0014"
title: "Integrations - Shopify Ecosystem & Third-Party Apps"
priority: medium
assigned: kimi
branch: feature/integrations
status: active
created: 2026-03-22
depends_on: []
locks: ["app/services/integrations/"]
test_command: "npm run test:run -- integrations"
---

## Description
Integrate with popular Shopify apps and services to ensure translated content works across the ecosystem.

Apps to integrate:
- PageFly, GemPages, Shogun (page builders)
- Judge.me, Loox, Stamped, Yotpo (reviews)
- Klaviyo, Omnisend (email marketing)
- Zendesk, Gorgias (customer support)
- Product tabs, FAQ apps, size charts

## Files to create/modify
- `app/services/integrations/registry.ts` - Integration registry
- `app/services/integrations/pagefly.ts` - PageFly integration
- `app/services/integrations/judgeme.ts` - Judge.me reviews
- `app/services/integrations/klaviyo.ts` - Klaviyo emails
- `app/services/integrations/zendesk.ts` - Zendesk support
- `app/routes/api.integrations.$.ts` - Integration API

## Acceptance criteria
- [ ] PageFly content translation
- [ ] Judge.me review translation
- [ ] Loox review translation
- [ ] Klaviyo email template translation
- [ ] Zendesk ticket language detection
- [ ] Integration availability dashboard
- [ ] App-specific settings management
- [ ] Webhook handling for each app
- [ ] Integration health monitoring
