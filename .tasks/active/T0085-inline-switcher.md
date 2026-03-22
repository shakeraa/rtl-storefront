---
id: "T0085"
title: "Language Switcher - Inline Dropdown"
priority: high
assigned: kimi
branch: feature/inline-switcher
status: active
created: 2026-03-22
depends_on: ["T0010"]
locks: []
test_command: ""
---

## Description
Inline dropdown language switcher for header/footer placement.

## Acceptance criteria
- [ ] Dropdown style
- [ ] Header placement
- [ ] Footer placement
- [ ] Current language indicator
- [ ] Compact design

## Review Notes (2026-03-23 — Claude)
**REQUEST CHANGES.** Service layer (inline.ts, 525 lines, 109 tests) is solid but
no React component or Liquid block renders the dropdown. Bugs: empty array crash in
getKeyboardNavigation, leading space in getTriggerDisplay. Barrel export missing.
Branch v2 contains unrelated work. Need: actual UI component, bug fixes, clean branch.
