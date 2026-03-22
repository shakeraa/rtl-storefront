---
id: "T0027"
title: "Bulk Import/Export - CSV Format Support"
priority: medium
assigned: claude-sec
branch: feature/bulk-csv
status: done
created: 2026-03-22
depends_on: ["T0017"]
locks: ["app/services/import-export/csv.ts"]
test_command: "npm run test:run -- csv"
---

## Description
Implement CSV bulk import/export for translations, allowing merchants to use spreadsheets for translation management.

## Acceptance criteria
- [ ] CSV export with all translations
- [ ] CSV import with validation
- [ ] Column mapping (locale as columns)
- [ ] Error reporting for failed rows
- [ ] Import preview (dry run)
- [ ] UTF-8 encoding support
- [ ] Excel compatibility
