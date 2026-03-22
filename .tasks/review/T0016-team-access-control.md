---
id: "T0016"
title: "Team & Access Control - Role-Based Permissions"
priority: medium
assigned: claude
branch: feature/team-access
status: active
created: 2026-03-22
depends_on: []
locks: ["app/services/auth/roles.ts"]
test_command: "npm run test:run -- access-control"
---

## Description
Implement role-based access control for team collaboration. Allow merchants to invite team members with different permission levels.

Roles to support:
- Admin (full access)
- Translator (translation only)
- Manager (view + assign)
- Viewer (read-only)

## Files to create/modify
- `app/services/auth/roles.ts` - Role definitions and checks
- `app/services/team/invites.ts` - Team invitation system
- `app/routes/app.team.tsx` - Team management UI
- `app/routes/api.team.invites.ts` - Invitation API
- `prisma/schema.prisma` - TeamMember, Invite models

## Acceptance criteria
- [ ] Role-based access control (RBAC)
- [ ] Admin role with full permissions
- [ ] Translator role (translation only)
- [ ] Manager role (view + assign tasks)
- [ ] Viewer role (read-only)
- [ ] Team member invitation system
- [ ] Invite acceptance flow
- [ ] Role assignment UI
- [ ] Activity audit log
- [ ] API key management per role
