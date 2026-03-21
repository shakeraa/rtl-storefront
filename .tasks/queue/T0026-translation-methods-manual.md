---
id: "T0026"
title: "Translation Methods - Manual Entry & Side-by-Side Editor"
priority: medium
assigned: unassigned
branch: feature/translation-manual
status: queue
created: 2026-03-22
depends_on: ["T0009"]
locks: ["app/components/translation-editor/"]
test_command: "npm run test:run -- manual-translation"
---

## Description
Implement manual text entry with side-by-side comparison for human translators who want full control over translations.

## Features
- Side-by-side source/target editor
- Rich text/WYSIWYG preservation
- HTML tag preservation
- Draft translation workflow
- Translation suggestions from AI

## Files to create/modify
- `app/components/translation-editor/SideBySideEditor.tsx`
- `app/components/translation-editor/RichTextEditor.tsx`
- `app/routes/app.translations.manual.tsx`

## Acceptance criteria
- [ ] Side-by-side source/target view
- [ ] Rich text editing preserved
- [ ] HTML tag visualization
- [ ] Draft save functionality
- [ ] AI suggestions panel
- [ ] Character count display
