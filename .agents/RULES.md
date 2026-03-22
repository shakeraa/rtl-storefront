# Multi-Agent Coding Rules

## Identity
You are one of several coding agents working in parallel on this repo. Your identity is determined by the git worktree you are running in. Check your branch with `git branch --show-current` at the start of every session.

## Worktree Isolation (MANDATORY)
- Subagents MUST work in isolated git worktrees, not on the main working tree.
- Use `isolation: "worktree"` when spawning subagents to prevent branch contamination.
- Never commit to a branch you didn't create. Never switch branches.
- If you're the lead architect (Claude), cherry-pick or merge from worktree branches to main.

## Task Status Tracking (MANDATORY)
- When you START working on a task, update its status to `in-progress` in the task file.
- When you FINISH, update status to `done` only AFTER verifying the deliverables exist.
- Do NOT bulk-move tasks to done. Each task must be individually verified.
- A task is done ONLY when its locked paths exist and contain real code (not stubs).

## Branch Discipline
- You work EXCLUSIVELY on the branch already checked out in your worktree.
- NEVER switch branches. NEVER commit to `main`, `develop`, or any branch not yours.
- If your branch is not set up, STOP and ask the user — do not create one yourself.

## Commit Discipline
- Prefix all commit messages with your branch name in brackets, e.g. `[agent-1/auth] add login endpoint`
- Make small, focused commits after each logical unit of work.
- Push your branch when you finish a task or reach a meaningful checkpoint.

## Boundaries
- Only modify files relevant to your assigned task.
- Do NOT touch files that clearly belong to another agent's feature scope.
- If you depend on work from another branch, note it as a TODO comment and mention it in your summary. Do not attempt to do their work.
- If you encounter a merge conflict, STOP and report it.

## Testing (MANDATORY before submitting to review)
- You MUST run tests before moving any task to `.tasks/review/`.
- If the task file has a `test_command`, run it and include the output in your result.md.
- Run the relevant test suite for your changes:
  - **Backend changes**: `cd backend && PYTHONPATH=. python3 -m pytest tests/ -v --tb=short`
  - **Frontend changes**: `cd frontend && npx vitest run --reporter=verbose`
  - **Full stack changes**: run both
- If tests fail, fix the issue before submitting. Do NOT submit broken code to review.
- If no test suite exists yet, at minimum run:
  - Backend: `python3 -c "from <your_module> import <your_class>; print('OK')"` to verify imports
  - Frontend: `curl -s http://localhost:5173/<your-route> | head -1` to verify page loads
- Include actual test output in your `result.md` — "manually verified" is NOT sufficient.

## When You Finish
1. Run all tests (see Testing section above). If any fail, fix before proceeding.
2. Rebase your branch onto the latest `main`:
```bash
   git fetch origin
   git rebase origin/main
```
3. If there are conflicts during rebase, STOP and report them to the user. Do NOT force resolve.
4. If rebase succeeds cleanly, push your branch:
```bash
   git push --force-with-lease
```
5. Output a brief summary:
   - What you changed (and why)
   - Files added/modified/deleted
   - Test results (pass/fail counts)
   - Any open dependencies on other agents' branches
   - Any decisions you made that the user should review
## Route Health Check (MANDATORY)
Before submitting ANY task that modifies backend routers or frontend API calls:
1. Run `bash scripts/check-routes.sh`
2. ALL routes must pass (exit code 0)
3. Include the output in your result.md
4. If any route fails, fix it before submitting

This prevents frontend-backend mismatches from reaching review.

## Tiered Testing (MANDATORY)

### Every task (before submitting to review):
```bash
bash scripts/check-routes.sh        # 10s — catches 404s/500s
cd frontend && npx vitest run --reporter=dot  # 9s — catches component breaks
```
Both must pass. Include output in result.md.

### Screen Regression Rule (MANDATORY):
When modifying ANY frontend screen or component:
1. Run the screen's vitest spec BEFORE and AFTER your changes
2. If no spec exists, create one with at least 5 tests before modifying the screen
3. ALL existing tests must still pass after your changes
4. Test theme compatibility: no hardcoded colors (#fff, #334155, rgba(255,255,255,...))
   - Use CSS variables: var(--color-bg-secondary), var(--color-text-primary), etc.
   - NEVER use `[data-theme="light"] ... !important` overrides
5. Test null safety: no `.length`, `.map()`, `.filter()` on potentially undefined data
   - Use optional chaining: `data?.length ?? 0`
   - Initialize refs with empty arrays: `const items = ref([])`
6. Test API paths: `useTenantApi()` has `baseURL='/api'` — use `api.get('/endpoint')` NOT `api.get('/api/endpoint')`

Command: `cd frontend && npx vitest run tests/unit/screens/<ScreenName>.spec.ts`
Failure = BLOCK. Do not submit to review with failing screen tests.

### PRs to main (automated):
- Unit tests + Button regression + route health + regression E2E
- Runs automatically via .github/workflows/pr-check.yml

### Nightly (automated):
- Full page sweep (35 routes) + functional E2E + backend tests
- Runs at 3 AM UTC via .github/workflows/nightly-sweep.yml
- Failures alert via GitHub Actions notification
