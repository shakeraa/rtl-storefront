# T0392 — Bidirectional Search

## Status: queue
## Priority: high
## Source: product_spec §4.4
## Depends: partial implementation exists (bidi service, tashkeel utils)

## Description

Search that works correctly regardless of text direction, with Arabic/Hebrew normalization and transliteration support.

## What Already Exists

- `app/services/bidi/index.ts` — Unicode BiDi preservation, LRI/RLI/PDI marks, brand name isolation
- `app/services/arabic-features/tashkeel.ts` — diacritics handling, detection, removal

## What's Missing

### Arabic Search Normalization
- Strip diacritics (tashkeel) from search queries
- Normalize hamza variants (أ إ آ ا)
- Handle ta marbuta (ة/ه) equivalence

### Hebrew Search Normalization
- Handle niqqud (vowel marks) removal
- Final letter forms equivalence (ם/מ, ן/נ, ך/כ, ף/פ, ץ/צ)

### Mixed-Language Query Support
- "Nike shoes" and "حذاء Nike" return same results
- RTL autocomplete: suggestions dropdown aligned right, keyboard navigation corrected

### Transliteration Search
- Customer types "nike" in Arabic keyboard (ىهنث) → still finds Nike products
- Arabic-to-Latin and Latin-to-Arabic transliteration mapping

### Additional Features
- Search analytics: track queries by language leading to conversions
- Synonym support: merchant-defined synonyms per language

## Implementation Notes

- New service: `app/services/search/` (search normalization + transliteration engine)
- Extend existing bidi and tashkeel services
- Hook into Shopify Storefront search via theme extension
