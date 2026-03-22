---
id: "T0053"
title: "RTL - BiDi Text Preservation in Mixed Content"
priority: high
assigned: claude-sec
branch: feature/bidi-preservation
status: done
created: 2026-03-22
depends_on: ["T0002"]
locks: []
test_command: ""
---

## Description
Preserve proper display of mixed LTR and RTL text within translations using BiDi marks.

## Acceptance criteria
- [ ] LRM/RLM mark insertion
- [ ] Mixed English/Arabic display
- [ ] Number handling in Arabic text
- [ ] Email address preservation
- [ ] URL preservation
