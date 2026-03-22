---
id: "T0002"
title: "RTL Specialized - Layout & Directionality Engine"
priority: high
assigned: unassigned
branch: feature/rtl-layout-engine
status: done
created: 2026-03-22
depends_on: []
locks: ["app/utils/rtl.ts", "app/services/rtl-transformer.ts"]
test_command: "npm run test:run -- rtl"
---

## Description
Build comprehensive RTL (Right-to-Left) layout engine that automatically transforms store themes for Arabic, Hebrew, and other RTL languages.

Key differentiator: Component-aware intelligent flipping (not just basic CSS flipping like competitors).

## Files to create/modify
- `app/utils/rtl.ts` - RTL detection utilities (exists, needs expansion)
- `app/services/rtl-transformer.ts` - CSS transformation engine
- `app/services/rtl/component-mapper.ts` - Component-aware flipping logic
- `app/services/rtl/css-generator.ts` - RTL CSS generation
- `public/rtl-themes/` - Pre-built RTL theme templates

## Acceptance criteria
- [ ] Auto RTL detection & switching based on locale
- [ ] CSS `dir="rtl"` injection for all layouts
- [ ] Component-aware RTL flipping (sliders, menus, carousels reverse direction)
- [ ] RTL mega-menus support
- [ ] RTL checkout flow support
- [ ] Custom RTL CSS override fields in admin
- [ ] Mixed LTR+RTL store support
- [ ] Visual regression tests for RTL layouts
