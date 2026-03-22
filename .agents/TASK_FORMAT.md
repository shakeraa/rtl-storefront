# Task File Format

Each task is a markdown file named `NNN-short-description.md`.

## Fields

```markdown
---
id: "001"
title: "Short description"
priority: critical | high | medium | low
assigned: claude | kimi | codex | gemini | unassigned
branch: main | feature/short-description
status: queued | active | in-review | done | rejected
created: 2026-03-18
depends_on: []
locks: []
test_command: ""
---

## Description
What needs to be done and why.

## Files to modify
- path/to/file.py — what to change
- path/to/other.py — what to change

## Acceptance criteria
- [ ] Specific test or condition that must pass
- [ ] Another condition

## Notes
Context, constraints, gotchas.
```

## Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique task ID (zero-padded: "001") |
| `title` | yes | One-line description |
| `priority` | yes | critical > high > medium > low |
| `assigned` | yes | Agent name or "unassigned" |
| `branch` | yes | `main` for direct commits, or `feature/name` for isolation |
| `status` | yes | Current lifecycle state |
| `created` | yes | Date created (YYYY-MM-DD) |
| `depends_on` | no | List of task IDs that must be `done` before this activates |
| `locks` | no | List of file paths this task modifies exclusively — no other active task may list the same file |
| `test_command` | no | Shell command to run after completion. Must exit 0 to pass review. |

## Lifecycle

1. Claude creates task in `queue/`
2. Dispatcher checks `depends_on` — all listed tasks must be in `done/`
3. Dispatcher checks `locks` — no active task may share the same locked file
4. If clear, moves to `active/` and assigns agent
5. Agent works on specified `branch` (always `main` for Claude, feature branch for others)
6. Agent runs `test_command` if specified
7. Agent writes `result.md` with: changes, test output, concerns
8. Agent moves task to `review/`
9. Claude reviews:
   - Reads `result.md`
   - Runs `git diff` on the branch
   - Runs `test_command` if specified
   - Moves to `done/` (approve) or back to `active/` (reject with notes)

## Rules

- **Claude always commits on `main`** — no feature branches for the lead architect
- **Other agents use feature branches** — prevents accidental commits on wrong branch
- **File locks are exclusive** — if task A locks `backend/main.py`, task B cannot lock it until A is done
- **Dependencies block activation** — task stays in `queue/` until all `depends_on` tasks are in `done/`
- **Result files must include actual test output** — "manual validation confirmed" is not sufficient; include the command and its output

## Route Health Gate
Any task that creates/modifies backend routers or frontend API calls MUST include:
```
test_command: "bash scripts/check-routes.sh"
```
This runs 37 route health checks and fails if any return 404/500.
