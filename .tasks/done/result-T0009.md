---
task: T0009
status: review
date: 2026-03-22
branch: feature/T0203-mailchimp-final
---

## What was implemented

### Routes created

**`app/routes/app.translations.tsx`**
- Translation management page listing all translatable resources (products, collections, pages, blogs)
- Coverage cards for all 4 configured languages (Arabic, Hebrew, Farsi, French) with ProgressBar
- Banner alert when untranslated/partial content exists
- Filters by resource type and status; search by title
- Language selector to view coverage per language
- Integrates `TranslationList` component with bulk-translate support
- Uses `authenticate.admin(request)` in loader

**`app/routes/app.settings.tsx`**
- Full app settings page with AI provider selection (OpenAI, DeepL, Google Translate)
- Provider status badges showing configured/not-configured state
- API key field (password type) with inline connection test
- Language configuration: source locale + target locale checkboxes with RTL badges
- RTL preferences: auto-detect toggle, font selectors for Arabic/Hebrew/Farsi
- Translation memory settings: enable/disable, fuzzy threshold, auto-suggest
- Quality control: human review workflow toggle, confidence threshold
- Uses `authenticate.admin(request)` in both loader and action

### Components created

**`app/components/translations/TranslationStatus.tsx`**
- Reusable Badge component mapping status strings to Polaris tones
- Supports: `translated` (success), `partial` (warning), `untranslated` (critical), `pending` (info)

**`app/components/translations/TranslationList.tsx`**
- IndexTable-based list with columns: Content, Type, Source Language, Status, Last Updated, Actions
- Uses `TranslationStatus` component for status badges
- Supports `onTranslate` (per-item) and `onBulkTranslate` (promoted bulk action)
- `useIndexResourceState` for selection management

**`app/components/translations/TranslationEditor.tsx`**
- Side-by-side source/target editor
- RTL direction detection for both source and target panes
- Save status badge (idle/unsaved/saving/saved/error)
- Optional target locale selector and auto-translate button
- Per-field `TextField` with `dir` attribute applied via wrapper div

## Test output

```
npm run build
✓ 1469 modules transformed.
✓ built in 1.72s
✓ 70 modules transformed.
✓ built in 224ms
```

Build passes with zero errors. The only warnings are pre-existing CSS syntax warnings from Polaris (not from our files).
