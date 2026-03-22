# T0390 — Regional Trust Badge Library

status: active
## Priority: medium
## Source: product_spec §3.6

## Description

Display trust indicators that matter to MENA and Israeli customers with a 30+ badge library and geo-targeted display.

## Requirements

### Badge Library
- Halal certified — food, cosmetics, pharmaceuticals
- Kosher certified — Israeli market
- Saudi SASO certified — Saudi Standards, Metrology and Quality Organization
- UAE ESMA certified — Emirates Authority for Standardization and Metrology
- Trusted Store — regional e-commerce trust programs
- Cash on Delivery available — critical trust signal in MENA (40%+ of orders)
- Local return address — "Returns accepted at [local address]"
- Local customer service — "Arabic-speaking support available"
- Secure payment — with local payment method logos
- 20+ additional regional certification badges

### Features
- Drag-and-drop badge placement (product page, cart, checkout, footer)
- Auto-detect applicable badges based on merchant's certifications
- Geo-targeted: show relevant badges per visitor's country
- Custom badge upload for merchant-specific certifications
- Localized badge labels (Arabic/Hebrew)

## Implementation Notes

- New service: `app/services/trust-badges/`
- New route: `app.trust-badges.tsx`
- Badge assets stored in theme extension
- Geo-targeting via existing geolocation service
