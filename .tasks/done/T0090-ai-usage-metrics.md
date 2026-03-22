---
id: "T0090"
title: "Admin - AI Usage Metrics Dashboard"
priority: medium
assigned: claude
branch: feature/ai-metrics
status: done
created: 2026-03-22
depends_on: ["T0009"]
locks: []
test_command: ""
---

## Description
Track and display AI translation usage, costs, and quota consumption.

## Acceptance criteria
- [ ] Characters translated per engine
- [ ] API call counts
- [ ] Cost estimation
- [ ] Quota remaining
- [ ] Usage trends chart
- [ ] Engine comparison

## Review Notes (2026-03-23 — Claude)
**REJECTED.** Branch `feature/T0090-ai-metrics` contains zero T0090 implementation.
Instead it destructively deletes 8 routes, 1 test file, and a theme block, reverts ~40
tasks from done→active, and rewrites governance files. Do NOT merge. Start fresh from main.
