---
id: "T0006"
title: "RTL-First Fashion Design - Pre-built Theme Sections"
priority: medium
assigned: kimi
branch: feature/rtl-fashion-sections
status: active
created: 2026-03-22
depends_on: ["T0002"]
locks: ["extensions/rtl-fashion-sections/"]
test_command: "npm run test:run -- fashion-sections"
---

## Description
Create pre-built RTL-optimized fashion theme sections for modesty wear. This is a KEY DIFFERENTIATOR - no competitor offers fashion-specific RTL design.

Sections to build:
- Fashion-specific RTL theme sections
- Modesty wear layouts
- Right-aligned product galleries
- Mixed Arabic+English product cards
- Arabic calligraphy integration
- Islamic geometric patterns

## Files to create/modify
- `extensions/rtl-fashion-sections/` - Shopify theme app extension
- `extensions/rtl-fashion-sections/blocks/modesty-hero.liquid`
- `extensions/rtl-fashion-sections/blocks/abaya-gallery.liquid`
- `extensions/rtl-fashion-sections/blocks/hijab-grid.liquid`
- `extensions/rtl-fashion-sections/assets/rtl-fashion.css`
- `app/services/fashion-sections/preview.ts` - Section preview generator

## Acceptance criteria
- [ ] Modesty wear hero section
- [ ] Abaya product gallery (RTL optimized)
- [ ] Hijab product grid
- [ ] Kaftan lookbook section
- [ ] Mixed Arabic+English product cards
- [ ] Arabic calligraphy typography support
- [ ] Islamic geometric pattern backgrounds
- [ ] Size guide for MENA regions
- [ ] Color naming in Arabic context
