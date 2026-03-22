# AGENTS.md - AI Coding Agent Guide

> **Quick reference**: See `CLAUDE.md` for concise project instructions.
> Agent-specific rules: `.agents/RULES.md`, `.agents/KIMI_INSTRUCTIONS.md`, `.agents/CODEX_INSTRUCTIONS.md`
> Task format: `.agents/TASK_FORMAT.md`

## Project Overview

**rtl-storefront** is a Shopify App built with the [Remix](https://remix.run) framework. It is an embedded app that runs inside the Shopify Admin, providing merchants with custom functionality to manage their store.

This project uses the official Shopify App Template for Remix and follows Shopify's recommended patterns for app development.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Remix v2.16.1 (React-based full-stack) |
| Language | TypeScript 5.2+ |
| Build Tool | Vite v6.2.2 |
| Database | SQLite (via Prisma ORM v6.2.1) |
| UI Library | Shopify Polaris v12 |
| App Bridge | @shopify/app-bridge-react v4.1.6 |
| API | Shopify Admin GraphQL API (v2025-01) |
| Session Storage | PrismaSessionStorage |
| Package Manager | npm |
| Node Version | >=20.19 <22 || >=22.12 |

## Project Structure

```
rtl-storefront/
├── app/                          # Main application code
│   ├── routes/                   # Remix routes (file-based routing)
│   │   ├── _index/              # Landing page (marketing page)
│   │   │   ├── route.tsx
│   │   │   └── styles.module.css
│   │   ├── app._index.tsx       # Main app dashboard
│   │   ├── app.additional.tsx   # Example additional page
│   │   ├── app.tsx              # App layout with NavMenu
│   │   ├── auth.$.tsx           # OAuth callback handler
│   │   ├── auth.login/          # Login page
│   │   │   ├── route.tsx
│   │   │   └── error.server.tsx
│   │   ├── webhooks.app.uninstalled.tsx    # Webhook: app uninstall
│   │   └── webhooks.app.scopes_update.tsx  # Webhook: scopes update
│   ├── routes.ts                # Route configuration (flatRoutes)
│   ├── root.tsx                 # Root layout component
│   ├── entry.server.tsx         # Server entry point
│   ├── shopify.server.ts        # Shopify app configuration
│   ├── db.server.ts             # Prisma client singleton
│   └── globals.d.ts             # Global type declarations
├── prisma/
│   └── schema.prisma            # Database schema (Session model)
├── extensions/                  # Shopify extensions (empty)
├── public/                      # Static assets
├── shopify.app.toml             # Shopify app configuration
├── shopify.web.toml             # Web configuration for Shopify CLI
├── vite.config.ts               # Vite configuration
├── .graphqlrc.ts                # GraphQL codegen configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.cjs                # ESLint configuration
├── Dockerfile                   # Docker container configuration
└── env.d.ts                     # Vite/Remix environment types
```

## Build and Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (uses Shopify CLI) |
| `npm run build` | Build for production using Remix + Vite |
| `npm run start` | Start production server (remix-serve) |
| `npm run docker-start` | Setup and start in Docker container |
| `npm run setup` | Run Prisma generate and migrations |
| `npm run deploy` | Deploy app to Shopify |
| `npm run config:link` | Link app to Shopify Partner account |
| `npm run config:use` | Switch between app configurations |
| `npm run env` | Show environment variables |
| `npm run lint` | Run ESLint with caching |
| `npm run graphql-codegen` | Generate GraphQL types |
| `npm run prisma` | Prisma CLI wrapper |
| `npm run shopify` | Shopify CLI wrapper |

## Development Workflow

### Prerequisites

1. Node.js (>=20.19 <22 || >=22.12)
2. Shopify CLI installed globally: `npm install -g @shopify/cli@latest`
3. Shopify Partner account
4. Development store for testing

### Local Development

```bash
# Start development server
npm run dev

# This will:
# 1. Login to your Shopify Partner account
# 2. Connect to an app (or create new)
# 3. Create a tunnel (Cloudflare/ngrok)
# 4. Start the Remix dev server with HMR
```

### Database Setup

```bash
# Initialize database (run once or after schema changes)
npm run setup

# This runs:
# - prisma generate: Generate Prisma client
# - prisma migrate deploy: Apply migrations
```

### GraphQL Code Generation

```bash
# Generate TypeScript types from GraphQL queries
npm run graphql-codegen
```

Types are generated to `app/types/` based on queries in `app/**/*.{js,ts,jsx,tsx}`.

## Code Style Guidelines

### TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext with Bundler resolution
- **Strict mode**: Enabled
- **JSX**: react-jsx transform
- **Base URL**: `.` (project root)

### ESLint Rules

Extends:
- `@remix-run/eslint-config`
- `@remix-run/eslint-config/node`
- `@remix-run/eslint-config/jest-testing-library`
- `prettier`

Global: `shopify` is defined as readonly.

### File Naming Conventions

- Server-only modules: `*.server.ts` (e.g., `shopify.server.ts`, `db.server.ts`)
- Route files: Follow Remix flat routes convention
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Utilities: camelCase (e.g., `formatPrice.ts`)

### Import Patterns

```typescript
// Use vite-tsconfig-paths for path aliasing
// Base URL is set to project root
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Polaris CSS imports use ?url suffix
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
```

## Route Structure and Conventions

### Route Files

| Route | Purpose |
|-------|---------|
| `app/routes/_index/route.tsx` | Marketing/landing page for non-authenticated users |
| `app/routes/app.tsx` | App layout with Polaris AppProvider and NavMenu |
| `app/routes/app._index.tsx` | Main dashboard (default app page) |
| `app/routes/app.additional.tsx` | Example additional page |
| `app/routes/auth.login/route.tsx` | Login form for entering shop domain |
| `app/routes/auth.$.tsx` | OAuth authentication callback |
| `app/routes/webhooks.app.uninstalled.tsx` | Handle app/uninstalled webhook |
| `app/routes/webhooks.app.scopes_update.tsx` | Handle app/scopes_update webhook |

### Route Configuration

Routes are defined in `app/routes.ts` using Remix's flatRoutes:

```typescript
import { flatRoutes } from "@remix-run/fs-routes";
export default flatRoutes();
```

### Authentication Pattern

```typescript
// In loaders and actions
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  // Use admin.graphql() to query Shopify API
  return null;
};
```

## Database Schema

The project uses Prisma with SQLite for session storage:

```prisma
model Session {
  id                  String    @id
  shop                String
  state               String
  isOnline            Boolean   @default(false)
  scope               String?
  expires             DateTime?
  accessToken         String
  userId              BigInt?
  firstName           String?
  lastName            String?
  email               String?
  accountOwner        Boolean   @default(false)
  locale              String?
  collaborator        Boolean?  @default(false)
  emailVerified       Boolean?  @default(false)
  refreshToken        String?      // For token rotation
  refreshTokenExpires DateTime?    // For token rotation
}
```

**Note**: The database includes refresh token fields for expiring offline access tokens (security feature).

## Shopify App Configuration

### shopify.app.toml

```toml
client_id = "2ea7b10705cc7163256b479076538368"
name = "rtl-storefront"
embedded = true
api_version = "2026-04"
scopes = "write_products"
```

### shopify.web.toml

```toml
name = "remix"
roles = ["frontend", "backend"]
webhooks_path = "/webhooks/app/uninstalled"

[commands]
predev = "npx prisma generate"
dev = "npx prisma migrate deploy && npm exec remix vite:dev"
```

## Security Considerations

1. **Authentication**: Always use `authenticate.admin(request)` in routes that require Shopify admin access.

2. **Session Management**: Sessions are stored in SQLite via PrismaSessionStorage. For production, consider PostgreSQL or MySQL.

3. **Webhook Validation**: Webhooks are automatically validated by the Shopify Remix package using HMAC.

4. **Token Rotation**: The app uses expiring offline access tokens (`expiringOfflineAccessTokens: true`).

5. **Environment Variables**: Sensitive config is passed via environment variables by Shopify CLI:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SHOPIFY_APP_URL`
   - `SCOPES`
   - `SHOP_CUSTOM_DOMAIN` (optional)

6. **Embedded App Security**: The app runs in an iframe within Shopify Admin. Use App Bridge for navigation, not standard `<a>` tags.

## Testing Strategy

- ESLint includes Jest testing library configuration
- No test files are present in the current codebase
- To add tests, create `*.test.ts` or `*.spec.ts` files alongside your source files

## Deployment

### Docker

The project includes a Dockerfile for containerized deployment:

```dockerfile
FROM node:18-alpine
# Production build with Prisma and Remix
```

### Environment Variables for Production

Required environment variables:
- `NODE_ENV=production`
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES`
- `DATABASE_URL` (if using non-SQLite database)

### Deploy Command

```bash
npm run deploy
```

This updates the app configuration in Shopify Partners dashboard.

## Key Dependencies Notes

- `@shopify/shopify-app-remix`: Core Shopify app functionality, authentication, API clients
- `@shopify/shopify-app-session-storage-prisma`: Prisma-based session storage
- `@shopify/polaris`: Shopify's design system components
- `@shopify/app-bridge-react`: React components for embedded app integration
- `@remix-run/*`: Remix framework packages
- `prisma`: Database ORM and migration tool

## Important Future Flags (Remix)

The Vite config enables several Remix v3 future flags:
- `v3_fetcherPersist`
- `v3_relativeSplatPath`
- `v3_throwAbortReason`
- `v3_lazyRouteDiscovery`
- `v3_routeConfig` (enabled)
- `v3_singleFetch` (disabled)

## Troubleshooting Common Issues

1. **Database tables don't exist**: Run `npm run setup` to create tables
2. **OAuth loop after scope changes**: Run `npm run deploy` to update scopes
3. **HMR not working in embedded app**: Use `Link` from Remix, not `<a>` tags
4. **GraphQL type errors**: Run `npm run graphql-codegen`

## Migration Notes

This template uses Remix, which has merged with React Router v7. For new projects, Shopify recommends using the React Router template. To migrate an existing Remix app, see: https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix
