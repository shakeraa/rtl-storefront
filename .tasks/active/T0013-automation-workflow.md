---
id: "T0013"
title: "Automation & Workflow - Content Sync & Auto-Translation"
priority: high
assigned: claude-sec
branch: feature/automation
status: active
created: 2026-03-22
depends_on: ["T0001", "T0008"]
locks: ["app/services/automation/"]
test_command: "npm run test:run -- automation"
---

## Description
Build automation system for content synchronization and auto-translation workflows. Reduces manual work by automatically translating new/updated content.

Features:
- Real-time webhook-based sync
- Autopilot mode (auto-translate new content)
- Auto-retranslation on source update
- Draft product translation
- Bulk update handling
- Conditional translation rules

## Files to create/modify
- `app/services/automation/sync.ts` - Content sync orchestrator
- `app/services/automation/webhook-handler.ts` - Shopify webhook processor
- `app/services/automation/rules.ts` - Automation rules engine
- `app/services/automation/queue.ts` - Translation job queue
- `app/routes/webhooks.shopify.$.ts` - Shopify webhook routes
- `prisma/schema.prisma` - AutomationRule, TranslationJob models

## Acceptance criteria
- [ ] Webhook handler for product/create, product/update
- [ ] Collection webhook handling
- [ ] Auto-translate on product create toggle
- [ ] Auto-retranslate on source update
- [ ] Draft product translation queue
- [ ] Bulk translation job processing
- [ ] Conditional rules (e.g., translate only if in X collection)
- [ ] Translation job status dashboard
- [ ] Failed job retry mechanism
