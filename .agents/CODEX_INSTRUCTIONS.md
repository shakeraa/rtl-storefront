# Codex — Current Sprint Instructions

## Workflow Rules
- Work on the branch already checked out in your worktree (per `.agents/RULES.md`)
- If no branch is set up, STOP and ask — do NOT create one yourself
- If you're on main, create a branch: `git checkout -b feat/<slug>` or `fix/<slug>`
- Commit on your branch, NOT main
- Move task to `.tasks/review/` when done
- Write `NNN-slug.result.md` in `.tasks/review/` with test output
- Run the `test_command` from the task file and include output in result
- Every backend change MUST have a corresponding test or curl verification
- Every frontend change MUST be visually verified (describe what you see)
- Use `AsyncSession` + `select()` pattern (NEVER `db.query()`)
- Use CSS custom properties for all colors (NEVER hardcoded hex in scoped styles)
- Follow existing patterns in the codebase — read before writing

## Your Assigned Tasks (Phase 1 — Security Hardening):

### Critical (do first):
1. **T500** — Create audit logging HTTP middleware (`backend/middleware/audit.py`)
2. **T501** — Wire audit middleware into `main.py`
3. **T506** — Fix dev bypass env check (`core/dependencies.py:35-42`)
4. **T520** — Create MFA enforcement middleware
5. **T530** — Create EncryptedString SQLAlchemy column type

### High:
6. **T510** — Create SSO router (`routers/sso.py`) wiring existing `sso_integration.py`
7. **T521** — Add MFA setup/verify endpoints
8. **T540** — Add per-tenant rate limiting
9. **T550** — Add session cleanup Celery task
10. **T560** — Add SCIM provisioning endpoints

### Medium:
11. **T570** — Add SBOM generation endpoint
12. **T580** — Add ATT&CK mapping to findings
13. **T590** — Enhance AI Sidekick with NL query support

## API Reference (existing endpoints to use):
- Auth: `POST /api/auth/login`, `GET /api/auth/me`
- Tenants: `GET /api/tenants/current/context`
- Findings: `GET /api/findings`
- Scans: `GET /api/scan-operations/summary`
- Audit model: `models/audit.py` (AuditLog, AuditAction enum)
- SSO service: `integrations/sso_integration.py` (SAML, OIDC, LDAP, WebAuthn, MFA)
- Encryption: `services/encryption_service.py` (AES-256-GCM, key rotation)

## File Lock Awareness:
Check `.tasks/active/` before starting — if another task locks a file you need, coordinate or wait.

## IMPORTANT: Testing Before Review
- Run `test_command` from the task file before moving to review
- Backend: `cd backend && PYTHONPATH=. python3 -m pytest tests/ -v --tb=short`
- Frontend: `cd frontend && npx vitest run`
- Include test output in result.md — "manually verified" is NOT accepted
