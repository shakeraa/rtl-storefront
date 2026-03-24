# Master Codebase + UI Audit Report

**Project:** rtl-storefront — Shopify Remix Embedded App for RTL Translation & MENA Localization
**Date:** 2026-03-24
**Swarm ID:** `swarm-1774309654378-vhkr9y`
**Agents:** 10 (3 Opus + 7 Sonnet) | Star topology | Divide-and-conquer
**Auditors:** architect, route-reviewer, component-reviewer, translation-engine, payments-reviewer, content-services, security-auditor, data-layer, test-coverage, regional-features

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Critical issues** | 19 |
| **High issues** | 38 |
| **Medium issues** | 52 |
| **Low issues** | 31 |
| **Total issues** | **140** |
| Services total | 96 directories |
| Services with real imports | 29 (30%) |
| Dead services (zero imports) | 67 (70%) |
| Stub/placeholder services | 12+ |
| Real implementations | ~29 active + ~14 regional |
| Routes total | 54 (CLAUDE.md says 26) |
| Routes with zero test coverage | 32 of 54 |
| Test files | 121 (4,489 test cases) |
| Estimated real code coverage | **~45-55%** (broad but shallow) |
| **Production-readiness score** | **3/10** |

### Why 3/10

The core translation engine and 7 AI providers are well-implemented. Payment gateways exist for all 11 providers. However: 70% of services are dead code, security infrastructure is entirely unwired, GDPR has cross-tenant data destruction bugs, API keys are stored in plaintext, the database is hardcoded to `dev.sqlite`, there are zero real E2E tests, and critical features (Translation Memory, glossary, formatting preservation) are built but never connected to the pipeline.

---

## PART A: UI Validation Results

> **Note:** UI findings below are derived from static code analysis of route and component files.

### Route-Level UI Issues

| Screen/Route | Status | Issues Found |
|---|---|---|
| `app._index.tsx` | WARN | No empty state for new installs; no ErrorBoundary |
| `app.billing.tsx` | **FAIL** | Reflected XSS risk: `error` query param decoded and rendered (line 170) |
| `app.billing.confirm.tsx` | PASS | Handles failed payments correctly; has idempotency check |
| `app.onboarding.tsx` | **FAIL** | State stored in in-memory Map — lost on every restart/deploy |
| `app.rtl-settings.tsx` | **FAIL** | Save Settings button is a no-op — only shows toast, never persists |
| `app.payments.tsx` | **FAIL** | Save/Test buttons do nothing; only 5 of 9+ gateways shown in UI |
| `app.translate.blog.$resourceId.tsx` | **FAIL** | GraphQL injection: user-controlled locale interpolated into query string |
| `app.translate.$resourceId.tsx` | WARN | `JSON.parse` without try-catch — crashes on malformed input |
| `app.translate.collection.$resourceId.tsx` | WARN | Same `JSON.parse` issue |
| `app.translate.page.$resourceId.tsx` | WARN | Same `JSON.parse` issue |
| `app.bulk-translate.tsx` | WARN | Same `JSON.parse` issue |
| `app.notifications.tsx` | WARN | Same `JSON.parse` issue |
| `app.import.tsx` | **FAIL** | Import is simulated client-side only — data never actually saved |
| `app.additional.tsx` | WARN | CSS override accepts arbitrary input |
| `app.glossary.tsx` | WARN | `sourceTerm` not validated for empty string |
| `app.settings.tsx` | WARN | `parseInt` without NaN check |
| `app.internal.billing.tsx` | WARN | `parseInt` without NaN check |
| All other routes | WARN | 48 of 52 routes missing ErrorBoundary |

### Component-Level UI Issues

