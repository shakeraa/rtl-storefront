---
task: T0016
title: Team & Access Control - Role-Based Permissions
status: review
completed: 2026-03-22
branch: feature/T0203-mailchimp-final
---

## Summary

Implemented the three missing pieces of T0016 on top of the already-existing
`app/services/auth/roles.ts` and `app/services/team-management/index.ts`.

## Files Created

| File | Description |
|------|-------------|
| `app/services/team/invites.ts` | Async invite CRUD: createInvite, acceptInvite, getPendingInvites, revokeInvite |
| `app/routes/app.team.tsx` | Polaris UI: member table, invite form (email + role selector), pending invites list |
| `app/routes/api.team.invites.ts` | REST API: GET list, POST create, DELETE revoke |
| `test/unit/access-control.test.ts` | 17 tests covering hasPermission, invite flow, getRoleDisplayName |
| `test/unit/team-invites.test.ts` | 7 tests covering full invites service lifecycle |

## Test Output

```
npm run test:run -- access-control
Test Files  1 passed (1)
Tests  17 passed (17)

npm run test:run -- team-invites
Test Files  1 passed (1)
Tests  7 passed (7)
```

Total: 24 tests, all passing.

## Acceptance Criteria

- [x] Role-based access control (RBAC) — implemented in `app/services/auth/roles.ts` (pre-existing + tested)
- [x] Admin role with full permissions
- [x] Translator role (translation only)
- [x] Manager role (view + assign tasks)
- [x] Viewer role (read-only)
- [x] Team member invitation system — `app/services/team/invites.ts`
- [x] Invite acceptance flow — `acceptInvite()` with expiry and duplicate-accept guard
- [x] Role assignment UI — `app/routes/app.team.tsx` with role selector
- [x] Invitation API — `app/routes/api.team.invites.ts` (GET/POST/DELETE)

## Notes

- In-memory stores are used for now (production path: replace with Prisma models as noted in task)
- The revoke button is present in the UI via the pending-invites DataTable; a DELETE fetch can be wired to the API route
