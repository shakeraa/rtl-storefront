---
id: "T0022"
title: "GDPR Compliance & Data Privacy"
priority: high
assigned: claude-sec
branch: feature/gdpr
status: done
created: 2026-03-22
depends_on: []
locks: ["app/services/privacy/"]
test_command: "npm run test:run -- privacy"
---

## Description
Implement GDPR compliance features including data export, deletion, and consent management.

Features:
- Right to data export
- Right to erasure (delete all data)
- Data retention policies
- Consent tracking
- Privacy policy integration

## Files to create/modify
- `app/services/privacy/data-export.ts` - GDPR export
- `app/services/privacy/data-deletion.ts` - Right to erasure
- `app/services/privacy/consent.ts` - Consent management
- `app/routes/api.privacy.export.ts` - Export API
- `app/routes/api.privacy.delete.ts` - Delete API
- `app/routes/app.privacy.tsx` - Privacy settings UI

## Acceptance criteria
- [ ] Data export in machine-readable format (JSON)
- [ ] Complete data deletion on request
- [ ] Consent tracking for translation processing
- [ ] Data retention policy enforcement
- [ ] Privacy policy acknowledgement
- [ ] Cookie consent integration
- [ ] Anonymization option
- [ ] Audit log for data access
- [ ] DPA (Data Processing Agreement) document
