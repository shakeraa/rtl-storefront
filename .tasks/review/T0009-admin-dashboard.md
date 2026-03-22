---
id: "T0009"
title: "Admin Dashboard - Translation Management UI"
priority: high
assigned: claude-sec
branch: feature/admin-dashboard
status: done
created: 2026-03-22
depends_on: []
locks: ["app/routes/app._index.tsx"]
test_command: "npm run test:run -- admin"
---

## Description
Build comprehensive admin dashboard for managing translations, viewing analytics, and configuring the app.

Dashboard features:
- Translation coverage percentage per language
- Untranslated content alerts
- Visual storefront preview
- AI usage metrics
- Team collaboration tools
- Translation queue status

## Files to create/modify
- `app/routes/app._index.tsx` - Main dashboard (exists, enhance)
- `app/routes/app.translations.tsx` - Translation management
- `app/routes/app.settings.tsx` - App settings
- `app/routes/app.analytics.tsx` - Analytics dashboard
- `app/components/dashboard/` - Dashboard React components
- `app/components/translations/` - Translation editor components

## Acceptance criteria
- [ ] Translation coverage dashboard
- [ ] Language status cards
- [ ] Untranslated content alerts
- [ ] Visual storefront preview
- [ ] AI usage metrics and quotas
- [ ] Translation editor with side-by-side view
- [ ] Bulk operations UI
- [ ] Settings management interface
- [ ] Onboarding wizard for new users
