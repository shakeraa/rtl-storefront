# Task File Format

## Frontmatter

```yaml
---
id: "T0042"
title: "Language Switcher - Flag Icons Library"
priority: high | medium | low
assigned: claude | kimi | codex | unassigned
branch: feature/flag-icons
status: queued | active | in-progress | in-review | done
created: 2026-03-22
depends_on: ["T0010"]
locks: ["app/services/rtl-features/"]
test_command: "npx vitest run test/unit/flags.test.ts"
---
```

## Body

```markdown
## Description
What needs to be done and why.

## Files to modify
- path/to/file.ts — what to change

## Acceptance criteria
- [ ] Specific condition that must pass
- [ ] Another condition
```

## Lifecycle

```
queue/ → active/ → review/ → done/
```

1. Tasks start in `queue/`
2. Dispatcher moves to `active/` and assigns agent
3. Agent implements, tests, writes `result.md`
4. Agent moves task + result to `review/`
5. Claude reviews: approves → `done/` or rejects → back to `active/`

## Rules

- **Claude commits on `main`** — no feature branches for lead architect
- **Other agents use feature branches** — prevents wrong-branch commits
- **File locks are exclusive** — if task A locks a path, task B cannot lock it
- **Dependencies block activation** — task stays in queue until deps are done
- **Result files must include test output** — "manual validation" is not sufficient
- **NEVER recreate task files** that are already in `done/`