| Component | Status | Key Issues |
|---|---|---|
| FontPreview | **FAIL** | Deprecated Polaris v11 `Stack`; hardcoded English strings |
| CurrencySelector | **FAIL** | Deprecated `Stack` + `color="subdued"` (should be `tone`) |
| HijriDateDisplay | **FAIL** | Deprecated `Stack` + `color="subdued"` |
| SizeGuide | **FAIL** | Deprecated `Stack` + `color="subdued"`; missing `autoComplete` on TextFields |
| ModestySelector | **FAIL** | Deprecated `Stack` + `Card.Section` (removed in v12) |
| AbayaCustomizer | **FAIL** | Deprecated `Stack` + `Card.Section`; **stale closure bug** — totalPrice in onChange reflects previous render |
| TranslationCoverage | **FAIL** | Deprecated `Stack` + `Card.Section` |
| SeasonalBanner | **FAIL** | Passes `style` prop to Polaris `Banner` (silently dropped); hardcoded physical textAlign |
| DraggableList | **FAIL** | Zero keyboard accessibility; no ARIA attributes for drag-and-drop |
| BreadcrumbNav | WARN | Uses raw `<a>` tag (violates project convention) |
| VirtualTranslationList | WARN | Hardcoded `left: 0`; no ARIA on scrollable container |
| TranslationEditor | WARN | No overflow handling for long Arabic text; hardcoded English |
| SideBySide | WARN | No overflow handling for long Arabic text |
| **30+ components** | WARN | Hardcoded English strings needing localization |
| **5 files** | WARN | Duplicated `isRtlLocale`/`RTL_LOCALES` utility |

---

## PART B: Critical Code Issues (Must Fix Before Shipping)

### SEC — Security Critical

| # | ID | File | Description | Fix | Effort |
|---|---|---|---|---|---|
| 1 | SEC-001 | `prisma/schema.prisma:295-306` | **API keys stored as plaintext in SQLite** — 8 third-party keys readable by anyone with file access | Implement AES-256-GCM encryption at application layer | M |
| 2 | SEC-003 | All 9 files in `app/services/payments/mena/` | **Webhook HMAC uses `===` not `timingSafeEqual`** — timing attack on payment webhooks | Replace with `crypto.timingSafeEqual()` in all 9 gateways | S |
| 3 | SEC-004 | `app/services/gdpr/erasure.ts:35`, `privacy/data-deletion.ts:31` | **GDPR erasure deletes ALL shops' TranslationCache** — `deleteMany({})` with no where filter | Add `shop` column to TranslationCache; filter by shop | M |
| 4 | SEC-005 | `app/services/privacy/data-export.ts:38` | **GDPR data export leaks cross-tenant data** | Same fix: add `shop` column, filter by requesting shop | M |
| 5 | SEC-006 | `app/services/gdpr/erasure.ts` | **GDPR erasure only covers 5 of 15 models** — Article 17 compliance gap | Extend erasure to all shop-scoped tables | M |

### INJ — Injection / XSS

| # | ID | File | Description | Fix | Effort |
|---|---|---|---|---|---|
| 6 | INJ-001 | `app/routes/app.translate.blog.$resourceId.tsx:22` | **GraphQL injection** — user-controlled locale interpolated into query string | Use GraphQL variable `$locale` like all other translate routes | S |
| 7 | INJ-002 | `app/routes/app.billing.tsx:170` | **Reflected XSS risk** — error query param decoded and rendered | Validate against allowlist of known error codes | S |

### DATA — Data Integrity Critical

| # | ID | File | Description | Fix | Effort |
|---|---|---|---|---|---|
| 8 | DATA-001 | `prisma/schema.prisma:13` | **Database URL hardcoded to `file:dev.sqlite`** — production uses dev filename | Change to `url = env("DATABASE_URL")` | S |
| 9 | DATA-002 | `app/services/currency/exchange.ts:93-129` | **Currency exchange is entirely mocked** — hardcoded rates, fake history, missing DB model | Integrate real exchange rate API; add ExchangeRate model | L |
| 10 | DATA-003 | `app/services/payments/mena/payfort.ts:173` | **PayFort webhook uses wrong SHA passphrase** (request vs response phrase) | Use `config.webhookSecret` (response phrase) | S |
| 11 | DATA-004 | `app/services/payments/mena/payfort.ts:70` | **PayFort amount broken for 3-decimal currencies** — ×100 but KWD/BHD/OMR need ×1000 | Use currency-aware minor-unit conversion | S |
| 12 | DATA-005 | 5 gateways: tamara, mada, hyperpay, payfort, network-intl | **Refund currency hardcoded** (SAR or AED) instead of original transaction currency | Store and use original transaction currency | M |

