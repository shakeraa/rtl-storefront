# CLAUDE.md — Project Instructions

## Project Overview

**rtl-storefront** is a Shopify embedded app for RTL (Right-to-Left) storefront translation and MENA market localization. Built with Remix v2, TypeScript, Polaris v12, and Prisma/SQLite.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Remix v2.16.1 (React full-stack) |
| Language | TypeScript 5.2+ (strict mode) |
| Build | Vite v6.2.2 |
| UI | Shopify Polaris v12, App Bridge React v4.1.6 |
| Database | SQLite via Prisma ORM v6.2.1 |
| API | Shopify Admin GraphQL API v2025-01 |
| Package Manager | npm |
| Node | >=20.19 <22 \|\| >=22.12 |

## Commands

```bash
npm run dev              # Start dev server (Shopify CLI)
npm run build            # Production build
npm run setup            # Prisma generate + migrate
npm run lint             # ESLint
npm run deploy           # Deploy to Shopify
npx vitest run           # Run tests
npx prisma migrate dev   # Run migrations
npx tsx prisma/seed.ts   # Seed billing plans + glossary
```

## Code Conventions

- Server-only: `*.server.ts` (e.g., `shopify.server.ts`, `db.server.ts`)
- Routes: Remix flat routes (`app/routes/app.*.tsx`)
- Components: PascalCase, Services: kebab-case directories
- Always use `authenticate.admin(request)` in loaders/actions
- Always use `json()` from `@remix-run/node` for loader returns
- Import Prisma as `import db from "../db.server"` (default export)
- Use App Bridge `Link` for navigation, never `<a>` tags

## Project Structure

```
app/
├── routes/           # 26 Remix routes (admin pages + API)
├── services/         # 87 service directories
├── components/       # UI components (visual-editor, system, ui-features)
├── utils/            # RTL utilities, translation helpers
extensions/
├── language-switcher/  # Theme extension (4 blocks)
│   ├── blocks/         # language-switcher, checkout-rtl, mena-payments, rtl-inject
│   ├── assets/         # rtl-storefront.css
│   └── locales/        # en.default.json
packages/
├── hydrogen/         # Headless translation client stub
prisma/
├── schema.prisma     # 8 models
├── seed.ts           # Billing plans + glossary entries
├── migrations/       # 3 migrations applied
test/
├── unit/             # 109 test files
├── integration/      # 3 integration tests
├── e2e/              # 1 smoke test
docs/
├── api-reference.md  # Full API documentation
```

## Multi-Agent System

Three agents work in parallel. See `.agents/` for detailed instructions.

| Agent | Role | Branch |
|-------|------|--------|
| **Claude** | Lead architect, reviews + merges to main | `main` |
| **Kimi** | Feature developer | `feature/*` branches in worktrees |
| **Codex** | Feature developer | `feature/*` branches in worktrees |

### Rules
- Agents work in isolated worktrees — NEVER on main
- Claude reviews all submissions before merging
- Tasks tracked in `.tasks/` (active → review → done)
- See `.agents/RULES.md` for full workflow

## Key Services

| Service | Path | Description |
|---------|------|-------------|
| Translation Engine | `services/translation/` | AI translation (OpenAI/DeepL/Google) |
| Cultural AI | `services/cultural-ai/` | Dialect, sensitivity, formality |
| MENA Payments | `services/payments/mena/` | 11 gateways (Tamara, Tabby, Mada, etc.) |
| Translation Memory | `services/translation-memory/` | TM + glossary with fuzzy matching |
| BiDi Preservation | `services/bidi/` | Mixed LTR/RTL text handling |
| Coverage | `services/coverage/` | Translation coverage tracking |
| Security | `services/security/` | CSP, XSS, CSRF, rate limiting |
| GDPR | `services/gdpr/` | Data export, deletion, consent |
| Analytics | `services/analytics/` | Volume, ROI, trends, reports |
| Billing | `services/billing/` | Shopify Billing API integration |

## Security

- Token rotation: `expiringOfflineAccessTokens: true`
- Webhook HMAC validation via Shopify Remix package
- Secrets via env vars only (never hardcoded)
- Sessions in SQLite via PrismaSessionStorage
- CSP, XSS prevention, CSRF tokens in security service
