# T0405 — Fix Remaining Stubs

## Status: queue
## Priority: medium

## Stubs to Fix
- `services/media-features/index.ts:22-46` — `detectTextInImage` hardcoded OCR
- `services/media-translation/video-subtitles.ts:406-458` — `translateSubtitles` 10-word dict
- `services/system/backup.ts:8-46` — in-memory, fake restore
- `services/system/status.ts:12-37` — always operational
- `services/admin-features/index.ts:216-468` — hardcoded sales/conversion/AI metrics
- `services/advanced-features/index.ts:22-44` — hardcoded analytics summary
- `services/automation/sync.ts:50-57` — `getUntranslatedResources` returns []
- `services/notifications/index.ts:123-137` — `getNotificationPreferences` ignores shop
- `services/product-translation/index.ts` — only 8 vendors in hardcoded dict
- `services/schema-org/product-schema.ts:252-284` — `translateSchemaFields` no-op
- `services/rtl-design/index.ts:304-308` — `addBasicTashkeel` returns unchanged
- `services/security/pci-fraud.ts:79-239` — fake tokenization + in-memory audit
- `services/performance/edge-deploy.ts` — empty file
