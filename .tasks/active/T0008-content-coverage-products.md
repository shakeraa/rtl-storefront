---
id: "T0008"
title: "Content Coverage - Product & Collection Translation"
priority: high
assigned: claude-sec
branch: feature/product-translation
status: active
created: 2026-03-22
depends_on: ["T0001"]
locks: ["app/services/content/products.ts"]
test_command: "npm run test:run -- product-translation"
---

## Description
Implement comprehensive product and collection content translation covering all Shopify product fields.

Content types to translate:
- Product titles, descriptions, variants
- SKU preservation with translation
- Product tags, types, vendors
- Product options and custom fields
- Collection titles and descriptions
- Metafields (product, variant, collection)

## Files to create/modify
- `app/services/content/products.ts` - Product translation service
- `app/services/content/collections.ts` - Collection translation
- `app/services/content/metafields.ts` - Metafield translation
- `app/services/sync/webhook-handler.ts` - Shopify webhook processing
- `app/routes/api.translations.products.ts` - Product translation API
- `app/routes/api.translations.collections.ts` - Collection translation API

## Acceptance criteria
- [ ] Product title translation
- [ ] Product description translation
- [ ] Product variant translation
- [ ] Collection title/description translation
- [ ] Product metafields translation
- [ ] Auto-translation on product create/update
- [ ] Bulk translation operations
- [ ] Translation memory for product content
- [ ] Webhook sync for product changes
