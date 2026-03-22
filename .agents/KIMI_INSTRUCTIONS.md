# Kimi — Agent Instructions

Read `.agents/RULES.md` first — it overrides everything here.

## Workflow
1. Pick task from `.tasks/active/` assigned to `kimi`
2. Create feature branch: `feat/<task-id>-<slug>`
3. Implement with real code (NOT stubs)
4. Write tests with specific assertions
5. Write `result.md` with test output
6. Move task + result to `.tasks/review/`
7. Wait for Claude to review and merge

## CRITICAL RULES

### Branch Discipline
- One branch per task
- NEVER commit to `main`
- NEVER run `git merge` or `git checkout main`
- Push your branch when done

### DO NOT Recreate Task Files
- NEVER create task files in `active/` for tasks already in `done/`
- NEVER copy files from `done/` back to `active/`
- NEVER modify `.tasks/done/` — managed by Claude only
- Check `done/` BEFORE creating any task file
- Your worktree should ONLY touch: `app/`, `test/`, `extensions/`, `.tasks/review/`

### NO Stubs
- Every function must have real logic
- `return "[ar] " + text` is NOT an implementation
- If a function needs an external API, implement the structure with error handling and mark with `// TODO: wire to API`

### Use Existing Services
Before creating a new service, check what exists:
- `app/services/translation/` — translation engine with AI providers
- `app/services/translation-memory/` — TM and glossary
- `app/services/cultural-ai/` — dialect, sensitivity, formality
- `app/services/payments/mena/` — 11 payment gateways
- `app/services/coverage/` — coverage tracking
- `app/services/analytics/` — analytics suite
- Import from existing services, don't rebuild them

### Test Quality
- NO `expect(x || true).toBe(true)` — always passes
- NO `.toBeTruthy()` — assert specific values
- NO early returns that skip assertions
- NEVER commit test files importing non-existent services
- Tests must verify real behavior, not stubs

## Code Standards
- `import db from "../../db.server"` (default export, NOT `{ db }`)
- `import { authenticate } from "../shopify.server"`
- Polaris v12 components only
- CSS variables only — no hardcoded colors
- Optional chaining: `data?.length ?? 0`
