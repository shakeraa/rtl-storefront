# Kimi — Agent Instructions

## CRITICAL WORKFLOW RULES

### 1. Separate Workspace Per Task
- Every task gets its OWN branch
- `git checkout -b fix/<task-id>-<slug>` or `feat/<task-id>-<slug>` BEFORE writing any code
- **NEVER work on `main` branch directly**
- **NEVER commit to `main`** — only Claude (lead architect) commits to main

### 2. Branch Discipline
- One branch per task: e.g. `fix/T1047-device-posture-blank`
- Commit on YOUR branch only
- Push your branch when done
- If you use sub-agents, each sub-agent works on the SAME branch as the parent task

### 3. When Done — Move to Review, DO NOT MERGE
- Write `result.md` with: changes summary, files modified, test output
- Move task file + result.md to `.tasks/review/`
- **DO NOT merge to main** — only Claude reviews and merges
- **DO NOT run `git merge`** — only Claude does merges
- **DO NOT run `git checkout main`** — stay on your branch

### 4. Only Claude Commits to Main
- Claude reviews your branch
- Claude merges/cherry-picks to main
- Claude moves task from review to done
- If Claude rejects: fix on your branch, resubmit to review

## Testing (MANDATORY before review)
1. Run the task's `test_command` if specified
2. Backend: `cd backend && PYTHONPATH=. python3 -m pytest tests/ -v --tb=short`
3. Frontend: `cd frontend && npx vitest run --reporter=verbose`
4. Route health: `bash scripts/check-routes.sh`
5. **Screen regression**: run vitest spec BEFORE and AFTER changes

## Screen Development Rules
- `<script setup lang="ts">` with Composition API
- `useTenantApi()` returns AxiosInstance with `baseURL='/api'`
  - CORRECT: `api.get('/device-updates')`
  - WRONG: `api.get('/api/device-updates')` ← double /api!
- `<style scoped>` with CSS variables — NEVER hardcode colors
  - CORRECT: `var(--color-bg-secondary)`
  - WRONG: `#ffffff`, `rgba(255,255,255,0.04)`, `[data-theme="light"] !important`
- Guard data: `data?.length ?? 0`, `v-if="data"`, `ref([])`
- Every screen needs loading, error, and empty states

## Test Quality Rules
- NO `expect(x || true).toBe(true)` — always passes, forbidden
- NO early returns that skip assertions
- NO fake inline components — import the REAL screen
- Assert specific values, not just `.toBeTruthy()`

## REJECTED WORK — READ BEFORE STARTING

### DO NOT create stub implementations
Your branches `feature/batch-core-services` and `feature/batch1-content-translation` were **REJECTED** for these reasons:

1. **NO STUBS** — Every method must have real logic, not `return "[ar] " + text` or hardcoded mock data. If a method needs an external API, implement the structure with proper error handling and mark the API call with a `// TODO: wire to Shopify API` comment — but the surrounding logic must be real.

2. **NO DUPLICATING existing services** — Before creating a new service, check what exists on main:
   - `app/services/product-variants/` — already handles option/variant translation
   - `app/services/language-switcher/` — already has SUPPORTED_LANGUAGES
   - `app/services/fashion-db/` — already has 60+ fashion terms
   - `app/services/translation/` — already has the translation engine with AI providers
   - `app/services/translation-memory/` — already has TM and glossary
   Read the existing code BEFORE writing new code.

3. **USE existing translation infrastructure** — Import from `app/services/translation/engine.ts` for actual translations. Do NOT create parallel translation systems.

4. **Tests must verify real behavior** — `expect(result).toContain('[ar]')` tests nothing. Test actual logic: correct field mapping, error handling, edge cases.

5. **One branch per task** — Do NOT batch 40 tasks into one branch. One task = one branch = one review.

## Current Active Tasks
Check `.tasks/active/` for tasks assigned to `kimi`.
