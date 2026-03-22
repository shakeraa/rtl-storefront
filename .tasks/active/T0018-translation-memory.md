---
id: "T0018"
title: "Translation Memory & Glossaries"
priority: high
assigned: claude-sec
branch: feature/translation-memory
status: active
created: 2026-03-22
depends_on: ["T0001"]
locks: ["app/services/translation-memory/"]
test_command: "npm run test:run -- translation-memory"
---

## Description
Build translation memory system for consistent translations and glossaries for brand terminology preservation.

Features:
- Translation memory (TM) storage
- Fuzzy matching for similar content
- Brand glossary management
- Never-translate term preservation (SKUs, brand names)
- Auto-suggest from memory

## Files to create/modify
- `app/services/translation-memory/store.ts` - TM storage
- `app/services/translation-memory/matcher.ts` - Fuzzy matching
- `app/services/translation-memory/glossary.ts` - Glossary management
- `app/routes/app.glossary.tsx` - Glossary UI
- `prisma/schema.prisma` - TranslationMemory, GlossaryEntry models

## Acceptance criteria
- [ ] Translation memory storage
- [ ] Exact match retrieval
- [ ] Fuzzy match (80%+ similarity)
- [ ] Brand glossary CRUD
- [ ] Never-translate terms enforcement
- [ ] Auto-suggest from TM
- [ ] TM import/export
- [ ] Glossary import/export
- [ ] TM statistics dashboard
- [ ] Cost savings calculator from TM
