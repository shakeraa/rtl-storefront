---
id: "T0020"
title: "Public API - REST & GraphQL"
priority: medium
assigned: kimi
branch: feature/public-api
status: active
created: 2026-03-22
depends_on: []
locks: ["app/routes/api.v1/"]
test_command: "npm run test:run -- public-api"
---

## Description
Build public API for headless storefronts and third-party integrations. Enables programmatic access to translations.

APIs to build:
- REST API v1
- GraphQL endpoint (optional)
- API key authentication
- Rate limiting
- Webhook subscriptions

## Files to create/modify
- `app/routes/api.v1.translations.$.ts` - REST translation API
- `app/routes/api.v1.languages.$.ts` - REST languages API
- `app/services/api/auth.ts` - API key authentication
- `app/services/api/rate-limiter.ts` - Rate limiting
- `app/services/api/webhooks.ts` - Webhook management
- `prisma/schema.prisma` - ApiKey, WebhookSubscription models

## Acceptance criteria
- [ ] REST API for translations (GET, POST, PUT, DELETE)
- [ ] REST API for languages
- [ ] API key generation and management
- [ ] API key authentication middleware
- [ ] Rate limiting (requests per minute)
- [ ] Pagination for list endpoints
- [ ] JSON response format
- [ ] Error handling (4xx, 5xx)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Webhook subscription management
- [ ] API usage analytics
