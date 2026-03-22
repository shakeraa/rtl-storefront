---
id: "T0025"
title: "Hydrogen/Oxygen Headless Support"
priority: low
assigned: claude-sec
branch: feature/hydrogen
status: active
created: 2026-03-22
depends_on: ["T0020"]
locks: ["packages/hydrogen/"]
test_command: "npm run test:run -- hydrogen"
---

## Description
Create SDK/package for Shopify Hydrogen/Oxygen headless storefronts to enable translations in headless environments.

Deliverables:
- Hydrogen SDK package
- React hooks for translations
- Server-side rendering support
- Oxygen edge caching integration

## Files to create/modify
- `packages/hydrogen/` - Hydrogen SDK package
- `packages/hydrogen/src/useTranslation.ts` - Translation hook
- `packages/hydrogen/src/TranslationProvider.tsx` - Context provider
- `packages/hydrogen/src/api.ts` - API client
- `packages/hydrogen/README.md` - SDK documentation
- `packages/hydrogen/package.json` - Package config

## Acceptance criteria
- [ ] Hydrogen SDK npm package
- [ ] useTranslation() React hook
- [ ] TranslationProvider component
- [ ] Server-side rendering support
- [ ] Oxygen edge caching integration
- [ ] TypeScript types
- [ ] SDK documentation
- [ ] Example Hydrogen project
- [ ] Unit tests for hooks
- [ ] Published to npm registry
