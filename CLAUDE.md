# CLAUDE.md — Project Instructions

## Project Overview

**rtl-storefront** is a Shopify embedded app built with Remix v2.16.1, TypeScript, Vite v6.2.2, Polaris v12, and Prisma/SQLite. It runs inside the Shopify Admin.

## Tech Stack

- **Framework**: Remix v2 (React-based full-stack) with flat file-based routing
- **Language**: TypeScript 5.2+ (strict mode, ES2022 target)
- **Build**: Vite v6.2.2
- **UI**: Shopify Polaris v12, @shopify/app-bridge-react v4.1.6
- **Database**: SQLite via Prisma ORM v6.2.1
- **API**: Shopify Admin GraphQL API v2025-01
- **Package Manager**: npm
- **Node**: >=20.19 <22 || >=22.12

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Shopify CLI) |
| `npm run build` | Production build (Remix + Vite) |
| `npm run setup` | Prisma generate + migrate deploy |
| `npm run lint` | ESLint with caching |
| `npm run graphql-codegen` | Generate GraphQL types |
| `npm run deploy` | Deploy to Shopify |

## Code Conventions

### File Naming
- Server-only modules: `*.server.ts` (e.g., `shopify.server.ts`, `db.server.ts`)
- Route files: Remix flat routes convention
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Utilities: camelCase (e.g., `formatPrice.ts`)

### Imports
```typescript
// Polaris CSS uses ?url suffix
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
// Relative imports from app root
import { authenticate } from "../shopify.server";
import db from "../db.server";
```

### Authentication
Always use `authenticate.admin(request)` in loaders/actions that need Shopify access:
```typescript
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  return null;
};
```

### Embedded App
- Use App Bridge for navigation — NEVER use standard `<a>` tags
- Use Remix `Link` for internal navigation

## Multi-Agent Workflow

This repo uses a multi-agent system. See `.agents/RULES.md` for full rules.

### Branch Discipline
- Claude (lead architect) commits directly to `main`
- Other agents (kimi, codex, gemini) use feature branches
- NEVER switch branches — work on the branch checked out in your worktree

### Commit Messages
- Prefix with branch name: `[agent-1/auth] add login endpoint`
- Small, focused commits after each logical unit of work

### Task System
- Tasks live in `.tasks/` (active, review, done, queue)
- Task format defined in `.agents/TASK_FORMAT.md`
- File locks are exclusive — check `.tasks/active/` before starting

### Review Flow
1. Agent implements task on feature branch
2. Agent runs tests, writes `result.md`
3. Agent moves task to `.tasks/review/`
4. Claude reviews, merges to main or rejects

## Testing (Mandatory Before Review)

- Run `test_command` from task file if specified
- Include actual test output in `result.md` — "manually verified" is NOT accepted
- Run route health check for any route changes: `bash scripts/check-routes.sh`

### Test Quality Rules
- NO lenient assertions: never `.toBeTruthy()` for existence — assert specific values
- NO `|| true` patterns: `expect(x || true).toBe(true)` always passes — forbidden
- NO early returns that skip assertions
- NO fake inline components — import the real component

### Screen Regression
- Run screen's test spec BEFORE and AFTER changes
- No hardcoded colors — use CSS variables
- Guard all data access with optional chaining: `data?.length ?? 0`

## Security

- Token rotation enabled (`expiringOfflineAccessTokens: true`)
- Webhook HMAC validation handled by Shopify Remix package
- Secrets via environment variables (SHOPIFY_API_KEY, SHOPIFY_API_SECRET, etc.)
- Sessions stored in SQLite via PrismaSessionStorage

## Remix Future Flags (enabled)
- v3_fetcherPersist
- v3_relativeSplatPath
- v3_throwAbortReason
- v3_lazyRouteDiscovery
- v3_routeConfig
