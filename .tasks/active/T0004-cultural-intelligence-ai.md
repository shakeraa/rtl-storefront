---
id: "T0004"
title: "Cultural Intelligence - Context-Aware Translation AI"
priority: high
assigned: claude-sec
branch: feature/cultural-ai
status: active
created: 2026-03-22
depends_on: ["T0001"]
locks: ["app/services/cultural-ai/"]
test_command: "npm run test:run -- cultural"
---

## Description
Build cultural context-aware AI translation system that goes beyond literal translation to provide culturally appropriate content for MENA markets.

Key differentiator: Fashion/cultural vocabulary fine-tuning that competitors lack.

Features:
- Cultural context-aware AI
- Fashion vocabulary fine-tuning
- Religious sensitivity filtering
- Dialect awareness (Gulf vs Levant vs Maghreb)
- Formality adjustment (antum vs anta)
- Modesty fashion terminology

## Files to create/modify
- `app/services/cultural-ai/context-analyzer.ts` - Cultural context detection
- `app/services/cultural-ai/fashion-corpus.ts` - Fashion terminology database
- `app/services/cultural-ai/religious-filter.ts` - Sensitivity filtering
- `app/services/cultural-ai/dialect-detector.ts` - Dialect identification
- `app/services/cultural-ai/prompts/` - Fine-tuned prompts per category
- `prisma/schema.prisma` - CulturalContext model

## Acceptance criteria
- [ ] Cultural context detection from product categories
- [ ] Fashion vocabulary fine-tuning working
- [ ] Religious sensitivity filter active
- [ ] Gulf vs Levant vs Maghreb dialect handling
- [ ] Formality levels (formal/informal) support
- [ ] Abaya/Kaftan/Hijab terminology database
- [ ] Cultural consultant marketplace API foundation
- [ ] A/B testing framework for cultural variants
