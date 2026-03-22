# T0396 — Fix Webhook Handlers (Products + Collections)

## Status: queue
## Priority: critical

## Problem
`routes/webhooks.products.tsx` and `routes/webhooks.collections.tsx` — all topic handlers (`CREATE`, `UPDATE`, `DELETE`) only `console.log`. No translation queuing, no TM cache invalidation, no DB operations.

## Fix
Wire webhook handlers to the content translation service and sync webhook handler.
