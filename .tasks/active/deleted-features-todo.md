# Deleted Features — Future Implementation Backlog

> These service directories were deleted during the 2026-03-24 swarm audit because they had zero imports.
> If any are needed, they must be rebuilt with proper route/UI integration.

---

## Category 1: Never-Integrated Features (real code, never wired in)

- [ ] **translation-features/** (23 files) — Unit conversion (dimensions, weight, temperature, measurement), accessibility labels, review queue/comments, cultural review, financial/medical/legal disclaimers, color name localization, confidence thresholds, error prevention, focus indicators, keyboard navigation, language detection, market research, screen reader support, size localization, time format
- [ ] **media-features/** — OCR text-in-image detection, geolocation detection, translation quality scoring, agency partner network, subdomain support, conditional translation rules
- [ ] **product-translation/** — Static translation dictionaries for brands (8), product types (8), tags (9). Data should be migrated into the glossary/translation-memory system if needed

## Category 2: Stubs / Placeholders (minimal or no logic)

- [ ] **admin-features/** — Admin helper utilities
- [ ] **advanced-features/** — Placeholder for advanced feature flags
- [ ] **css-override/** — CSS override utility
- [ ] **draft-translation/** — Draft/staging translation workflow
- [ ] **email-builder/** — Email template builder (note: `email/` service was kept — it IS imported)
- [ ] **filter-labels/** — Translated filter labels for storefront faceted search
- [ ] **input-masks/** — Locale-aware input masks (phone, postal code, IBAN)
- [ ] **native-script/** — Native script rendering utilities
- [ ] **never-translate/** — Never-translate term management (note: glossary now handles this via `getNeverTranslateTerms()`)
- [ ] **plagiarism-check/** — Translation plagiarism/quality checking
- [ ] **quality-score/** — Translation quality scoring
- [ ] **ui-labels/** (7 files) — Static UI label dictionaries for admin interface
- [ ] **visual-editor/** — Visual WYSIWYG translation editor

## Category 3: Speculative / Future Features (code written, no route or UI)

- [ ] **cart-checkout/** — RTL cart and checkout flow customization (requires Shopify checkout extensibility)
- [ ] **checkout-extensions/** — Checkout UI extensions for MENA payments display
- [ ] **customer-account/** — Customer account page translation and RTL layout
- [ ] **heatmap/** — Translation coverage heatmap analytics visualization
- [ ] **integrations/** — Third-party integration framework (CMS, PIM, TMS connectors)
- [ ] **localization/** — General localization utilities (overlapped with existing RTL/translation services)
- [ ] **messaging/** — WhatsApp and SMS notification integration (needs API keys + notification route)
- [ ] **product-variants/** — Product variant translation (size/color/material per locale)
- [ ] **shipping/** — Shipping label and tracking page translation
- [ ] **sort-order/** — Custom sort ordering for RTL storefronts (right-to-left product grids)
- [ ] **storefront-widgets/** — Embeddable storefront widget framework
- [ ] **style-guide/** — Brand style guide enforcement for translations
- [ ] **third-party/** — Third-party service integration framework

---

## Pre-Production Infrastructure

- [x] **Migrate to PostgreSQL** — SQLite is a production blocker. Single-writer lock causes SQLITE_BUSY under concurrent webhooks, file-based storage doesn't persist across containerized deploys, no replication/redundancy. Migration steps: change provider to `postgresql` in schema.prisma, set `DATABASE_URL` to Postgres connection string (Neon/Supabase/PlanetScale free tier), run `npx prisma migrate dev`. Prisma makes this near-trivial since all queries are already ORM-based.

---

## Priority Recommendations

### Implement Next (high business value)
1. **product-variants/** — Core e-commerce need for translated variant options
2. **cart-checkout/** — Critical for MENA checkout conversion
3. **messaging/** — WhatsApp is primary communication channel in MENA markets
4. **shipping/** — Shipping labels/tracking in Arabic needed for local fulfillment

### Implement Later (nice-to-have)
5. **translation-features/** (subset) — Unit/currency/size conversion utilities
6. **heatmap/** — Translation coverage visualization
7. **integrations/** — CMS/PIM connectors for enterprise merchants

### Probably Not Needed
8. **plagiarism-check/** — Niche use case
9. **localization/** — Covered by existing services
10. **style-guide/** — Brand voice service (partial) already exists
