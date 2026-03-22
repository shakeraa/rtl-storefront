# T0398 — Fix Settings Persistence

## Status: queue
## Priority: critical

## Problem
`routes/app.settings.tsx:46-50` — action body is an empty comment: "Settings persistence would be implemented here". The entire settings form saves nothing.

## Fix
Add a Settings model to Prisma schema and persist settings via action.
