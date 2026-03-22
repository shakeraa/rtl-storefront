---
id: "T0037"
title: "URL Structure - Subfolder (/ar/, /he/) Support"
priority: high
assigned: claude-sec
branch: feature/url-subfolder
status: active
created: 2026-03-22
depends_on: ["T0007"]
locks: []
test_command: ""
---

## Description
Implement subfolder URL structure for languages (/ar/, /he/, /fr/). Most SEO-friendly option.

## Acceptance criteria
- [ ] /ar/ subfolder routing
- [ ] /he/ subfolder routing
- [ ] Language detection from URL
- [ ] 301 redirects for old URLs
- [ ] Sitemap per language
