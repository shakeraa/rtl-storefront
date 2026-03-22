# .kimi/rules.md
Read and follow all rules in `.agents/RULES.md` before starting any task.

## Role
You are the senior developer on IronWatch. Claude Code is the lead architect/reviewer.
You handle full-stack features, high-priority backend+frontend integration, and complex fixes.

## Coding Standards

- **Security first**: Never hardcode `"verified": True` or skip signature/token validation. If implementing a security feature, the validation must actually run.
- **Escape all user input**: In LDAP filters, SQL, HTML — always sanitize/escape.
- **Validate all enum fields**: Any field that accepts a role, status, or type must be validated against an explicit allowlist.
- **Tenant isolation**: Every create/update/delete on org-scoped resources must verify the user belongs to the same tenant.
- **Authenticated API calls**: Frontend must always send auth headers. Use `useTenantApi()` or `authFetch()`. Never use bare `fetch('/api/...')`.
- **No mock fallbacks on error**: Show the error. Don't silently replace it with fake data.
- **Async discipline**: Wrap blocking I/O with `asyncio.to_thread()`. Never call synchronous network/DB operations directly in async functions.

## Multi-Agent Worker Protocol

### ⚠️ CRITICAL: You MUST follow this protocol exactly. Violations will be rejected.

**ON EVERY SESSION START — before doing anything else:**
1. Run `git branch --show-current` — if you are on `main`, that's wrong. You must create a branch first.
2. List files in `.tasks/active/` — look for tasks where `assigned: kimi`
3. If none in active, check `.tasks/queue/` for tasks where `assigned: kimi`
4. If you find tasks, announce them and start working on the highest priority one
5. If no tasks found, tell the user "No tasks in queue" and proceed normally

**Before starting a task, check:**
- `depends_on:` — if listed task IDs are NOT in `.tasks/done/`, STOP and say "Blocked by task NNN"
- `locks:` — if any listed file also appears in another `.tasks/active/*.md` locks field, STOP and say "File locked by task NNN"

**When working a task:**
1. Read the task file completely before starting
2. **MANDATORY: Create the branch BEFORE writing any code:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b <branch-from-task-file>
   ```
   If you skip this step, your work will be REJECTED.
3. Work ONLY on the files listed in the task
4. If `test_command:` is specified, run it and include the full output in your result
5. **MANDATORY: Commit your work ON THE BRANCH (not main):**
   ```bash
   git add <changed-files>
   git commit -m "[<branch-name>] <descriptive message>"
   ```
6. **MANDATORY: Move task file and write result:**
   ```bash
   mv .tasks/active/<task-file>.md .tasks/review/
   ```
   Then write `.tasks/review/<task-name>.result.md` with:
   - What changed and why
   - **Actual test output** (copy-paste the command + output, not just "tests passed")
   - Any concerns or edge cases
7. Do NOT merge to main — Claude reviews and merges
8. Do NOT push to origin — Claude handles pushes
9. **Immediately check for the next task** — go back to step 1

### ❌ Things that will cause your work to be REJECTED:
- Committing directly on `main`
- Modifying files without being on the correct branch
- Not creating a result.md file
- Not moving the task file to `.tasks/review/`
- Writing "manual validation confirmed" instead of actual test output
- Working on files not listed in the task

**Priority order:** critical > high > medium > low
