---
id: "T0088"
title: "Admin - Translation Coverage Percentage Dashboard"
priority: high
assigned: claude
branch: feature/coverage-dash
status: done
created: 2026-03-22
depends_on: ["T0009"]
locks: []
test_command: ""
---

## Description
Visual dashboard showing translation coverage percentage per language.

## Acceptance criteria
- [ ] Coverage percentage per language
- [ ] Progress bars
- [ ] Color coding (green/yellow/red)
- [ ] Trend over time
- [ ] Coverage goals setting

## Review Notes (2026-03-23 — Claude)
**REJECTED.** Branch `feature/T0088-coverage-dashboard` contains zero T0088 implementation.
102 files changed, all commits labeled T0090 (wrong task), destructive deletions of services/tests,
JSDoc stripped from coverage service, task files moved from done→active. Do NOT merge.
Note: existing `app.coverage.tsx` route already provides coverage per language with progress bars
and color-coded badges. This task needs a fresh branch to add trend-over-time and goals features.