### PIPE — Pipeline Critical

| # | ID | File | Description | Fix | Effort |
|---|---|---|---|---|---|
| 13 | PIPE-001 | `app/services/translation/engine.ts:62` | **Translation Memory never queried** — every request hits paid APIs for identical text | Wire TM findExact()/findFuzzy() before provider chain | M |
| 14 | PIPE-002 | `app/services/translation/engine.ts:62` | **Glossary enforcement is a no-op** — accepted but never applied | Call findTerms(), inject into prompts, protect neverTranslate | M |
| 15 | PIPE-003 | `app/services/translation/engine.ts:62` | **Formatting preservation not wired** — HTML/URLs/emails sent raw to providers | Wrap pipeline: preserve, translate, restore. Add Liquid support | M |
| 16 | PIPE-004 | `app/services/meta-tags/translator.ts` | **Meta tags never output `dir="rtl"` or `lang="ar"`** | Add dir/lang attributes to generated HTML | S |

### ARCH — Architecture Critical

| # | ID | File | Description | Fix | Effort |
|---|---|---|---|---|---|
| 17 | ARCH-001 | `app/services/` (67 dirs) | **70% dead code** — 67 of 96 service dirs have zero imports | Delete or archive; reduce to ~15-20 modules | L |
| 18 | ARCH-002 | `app/services/security/` (10 files) | **Security middleware entirely unwired** — CSP/CSRF/XSS/rate-limiting imported nowhere | Wire into route middleware or entry.server.ts | M |
| 19 | ARCH-003 | `app/routes/api.payments.mena.$.ts:83` | **Payment webhook handler is a TODO stub** — never updates Shopify orders | Implement order status update + idempotency | M |

---

## PART C: High Priority (Fix Within 1 Sprint)

### Security High

| # | File | Description | Fix | Effort |
|---|---|---|---|---|
| 20 | `app/services/security/csp.ts:24` | `unsafe-inline` in style-src CSP | Use nonce-based style loading | M |
| 21 | `app/services/auth/roles.ts:231` | Team API keys predictable: `base64(memberId_timestamp)` | Use `crypto.randomBytes(32)` | S |
| 22 | `app/services/auth/roles.ts:243` | API key validation linear scan with `===` | Hash keys; look up by hash; timingSafeEqual | M |
| 23 | `app/shopify.server.ts` | `expiringOfflineAccessTokens` NOT enabled despite docs | Add to future config | S |
| 24 | `app/services/security/*` | All security state in-memory only — lost on restart | Persist to SQLite or Redis | M |

### Database High

| # | File | Description | Fix | Effort |
|---|---|---|---|---|
| 25 | `prisma/schema.prisma` (Session) | No index on `shop` — full table scan on every auth | `@@index([shop])` | S |
| 26 | Session model | No expiry cleanup — sessions accumulate forever | Scheduled cleanup job | S |
| 27 | TranslationMemory | No unique constraint — race condition duplicates | `@@unique([shop, sourceLocale, targetLocale, sourceText])` | S |
| 28 | `translation-memory/store.ts:95` | Fuzzy search loads entire TM table — OOM at scale | Add `take: 1000` or length pre-filter | M |
| 29 | SQLite config | No WAL mode, no busy_timeout — concurrent writes fail | `PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;` | S |
| 30 | SQLite | No backup strategy | Periodic `.backup` or Litestream | M |
| 31 | `app/db.server.ts` | Production creates new PrismaClient per-import | Apply global singleton for production | S |

### Route High

| # | File | Description | Fix | Effort |
|---|---|---|---|---|
| 32 | `app.onboarding.tsx:35` | Onboarding state in-memory Map — lost on restart | Persist to database | M |
| 33 | `app.rtl-settings.tsx:52` | Save button no-op — only shows toast | Implement save action | S |
| 34 | `app.import.tsx:123` | Import simulated client-side only | Implement real import action | M |
| 35 | 48 of 52 routes | Missing ErrorBoundary | Add ErrorBoundary | M |
| 36 | 6 routes | `JSON.parse` without try-catch | Wrap in try-catch | S |

### Payment High

