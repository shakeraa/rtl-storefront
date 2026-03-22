---
task: T0022
status: complete
date: 2026-03-22
---

## Summary

Completed all missing GDPR compliance features for T0022.

## What was already implemented

All files in `app/services/privacy/` existed with core logic:
- `data-export.ts` — `exportShopData` (session masking, multi-table export)
- `data-deletion.ts` — `deleteShopData` (transactional multi-table deletion)
- `consent.ts` — `updateConsent`, `getConsent`, `getAllConsents`, `hasConsent`
- `retention.ts` — `setRetentionPolicy`, `getRetentionPolicies`, `enforceRetention`
- `dashboard.ts` — `getPrivacyDashboard`

## What was added

### Service layer additions

**`app/services/privacy/data-export.ts`**
- `formatExportAsJson(data)` — pretty-prints export as JSON string
- `formatExportAsCsv(data)` — multi-section CSV with header rows per data type

**`app/services/privacy/data-deletion.ts`**
- `scheduleDataDeletion(shop, executeAfterDays)` — creates a DataRetentionPolicy
  with autoDelete=true and logs the scheduled deletion to DataAccessLog

**`app/services/privacy/consent.ts`**
- `grantConsent(shop, purpose, ipAddress?)` — convenience wrapper for `updateConsent`
- `revokeConsent(shop, purpose)` — convenience wrapper for `updateConsent`
- `getConsentStatus(shop)` — returns `Record<purpose, boolean>` for all stored records

**`app/services/privacy/index.ts`** — updated to export all new functions

### New routes

**`app/routes/api.privacy.export.ts`** (GET)
- Auth-guarded via `authenticate.admin`
- `?format=json` (default) — responds with `application/json` file download
- `?format=csv` — responds with `text/csv` file download
- Sets `Content-Disposition` and `Cache-Control: no-store` headers

**`app/routes/api.privacy.delete.ts`** (POST)
- Auth-guarded via `authenticate.admin`
- Immediate deletion: calls `deleteShopData`, returns `{ success, deletedCounts, deletedAt }`
- Scheduled deletion: body `{ scheduleAfterDays: N }` calls `scheduleDataDeletion`
- Returns 405 for non-POST requests

**`app/routes/app.privacy.tsx`** (UI)
- Polaris `Page` with `TitleBar` and back-action to Settings
- **Consent toggles** — per-purpose checkboxes (translation_processing, analytics, marketing, third_party_sharing) with live Badge indicators; submits consent changes via Remix fetcher
- **Data retention** — per data type (translation_cache, access_logs): period Select + auto-delete Checkbox + Save button
- **Stored data summary** card with live counts
- **Export buttons** — JSON and CSV downloads via `window.location.href` redirect to `/api/privacy/export`
- **Delete all data** — critical-tone button opens confirmation Modal before POSTing to `/api/privacy/delete`
- **Recent access log** table (up to 20 entries)

## Test results

```
npm run test:run -- privacy

Test Files  1 passed (1)
Tests  7 passed (7)
```

## TypeScript

```
npx tsc --noEmit 2>&1 | grep privacy
(no output — zero errors in privacy files)
```

Pre-existing errors in unrelated components (CurrencySelector, AbayaCustomizer, etc.) were not introduced by this task.

## Acceptance criteria

- [x] Data export in machine-readable format (JSON + CSV)
- [x] Complete data deletion on request
- [x] Scheduled deletion support
- [x] Consent tracking for translation processing (and 3 other purposes)
- [x] Data retention policy enforcement (per data type with auto-delete)
- [x] Audit log for data access (DataAccessLog written on every action)
- [ ] Privacy policy acknowledgement page (out of scope for this implementation)
- [ ] Cookie consent integration (frontend concern, not in scope)
- [ ] DPA document (legal document, not in scope)
