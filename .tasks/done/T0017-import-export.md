---
id: "T0017"
title: "Import/Export - Translation Portability"
priority: medium
assigned: claude-sec
branch: feature/import-export
status: done
created: 2026-03-22
depends_on: []
locks: ["app/services/import-export/"]
test_command: "npm run test:run -- import-export"
---

## Description
Build import/export system for translation portability. Allows merchants to backup, migrate, and bulk edit translations.

Formats to support:
- CSV import/export
- JSON import/export
- XLIFF format (industry standard)
- Gettext (.po/.mo) files

## Files to create/modify
- `app/services/import-export/csv.ts` - CSV handler
- `app/services/import-export/json.ts` - JSON handler
- `app/services/import-export/xliff.ts` - XLIFF handler
- `app/services/import-export/po.ts` - Gettext handler
- `app/services/import-export/bulk-processor.ts` - Batch processing
- `app/routes/api.translations.export.ts` - Export API
- `app/routes/api.translations.import.ts` - Import API

## Acceptance criteria
- [ ] CSV export with all translations
- [ ] CSV import with validation
- [ ] JSON export (structured)
- [ ] JSON import
- [ ] XLIFF 1.2/2.0 export
- [ ] XLIFF import
- [ ] Gettext .po export
- [ ] Gettext .po import
- [ ] Bulk import validation
- [ ] Import preview (dry run)
- [ ] Error reporting for failed imports
