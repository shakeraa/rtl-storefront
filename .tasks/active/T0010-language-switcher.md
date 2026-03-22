---
id: "T0010"
title: "Language Switcher - Storefront Widget"
priority: high
assigned: claude-sec
branch: feature/language-switcher
status: active
created: 2026-03-22
depends_on: []
locks: ["extensions/language-switcher/"]
test_command: "npm run test:run -- language-switcher"
---

## Description
Build customizable language switcher widget for storefront with multiple display styles and geolocation detection.

Switchers to implement:
- Floating switcher widget
- Inline switcher
- Dropdown switcher
- Modal switcher
- Flag icons (emoji + custom)
- Native script display (العربية, עברית)

## Files to create/modify
- `extensions/language-switcher/` - Shopify theme app extension
- `extensions/language-switcher/blocks/switcher.liquid`
- `extensions/language-switcher/assets/switcher.css`
- `extensions/language-switcher/assets/switcher.js`
- `app/services/language/detection.ts` - Language detection service
- `app/services/language/geolocation.ts` - Geo-detection

## Acceptance criteria
- [ ] Floating language switcher
- [ ] Inline switcher option
- [ ] Dropdown switcher style
- [ ] Modal switcher style
- [ ] Flag icons (emoji and custom)
- [ ] Native script display
- [ ] Country-specific variants (US vs UK)
- [ ] Geolocation auto-detection
- [ ] Returning visitor language memory
- [ ] Mobile-optimized switcher
