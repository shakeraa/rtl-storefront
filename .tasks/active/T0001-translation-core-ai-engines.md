---
id: "T0001"
title: "Translation Core - AI Translation Engines Integration"
priority: high
assigned: unassigned
branch: feature/translation-ai-engines
status: active
created: 2026-03-22
depends_on: []
locks: ["app/services/translation/"]
test_command: "npm run test:run -- translation"
---

## Description
Implement AI translation engines for the RTL storefront app. This is a core feature that enables automatic translation of store content.

Supported engines to implement:
- OpenAI GPT-4 integration
- DeepL Pro API integration
- Google Neural Machine Translation
- Microsoft Translator (optional)
- Gemini AI integration (emerging)
- Smart AI engine selection per language pair
- API rate limiting & quota management

## Files to create/modify
- `app/services/translation/ai-providers/openai.ts` - OpenAI GPT-4 provider
- `app/services/translation/ai-providers/deepl.ts` - DeepL Pro provider
- `app/services/translation/ai-providers/google.ts` - Google Translate provider
- `app/services/translation/ai-providers/index.ts` - Provider registry & selection
- `app/services/translation/engine.ts` - Core translation engine
- `prisma/schema.prisma` - Add TranslationCache model

## Acceptance criteria
- [x] OpenAI GPT-4 provider implemented with rate limiting
- [x] DeepL Pro provider implemented with error handling
- [x] Google Translate provider implemented
- [x] Smart engine selection based on language pair
- [x] Translation result caching system
- [x] API quota tracking and alerts
- [x] Fallback chain when primary engine fails
- [x] Unit tests for all providers (80%+ coverage)
