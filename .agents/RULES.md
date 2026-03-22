# Multi-Agent Coding Rules

## Identity
You are one of several coding agents working in parallel. Check your branch: `git branch --show-current`.

## Worktree Isolation (MANDATORY)
- Agents MUST work in isolated git worktrees
- NEVER commit to `main` — only Claude (lead architect) commits to main
- NEVER switch branches — work on YOUR branch only
- If your branch isn't set up, STOP and ask the user

## Task Lifecycle
```
queue/ → active/ → review/ → done/
```
1. Pick a task from `active/` assigned to you
2. Update status to `in-progress`
3. Create feature branch: `feat/<task-id>-<slug>`
4. Implement with tests
5. Write `result.md` with test output
6. Move task + result to `review/`
7. Claude reviews, merges to main, moves to `done/`

## Task File Rules
- NEVER recreate task files that exist in `done/`
- NEVER copy files from `done/` back to `active/`
- NEVER modify the `done/` directory
- A task is done ONLY when locked paths exist with real code (not stubs)
- Do NOT bulk-move tasks — verify each individually

## Commit Discipline
- Prefix commits: `[feature/T0042-flags] add flag icons`
- Small, focused commits
- Push your branch when finished

## Boundaries
- Only modify files relevant to your task
- Don't touch files in another agent's scope
- If you depend on another branch, add a TODO — don't do their work
- If merge conflict: STOP and report

## Testing (MANDATORY before review)
```bash
npx vitest run --reporter=dot    # Must pass
npm run build                    # Must pass
```
- Run `test_command` from task file if specified
- Include actual test output in `result.md`
- "Manually verified" is NOT accepted
- NEVER commit test files that import from non-existent services

## Test Quality
- NO `expect(x || true).toBe(true)` — always passes
- NO `.toBeTruthy()` for existence — assert specific values
- NO early returns that skip assertions
- NO fake inline components — import the real thing
- Assert specific values, not just existence

## When You Finish
1. Run tests — fix failures before submitting
2. Rebase onto latest main: `git fetch origin && git rebase origin/main`
3. If conflicts: STOP and report (don't force resolve)
4. Push: `git push --force-with-lease`
5. Write summary: changes, files, test results, dependencies

## Code Standards
- Import Prisma: `import db from "../../db.server"` (default export)
- Import auth: `import { authenticate } from "../shopify.server"`
- Use Polaris v12 components only — no external CSS
- Guard data: `data?.length ?? 0`, never `data.length`
- No hardcoded colors — use CSS variables
