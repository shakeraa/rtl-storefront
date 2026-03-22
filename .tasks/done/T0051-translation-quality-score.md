---
id: "T0051"
title: "Translation Quality - AI Confidence Scoring"
priority: medium
assigned: claude-sec
branch: feature/quality-score
status: done
created: 2026-03-22
depends_on: ["T0001"]
locks: []
test_command: ""
---

## Description
AI confidence scoring to flag low-quality translations for review.

## Acceptance criteria
- [ ] Confidence score per translation
- [ ] Low confidence flagging (<70%)
- [ ] Quality dashboard
- [ ] Suggest re-translation for low scores
- [ ] Quality trends over time
