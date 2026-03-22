# Codex — Agent Instructions

Read `.agents/RULES.md` first — it overrides everything here.

## Workflow
1. Pick task from `.tasks/active/` assigned to `codex`
2. Create feature branch: `feat/<task-id>-<slug>`
3. Implement with real code and tests
4. Write `result.md` with test output
5. Move task + result to `.tasks/review/`
6. Wait for Claude to review and merge

## Rules
- Work ONLY on your assigned branch — never commit to `main`
- One branch per task, not batched
- Every change MUST have tests
- Use `import db from "../../db.server"` (default export)
- Use CSS custom properties — never hardcoded hex in styles
- Follow existing patterns in the codebase — read before writing
- NEVER recreate task files already in `done/`
- NEVER commit test files importing non-existent services

## Testing (MANDATORY)
```bash
npx vitest run --reporter=dot
npm run build
```
Both must pass. Include output in `result.md`.

## Code Standards
- TypeScript strict mode
- Polaris v12 components only
- `authenticate.admin(request)` in every route loader/action
- Optional chaining: `data?.length ?? 0`
- No hardcoded colors — use CSS variables
