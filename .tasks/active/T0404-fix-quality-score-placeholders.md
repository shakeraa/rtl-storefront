# T0404 — Fix Quality Score Placeholders

## Status: queue
## Priority: significant

## Problem
- `services/quality-score/index.ts:150-170` — `calculateGrammaticalAccuracy` placeholder (3 trivial checks)
- `services/quality-score/index.ts:175-185` — `calculateCulturalScore` checks dummy strings
- `services/quality-score/index.ts:190-203` — `calculateContextualScore` only checks length ratio
- `services/quality-score/index.ts:221-224` — `calculateTerminologyScore` always returns 80
- `services/quality-score/index.ts:362-392` — `getQualityStatsByContentType` and `recalculateScore` are stubs
- In-memory Map storage

## Fix
Implement real scoring using existing services (sensitivity, style-guide, glossary) and persist to DB.