| # | File | Description | Fix | Effort |
|---|---|---|---|---|
| 37 | `payments/mena/tabby.ts:13` | Sandbox URL = production URL | Fix sandbox URL | S |
| 38 | `payments/mena/telr.ts:13` | Sandbox URL = production URL | Fix sandbox URL | S |
| 39 | `payments/mena/hyperpay.ts:75` | Multi-brand in single param — may fail | Use proper brand selection | S |
| 40 | `payments/mena/network-international.ts:23` | Auth token cached in closure — stale in serverless | Per-request or DB-cached token | M |
| 41 | `app.billing.confirm.tsx:51` | Matches subscription by name not GID | Match by appSubscription.id | S |
| 42 | `app.billing.tsx:100` | console.log of full billing response in prod | Remove or conditionalize | S |

### Translation Engine High

| # | File | Description | Fix | Effort |
|---|---|---|---|---|
| 43 | `engine.ts:150` | No retry logic — failures immediately fall through | Add exponential backoff (1s, 2s, 4s) | M |
| 44 | `translation-formatting/index.ts:17` | Global mutable counter — race condition | Use closure-scoped counter | S |
| 45 | `translation-formatting/index.ts:151` | No Liquid template preservation | Add regex for `{{ }}`, `{% %}` | S |
| 46 | `ai-providers/google.ts:69` | Static access token expires after ~1 hour | Implement OAuth2 refresh | M |
| 47 | `bulk-processor/index.ts:33` | Bulk jobs in-memory — state lost on restart | Persist to database | M |

### Component High

| # | File | Description | Fix | Effort |
|---|---|---|---|---|
| 48 | 7 components | Deprecated Polaris v11 `Stack` | Replace with `BlockStack`/`InlineStack` | M |
| 49 | 3 components | Deprecated `Card.Section` | Replace with `Box padding` | S |
| 50 | 3 components | Deprecated `color="subdued"` | Change to `tone="subdued"` | S |
| 51 | `AbayaCustomizer.tsx:42` | Stale closure bug — totalPrice wrong | Compute from newSelections | S |
| 52 | DraggableList | Zero keyboard accessibility | Add keyboard handlers + ARIA | M |
| 53 | 5 translation-editor files | Duplicated `isRtlLocale` | Extract to `app/utils/rtl.ts` | S |

### Content/SEO High

| # | File | Description | Fix | Effort |
|---|---|---|---|---|
| 54 | `media-translation/` | Image alt-text translation missing | Add service integrating with content-translator | M |
| 55 | 3 files | `generateProductSchema` duplicated 3x | Consolidate to single impl | M |
| 56 | 4 files | Hreflang URL logic duplicated 4x | Create shared builder | M |
| 57 | `url-slugs/index.ts` | Slug translations in-memory Map | Persist to database | M |

---

## PART D: Medium Priority (Tech Debt Backlog)

### Overlapping Services (8 groups)

