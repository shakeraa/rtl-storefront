# T0388 — Modest Fashion AI Auto-Tagging & Intelligence

status: done
## Priority: medium
## Source: product_spec §3.4
## Depends: partial implementation exists (fashion-db, ModestySelector, AbayaCustomizer)

## Description

Add AI-powered modesty auto-tagging, collection generation, and recommendation features on top of existing fashion database and UI components.

## What Already Exists

- `app/services/fashion-db/index.ts` — 80+ modesty fashion terms
- `app/services/sensitivity/index.ts` — modesty content flagging (mod-01 to mod-07)
- `app/components/fashion/ModestySelector.tsx`
- `app/components/fashion/AbayaCustomizer.tsx`

## What's Missing

### AI Auto-Tagging
- AI scans product images and descriptions to tag modesty attributes:
  - Full coverage / Partial coverage / Not modest
  - Hijab-friendly / Abaya-compatible / Loose fit
  - Opaque / Sheer / Lined
- Bulk scan entire catalog

### Modest Fashion Collections
- Auto-generate "Modest Fashion" collection from tagged products
- Cultural product recommendations ("Customers in Saudi Arabia also viewed" — modesty-filtered)

### Seasonal Intelligence
- Ramadan = surge in modest fashion demand → auto-promote tagged products
- Layering suggestions: AI recommends complementary modest pieces

### Merchant Controls
- Review and override AI modesty tags
- Set modesty standards per market (what counts as "modest" varies by region)
- Exclude/include categories from modest tagging

## Implementation Notes

- Extend existing `app/services/fashion-db/` with auto-tagging engine
- New service: `app/services/modest-fashion/`
- Use Claude API vision for image-based modesty classification
