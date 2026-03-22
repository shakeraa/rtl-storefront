# T0402 — Fix GDPR Stubs

## Status: queue
## Priority: significant

## Problem
- `services/gdpr/data-export.ts:22-76` — `createExportPackage` returns hardcoded mock rows
- `services/gdpr/erasure.ts:27-57` — `processErasure` simulates deletes with hardcoded counts
- `services/gdpr/consent.ts:11` — in-memory Map instead of DB

## Fix
Wire to real Prisma queries for data export, deletion, and consent storage.