| Before | After | Action |
|---|---|---|
| content/ + content-translation/ + content-translator/ + content-fields/ + product-translation/ | **content/** | Merge |
| rtl/ + rtl-features/ + rtl-design/ + rtl-transformer.ts | **rtl/** | Merge |
| cultural-ai/ + cultural-features/ + sensitivity/ + dialects/ | **cultural-ai/** | Merge |
| arabic-features/ + mena-design/ + mena-campaigns/ + mena-regional/ | **mena/** | Merge |
| gdpr/ + privacy/ | **gdpr/** | Merge |
| seo/ + seo-infrastructure/ | **seo/** | Merge |
| team/ + team-management/ | **team/** | Merge |
| email/ + email-builder/ | **email/** or delete | Merge/Delete |

### In-Memory State (5 services)

| Service | Fix |
|---|---|
| Rate limiter (shared.ts) | Redis-based or conservative per-process |
| Monthly quota tracker | Persist counters to DB |
| Review queue | Persist to DB |
| Confidence scores | Max-size eviction or persist |
| Content translator cache | Persist to SQLite |

### Translation Engine (8 items)

| Description | Fix |
|---|---|
| Only TranslationProviderError triggers fallback | Catch all errors |
| Cache key excludes provider + glossary hash | Include in key |
| Cost tracking fire-and-forget | Add .catch() handlers |
| Two disconnected bulk systems | Unify |
| 50 concurrent translations, no global rate limit | Add concurrency semaphore |
| Fallback priority map missing 4 providers | Add all 7 |
| BiDi service exists but never called | Wire into engine for RTL |
| Amazon hand-rolled SigV4 | Use @aws-sdk/client-translate |

### Database (7 items)

| Description | Fix |
|---|---|
| ShopSubscription.planId not indexed | Add index |
| DataAccessLog grows unbounded | Retention cleanup |
| TranslationUsage grows unbounded | Periodic purge |
| TranslationAlert dismissed never cleaned | Delete old dismissed |
| TeamInvite redundant index on token | Remove |
| MemoryCacheStore FIFO not LRU | Implement LRU |
| Dual Redis implementations | Consolidate |

### Content/SEO (8 items)

| Description | Fix |
|---|---|
| schema-org adds non-standard _translationMeta | Remove |
| Schema-org only 3 locales | Expand |
| Description generator no AI call | Implement |
| Video subtitles use mockTranslate | Wire real engine |
| Search service unwired | Wire to storefront |
| media-features mixes 6 concerns | Split |
| Breadcrumb schema 4x duplicate | Consolidate |
| seo/sitemap.ts unused duplicate | Remove |

### Components (11 items)

| Description | Fix |
|---|---|
| 6 components hardcoded physical CSS | Use logical properties |
| SeasonalBanner style on Banner | Wrap in div |
| BreadcrumbNav raw `<a>` tag | Use App Bridge Link |
| FontLoader leaks link elements | Fix cleanup |
| TranslationEditor/SideBySide overflow | Add overflow-wrap |
| 3 files duplicate status badge | Extract component |
| AbayaCustomizer hardcodes $ | Accept currency prop |
| ReadingTime English wpm for Arabic | Adjust for locale |
| ConversionChart/UsageMetrics hardcode $ | Locale-aware formatting |
| Cookie consent HTML no escaping | HTML-escape values |
| Dialect detection 3 places, incompatible types | Consolidate |

---

## PART E: Low Priority (Improvements)

| # | Description | Fix |
|---|---|---|
| 110 | CLAUDE.md outdated (87 services vs 96, 26 routes vs 54, wrong extension) | Update |
| 111 | translation.ts standalone coexists with translation/ dir | Merge |
| 112 | rtl-transformer.ts standalone dead file | Delete |
| 113 | payments/ no top-level index.ts | Add |
| 114 | fashion-db/ 1452-line file, never imported | Move or delete |
| 115 | performance/ 14 files, 13-line index | Consolidate |
| 116 | messaging/ WhatsApp/SMS, never imported | Wire or delete |
| 117 | cache/ Redis impl — unclear if deployed | Verify or remove |
| 118-119 | Missing indexes on TranslationCache.provider, DataRetentionPolicy.shop | Add |
| 120 | 11 migrations forward-only | Document rollback |
| 121-124 | Various missing empty states and minor UI | Add |
| 125 | Ramadan dates hardcoded 2024-2028 | Use Intl Hijri |
| 126 | Prayer times hardcoded Saudi summer | Make configurable |
| 127 | Calligraphy font URLs point to nonexistent files | Fix paths |
| 128-129 | Font preload incomplete; no Unicode range subsetting | Complete |
| 130 | Tabby buyer_history always new Date() | Pass real date |
| 131 | SADAD URL may be Qatar not Saudi | Verify endpoint |

---

## PART F: Stub Audit

| # | Service | Status | Recommendation |
|---|---|---|---|
| 1 | translation-features/ (23 files, 16,932 lines) | 18 data tables, 0 imports | **DELETE** |
| 2 | description-generator/ | Builds prompts, no generate() | **IMPLEMENT** or delete |
| 3 | media-features/ OCR | Hardcoded mock return | **DELETE** |
| 4 | media-translation/ subtitles | mockTranslate with 10 phrases | **IMPLEMENT** |
| 5 | product-translation/ | Static dictionaries only | **DELETE** — merge into glossary |
| 6 | brand-voice/ | Word count = formality | **IMPLEMENT** with real NLP or delete |
| 7 | currency/exchange.ts | Hardcoded mock rates | **IMPLEMENT** — critical |
| 8 | api.payments.mena webhook | TODO — no order update | **IMPLEMENT** — critical |
| 9 | app.import.tsx | Client-side simulation | **IMPLEMENT** |
| 10 | app.rtl-settings.tsx save | Toast only | **IMPLEMENT** |
| 11 | app.payments.tsx save/test | No-op buttons | **IMPLEMENT** |
| 12 | hijri/ directory | Does not exist | **DELETE** from docs |
| 13 | seasonal-banners/ directory | Does not exist | **DELETE** from docs or create |
| 14 | size-guide/ directory | Does not exist | **IMPLEMENT** if needed |
| 15 | auth integration tests | `expect(true).toBe(true)` | **IMPLEMENT** real tests |

---

## PART G: Consolidation Plan

### Target: 96 service dirs to ~20 focused modules

| Before | After |
|---|---|
| content/ + content-translation/ + content-translator/ + content-fields/ + product-translation/ | **content/** |
| rtl/ + rtl-features/ + rtl-design/ + rtl-transformer.ts | **rtl/** |
| cultural-ai/ + cultural-features/ + sensitivity/ + dialects/ | **cultural-ai/** |
| arabic-features/ + mena-design/ + mena-campaigns/ + mena-regional/ | **mena/** |
| gdpr/ + privacy/ | **gdpr/** |
| seo/ + seo-infrastructure/ | **seo/** |
| team/ + team-management/ | **team/** |
| email/ + email-builder/ | **email/** or delete |
| url-slugs/ + seo/url-translator.ts | **url-slugs/** |
| schema-org/ + seo/structured-data.ts | **schema-org/** |

### Dead Code to Remove (67 directories, ~35,000+ lines)

Top candidates: translation-features/ (16,932 lines), arabic-features/ (1,541), mena-campaigns/ (1,243 — after extracting national-day), mena-design/ (984), admin-features/, advanced-features/, cart-checkout/, checkout-extensions/, customer-account/, draft-translation/, email-builder/, filter-labels/, heatmap/, input-masks/, integrations/, localization/, messaging/, native-script/, never-translate/, plagiarism-check/, product-variants/, quality-score/, shipping/, sort-order/, storefront-widgets/, style-guide/, third-party/, ui-labels/, visual-editor/... and 38 more.

### Features: Implement vs Cut

| Feature | Decision | Rationale |
|---|---|---|
| TM integration | **IMPLEMENT** | Built but disconnected — cost savings |
| Glossary enforcement | **IMPLEMENT** | Built but disconnected — consistency |
| Formatting preservation | **IMPLEMENT** | Built but disconnected — data integrity |
| Real currency exchange | **IMPLEMENT** | Fake rates = wrong prices |
| Payment webhook updates | **IMPLEMENT** | Orders never updated |
| GDPR full coverage | **IMPLEMENT** | Legal compliance |
| OCR | **CUT** | No clear MVP use case |
| Messaging (WhatsApp/SMS) | **CUT** | Not core |
| Heatmap | **CUT** | No route integration |
| Plagiarism check | **CUT** | Niche |
| Cart/checkout extensions | **CUT** for now | Requires Shopify extensibility |
| Brand voice NLP | **DEFER** | Nice-to-have |
| Size guide | **DEFER** | Useful but not blocking |

---

## Action Plan

### P0 — Ship Blockers (Week 1)

| # | Category | Fix | File(s) | Effort |
|---|---|---|---|---|
| 1 | Security | Encrypt API keys at rest (AES-256-GCM) | schema.prisma, app.settings.tsx | M |
| 2 | Security | timingSafeEqual in all 9 MENA gateways | payments/mena/*.ts | S |
| 3 | Security | Add shop column to TranslationCache; scope GDPR | schema.prisma, erasure.ts, data-deletion.ts | M |
| 4 | Security | Extend GDPR erasure to all 15 tables | erasure.ts, data-deletion.ts | M |
| 5 | Injection | Fix GraphQL injection — use $locale variable | app.translate.blog.$resourceId.tsx:22 | S |
| 6 | Database | Datasource URL to env("DATABASE_URL") | schema.prisma:13 | S |
| 7 | Database | Enable WAL + busy_timeout | Connection string | S |
| 8 | Database | Index Session.shop | schema.prisma | S |
| 9 | Database | Unique constraint TranslationMemory | schema.prisma | S |
| 10 | Database | PrismaClient singleton for production | db.server.ts | S |
| 11 | Pipeline | Wire TM into engine.translate() | engine.ts | M |
| 12 | Pipeline | Wire glossary enforcement | engine.ts | M |
| 13 | Pipeline | Wire formatting preservation | engine.ts | M |
| 14 | Payments | Fix PayFort wrong passphrase | payfort.ts:173 | S |
| 15 | Payments | Fix PayFort 3-decimal currencies | payfort.ts:70 | S |
| 16 | Payments | Fix hardcoded refund currencies (5 gateways) | 5 files | M |
| 17 | SEO | Add dir="rtl" + lang="ar" to meta tags | meta-tags/translator.ts | S |

### P1 — High Priority (Week 2-3)

| # | Category | Fix | Effort |
|---|---|---|---|
| 18 | Security | Enable expiringOfflineAccessTokens | S |
| 19 | Security | Fix weak team API key generation | S |
| 20 | Routes | Persist onboarding state to DB | M |
| 21 | Routes | Implement RTL settings save | S |
| 22 | Routes | Add ErrorBoundary to 48 routes | M |
| 23 | Routes | Wrap 6 JSON.parse in try-catch | S |
| 24 | Payments | Fix Tabby + Telr sandbox URLs | S |
| 25 | Payments | Billing confirm match by GID | S |
| 26 | Payments | Implement webhook order updates | M |
| 27 | Payments | Integrate real currency exchange API | L |
| 28 | Engine | Add retry with exponential backoff | M |
| 29 | Engine | Fix formatting counter race condition | S |
| 30 | Engine | Add Liquid template preservation | S |
| 31 | Engine | Fix Google token refresh | M |
| 32 | Components | Replace 7x deprecated Stack | M |
| 33 | Components | Replace 3x Card.Section | S |
| 34 | Components | Fix AbayaCustomizer stale closure | S |
| 35 | Components | DraggableList keyboard a11y | M |
| 36 | Components | Extract duplicated isRtlLocale | S |
| 37 | Database | Session expiry cleanup | S |
| 38 | Database | Backup strategy | M |
| 39 | Testing | Real auth tests | M |
| 40 | Testing | Billing confirm route tests | M |
| 41 | Testing | Webhook idempotency tests | M |

### P2 — Tech Debt (Sprint 3-4)

| # | Category | Fix | Effort |
|---|---|---|---|
| 42 | Architecture | Delete 67 dead service directories | L |
| 43 | Architecture | Merge 8 overlap groups | L |
| 44 | Architecture | Wire security middleware | M |
| 45 | Content | Consolidate 3x schema.org generators | M |
| 46 | Content | Shared hreflang URL builder | M |
| 47 | Content | Image alt-text translation | M |
| 48 | Regional | Consolidate dialect detection 3 to 1 | M |
| 49 | Regional | Fix Ramadan detection | S |
| 50 | Components | Fix 6x hardcoded physical CSS | M |
| 51 | Components | Localize 30+ components | L |
| 52-55 | Testing | 4 providers + 6 gateways + MSW + E2E | L |
| 56 | Database | Retention policies for unbounded tables | M |
| 57-58 | Routes | Import action + payments UI | M |

### P3 — Improvements (Backlog)

| # | Category | Fix | Effort |
|---|---|---|---|
| 59 | Docs | Update CLAUDE.md | S |
| 60-61 | Engine | Persist bulk jobs + quotas | M |
| 62-63 | Content | Description generator + search wiring | M |
| 64-67 | Regional | Prayer times + brand voice + fonts + size guide | M-L |
| 68 | Components | Fix calligraphy font paths | S |
| 69 | Database | Evaluate PostgreSQL migration | L |

---

*Report generated by 10-agent ruflo swarm audit on 2026-03-24. Total: 500+ file reads, 300+ grep searches across 96 service directories, 54 routes, 28 components, 121 test files.*
