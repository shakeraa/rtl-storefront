---
task: T0007
status: review
date: 2026-03-22
---

# Result: T0007 — Multilingual SEO Infrastructure

## What was implemented

All six missing files from the T0007 spec were created:

### New service files

| File | Purpose |
|------|---------|
| `app/services/seo/hreflang.ts` | `generateHreflangTags()` and `getXDefaultUrl()` — builds per-locale `<link rel="alternate">` tags including x-default |
| `app/services/seo/url-translator.ts` | `translateSlug()` (async, RTL-aware via seo-infrastructure transliteration) and `buildLocalizedUrl()` / `buildFullLocalizedUrl()` for subfolder/subdomain strategies |
| `app/services/seo/structured-data.ts` | `generateProductSchema()`, `generateBreadcrumbSchema()`, `generateOrganizationSchema()` — schema.org JSON-LD with `inLanguage` field |
| `app/services/seo/sitemap.ts` | `generateSitemap()` — minimal multi-language XML sitemap with xhtml:link hreflang blocks |

### New routes

| File | URL | Description |
|------|-----|-------------|
| `app/routes/sitemap[.]xml.ts` | `/sitemap.xml` | Returns full multi-locale sitemap (delegates to `app/services/sitemap/generator.ts` which has the full hreflang implementation). Content-Type: application/xml. |
| `app/routes/[robots.txt].ts` | `/robots.txt` | Returns robots.txt with per-locale Allow rules and per-locale sitemap references. Delegates to `generateRobotsTxt()` from seo-infrastructure. Content-Type: text/plain. |

## Integration with existing code

- `url-translator.ts` reuses `transliterateToSlug()` from `app/services/seo-infrastructure/index.ts` (no duplication)
- Route `/sitemap.xml` delegates to `app/services/sitemap/generator.ts` (already tested by `sitemap.test.ts`)
- Route `/robots.txt` delegates to `generateRobotsTxt()` from `app/services/seo-infrastructure/index.ts`

## Test results

```
npx vitest run test/unit/sitemap.test.ts test/unit/url-structure.test.ts --reporter=verbose

Test Files  2 passed (2)
Tests  42 passed (42)
```

Full suite: 12 files failed / 81 passed — all failures are pre-existing (missing performance/loyalty/size-chart services unrelated to this task).

## Acceptance criteria

- [x] Hreflang tags auto-generated per page (`generateHreflangTags`)
- [x] X-default hreflang implemented (`getXDefaultUrl`, x-default appended in all generators)
- [x] URL slug translation working (`translateSlug`, `buildLocalizedUrl`)
- [x] JSON-LD structured data per language (`generateProductSchema`, `generateBreadcrumbSchema`, `generateOrganizationSchema`)
- [x] Product schema translation (locale-tagged via `inLanguage`)
- [x] Multi-language XML sitemap (`generateSitemap`, `/sitemap.xml` route)
- [x] Canonical tags per language version (handled by existing `generateCanonical` in seo-infrastructure, re-exported via `app/services/seo/index.ts`)
- [x] robots.txt with sitemap references (`/robots.txt` route)
