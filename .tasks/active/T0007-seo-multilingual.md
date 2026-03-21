---
id: "T0007"
title: "SEO & Discoverability - Multilingual SEO Infrastructure"
priority: high
assigned: unassigned
branch: feature/multilingual-seo
status: active
created: 2026-03-22
depends_on: []
locks: ["app/services/seo/"]
test_command: "npm run test:run -- seo"
---

## Description
Implement comprehensive multilingual SEO infrastructure including hreflang, translated URLs, and structured data for all language versions.

Features:
- Subfolder (/ar/, /he/) vs Subdomain support
- Translated URL handles/slugs
- Hreflang automation with X-default
- JSON-LD structured data translation
- Meta titles/descriptions translation
- Multilingual sitemaps

## Files to create/modify
- `app/services/seo/hreflang.ts` - Hreflang tag generation
- `app/services/seo/url-translator.ts` - URL slug translation
- `app/services/seo/structured-data.ts` - JSON-LD translation
- `app/services/seo/sitemap.ts` - Multi-language sitemap
- `app/routes/[robots.txt].ts` - Robots.txt per language
- `app/routes/sitemap[.]xml.ts` - Sitemap generation

## Acceptance criteria
- [ ] Hreflang tags auto-generated per page
- [ ] X-default hreflang implemented
- [ ] URL slug translation working
- [ ] Meta title/description translation
- [ ] JSON-LD structured data per language
- [ ] Product schema translation
- [ ] Multi-language XML sitemap
- [ ] Canonical tags per language version
- [ ] SEO audit dashboard in admin
