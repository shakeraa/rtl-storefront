---
id: "T0019"
title: "Visual In-Context Editor"
priority: medium
assigned: unassigned
branch: feature/visual-editor
status: queue
created: 2026-03-22
depends_on: ["T0009"]
locks: ["app/components/visual-editor/"]
test_command: "npm run test:run -- visual-editor"
---

## Description
Build visual in-context editing interface allowing translators to edit content directly on the storefront preview, similar to Weglot/Transcy.

Features:
- Storefront preview with overlay
- Click-to-edit translation
- Side-by-side source/target
- Live preview of changes
- Mobile preview mode

## Files to create/modify
- `app/components/visual-editor/` - React components
- `app/components/visual-editor/Preview.tsx` - Storefront preview
- `app/components/visual-editor/Overlay.tsx` - Click-to-edit overlay
- `app/components/visual-editor/Sidebar.tsx` - Translation sidebar
- `app/routes/app.visual-editor.tsx` - Visual editor page
- `app/services/visual-editor/preview-generator.ts` - Preview service

## Acceptance criteria
- [ ] Storefront preview iframe
- [ ] Click-to-edit overlay
- [ ] Element highlighting on hover
- [ ] Side-by-side translation panel
- [ ] Live preview of changes
- [ ] Mobile/tablet preview modes
- [ ] Auto-save drafts
- [ ] Navigation within preview
- [ ] Multi-language preview switcher
- [ ] SEO metadata editing in context
