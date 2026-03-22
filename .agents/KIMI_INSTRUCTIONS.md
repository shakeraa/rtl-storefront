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

## Current Active Tasks
Check `.tasks/active/` for tasks assigned to `kimi`.

### Priority:
1. **T1047** (CRITICAL) — Vue Router "No match found" for all new screens — BLOCKS EVERYTHING
2. **T1048** — Fix hardcoded colors in T302, T402, T407
3. **T1041** — QA all 15 new screens
4. **T1043** — Null reference guards
5. **T1046** — Wizard theme regression guard
6. **T1040** — PostExploitation crash
7. **T1042** — CIS Benchmarks route
8. **T1044** — WebSocket notification error
9. **T1045** — Competitor gap analysis
