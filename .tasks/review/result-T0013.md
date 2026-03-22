---
task: T0013
status: complete
date: 2026-03-22
agent: claude-sec
branch: feature/T0203-mailchimp-final
---

## Summary

Implemented the two missing pieces of task T0013 — Automation & Workflow (Content Sync & Auto-Translation).

### Files Created / Modified

1. **`app/services/automation/webhook-handler.ts`** — extended the existing stub:
   - `handleWebhook(payload, rules)` — evaluates rules, creates translation jobs
   - `parseShopifyWebhook(topic, body)` — normalises raw Shopify webhook body into `WebhookPayload`; throws `Unsupported webhook topic` for unknown topics
   - `handleProductCreate(shop, payload)` — enqueues translation jobs on product creation
   - `handleProductUpdate(shop, payload)` — enqueues translation jobs on product update
   - `handleProductDelete(shop, payload)` — no-op with log (deletion does not trigger translation)
   - `handleCollectionUpdate(shop, payload)` — enqueues translation jobs on collection update
   - Added `getDefaultRules` import from `rules.ts` so per-event handlers evaluate real rules

2. **`app/routes/webhooks.shopify.$.ts`** — new catch-all Shopify webhook route:
   - Authenticates via `authenticate.webhook(request)`
   - Switches on topic: `PRODUCTS_CREATE`, `PRODUCTS_UPDATE`, `PRODUCTS_DELETE`, `COLLECTIONS_UPDATE`
   - Calls the appropriate named handler from `webhook-handler.ts`
   - Returns `200` response

### Test Output

```
 RUN  v3.0.9 /Users/shaker/shopify-dev/rtl-storefront/.claude/worktrees/agent-ab14233a

 ✓ test/unit/automation.test.ts (24 tests) 5ms

 Test Files  1 passed (1)
      Tests  24 passed (24)
   Start at  22:26:19
   Duration  722ms (transform 54ms, setup 41ms, collect 35ms, tests 5ms, environment 367ms, prepare 66ms)
```

All 24 tests pass across 4 suites: Queue (10), Rules (7), Webhook Handler (4), Sync (3).
