# Code Review Issues — 2026-03-18

Issues found during code review of your previous session's work.
Fix these before starting any new feature work.

## CRITICAL — Security

### 1. SAML signature validation was incomplete (FIXED)
- `sso_integration.py:process_saml_response` was parsing XML without verifying the signature
- Now uses `signxml.XMLVerifier` — do NOT remove or bypass this
- `SAML_ALLOW_UNSIGNED_RESPONSES=true` is for dev only — never set in production

### 2. LDAP injection vulnerability (FIXED)
- User input was interpolated directly into LDAP filters: `f"(sAMAccountName={username})"`
- Now uses `ldap3.utils.conv.escape_filter_chars()` — always escape user input in LDAP filters

### 3. No role validation on org member create/update (FIXED)
- `OrganizationMemberCreate` and `OrganizationMemberUpdate` accepted arbitrary role strings
- Now validated against `VALID_ORG_ROLES = {"owner", "admin", "member", "viewer"}`

## IMPORTANT — Authorization

### 4. Cross-tenant isolation gaps (FIXED)
- `organizations.py`: ADMIN users could create orgs in any tenant
- `teams.py`: ADMIN users could create teams in orgs belonging to other tenants
- Both now check `user_org.tenant_id == target_tenant_id` for non-super-admins

## IMPORTANT — Frontend

### 5. AdminSettings.vue used bare `fetch()` without auth headers (FIXED)
- All 22 API calls were unauthenticated — only worked with dev bypass
- Now uses `authFetch()` wrapper that injects `Authorization: Bearer` header

### 6. Silent mock data fallback hides real errors (FIXED)
- When API calls failed, UI showed fake users/teams instead of error messages
- Removed mock fallbacks — errors now surface to the user

### 7. TeamManagement update emit sent only ID, no payload (FIXED)
- `emit('update', team.id)` was missing the update data
- Now emits `emit('update', team.id, { name, description })`

## IMPORTANT — Async/Performance

### 8. Synchronous LDAP calls in async functions (FIXED)
- `ldap3` operations are blocking — they were blocking the event loop
- Now wrapped with `asyncio.to_thread()`

### 9. No depth limit on nested LDAP group resolution (FIXED)
- Could loop infinitely on circular AD group memberships
- Now capped at `max_depth=10` iterations
