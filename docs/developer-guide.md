# RTL Storefront — Developer Guide

## Project Setup

### Prerequisites

- Node.js >=20.19 <22 or >=22.12
- npm (bundled with Node.js)
- A Shopify Partner account and a development store
- Shopify CLI v3+

### Clone and install

```bash
git clone <repo-url>
cd rtl-storefront
npm install
```

### Environment configuration

Copy `.env.example` to `.env` and fill in the required variables:

```bash
cp .env.example .env
```

Required variables:

```
SHOPIFY_API_KEY=<from Shopify Partner dashboard>
SHOPIFY_API_SECRET=<from Shopify Partner dashboard>
SCOPES=write_translations,read_products,read_orders
```

Optional (for translation providers):

```
OPENAI_API_KEY=sk-...
DEEPL_API_KEY=...
GOOGLE_TRANSLATE_ACCESS_TOKEN=...
```

Optional (for team invitation emails):

```
# Email provider: mock (default), smtp, sendgrid
EMAIL_PROVIDER=mock

# For SMTP provider
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@rtl-storefront.app

# For SendGrid provider
SENDGRID_API_KEY=SG.xxx
```

### Database setup

The app uses SQLite via Prisma ORM. To initialize:

```bash
npm run setup
# Runs: prisma generate && prisma migrate deploy
```

This creates `prisma/dev.sqlite` and applies all migrations.

### Start development server

```bash
npm run dev
```

This starts the Shopify CLI tunnel and the Remix dev server. The app opens in your development store automatically.

---

## Architecture Overview

```
rtl-storefront/
├── app/
│   ├── routes/              # Remix flat-file routes
│   │   ├── app.*.tsx        # Admin UI pages (embedded app)
│   │   ├── api.v1.*.ts      # Public REST API endpoints
│   │   ├── webhooks.*.ts    # Shopify webhook handlers
│   │   └── auth.$.tsx       # OAuth entry point
│   ├── services/            # Business logic (server-only)
│   │   ├── translation/     # Translation engine + AI providers
│   │   ├── translation-memory/  # TM database + glossary
│   │   ├── billing/         # Subscription + plan management
│   │   ├── cultural-ai/     # MENA cultural context
│   │   ├── coverage/        # Translation coverage stats
│   │   ├── rtl/             # RTL detection + transformation
│   │   ├── bidi/            # BiDi text preservation
│   │   ├── payments/        # MENA payment gateways
│   │   ├── gdpr/            # Privacy + consent
│   │   └── ...              # 40+ additional service modules
│   ├── components/          # Shared React components
│   ├── shopify.server.ts    # Shopify auth + API client
│   └── db.server.ts         # Prisma client singleton
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # SQL migration files
├── extensions/              # Shopify theme extensions
├── docs/                    # This documentation
└── test/                    # Vitest test files
```

### Request flow

1. Browser loads the embedded app inside Shopify Admin.
2. Shopify injects a session token via App Bridge.
3. Every Remix loader/action calls `authenticate.admin(request)` which validates the session via `~/shopify.server.ts`.
4. The route handler calls the relevant service module (pure TypeScript, no React).
5. Service modules interact with Prisma (SQLite) or call external APIs (Shopify GraphQL, OpenAI, etc.).
6. The route returns JSON to Remix, which hydrates the Polaris UI component tree.

### Authentication

Authentication is handled entirely by `@shopify/shopify-app-remix`. Never implement custom session logic. Always use:

```typescript
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  // admin: Shopify GraphQL client
  // session: { shop, accessToken, ... }
};
```

Token rotation is enabled (`expiringOfflineAccessTokens: true` in `shopify.server.ts`).

---

## Adding a New Translation Provider

Translation providers live in `app/services/translation/ai-providers/`. Each provider implements a shared interface.

### Step 1 — Create the provider file

```typescript
// app/services/translation/ai-providers/my-provider.ts

export interface MyProviderConfig {
  apiKey: string;
}

export async function translateWithMyProvider(
  config: MyProviderConfig,
  text: string,
  sourceLocale: string,
  targetLocale: string,
): Promise<string> {
  const response = await fetch("https://api.myprovider.com/translate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, source: sourceLocale, target: targetLocale }),
  });

  if (!response.ok) {
    throw new Error(`MyProvider error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.translation;
}
```

### Step 2 — Register in the engine

Open `app/services/translation/ai-providers/index.ts` and add your provider to the `getProvider` switch:

```typescript
case "my-provider":
  return (text, src, tgt) =>
    translateWithMyProvider({ apiKey: env.MY_PROVIDER_API_KEY ?? "" }, text, src, tgt);
```

### Step 3 — Add environment variable

Add `MY_PROVIDER_API_KEY` to `.env` and document it in the README and `docs/api-reference.md`.

### Step 4 — Add to Settings UI

In `app/routes/app.rtl-settings.tsx`, add the new provider to the `providers` object returned by the loader:

```typescript
my_provider: {
  configured: Boolean(process.env.MY_PROVIDER_API_KEY),
  name: "My Provider"
}
```

---

## Adding a New Route

Remix uses flat file routing. File names map directly to URL paths.

### Admin page

Create `app/routes/app.my-feature.tsx`:

```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function MyFeaturePage() {
  const { shop } = useLoaderData<typeof loader>();
  return (
    <Page>
      <TitleBar title="My Feature" />
      <Card>
        <Text as="p">Shop: {shop}</Text>
      </Card>
    </Page>
  );
}
```

This creates the route `/app/my-feature`.

### API endpoint

Create `app/routes/api.v1.my-endpoint.ts`:

```typescript
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop, data: [] });
}
```

This creates `GET /api/v1/my-endpoint`.

---

## Creating Theme Extensions

Theme extensions live in the `extensions/` directory and are deployed alongside the app. They inject JavaScript and CSS into the merchant's storefront theme.

### Generate a new extension

```bash
shopify app generate extension
```

Choose "Theme app extension" and follow the prompts.

### RTL extension pattern

The RTL layout extension works by:

1. Detecting the current locale via `Shopify.locale`.
2. Applying `dir="rtl"` to the `<html>` element when the locale is Arabic, Hebrew, Persian, or Urdu.
3. Injecting locale-specific font CSS variables.

See `extensions/rtl-layout/` for the reference implementation.

---

## Database Changes

Always use Prisma migrations — never edit the SQLite file directly.

### Create a migration

```bash
npx prisma migrate dev --name describe_your_change
```

### Apply in production

```bash
npm run setup
# Runs: prisma generate && prisma migrate deploy
```

### Schema location

`prisma/schema.prisma` — all models are documented inline.

Key models:

| Model | Purpose |
|-------|---------|
| `Session` | Shopify OAuth sessions |
| `TranslationCache` | Cached AI translation responses |
| `TranslationMemory` | Reusable translation pairs per shop |
| `GlossaryEntry` | Per-shop translation glossary |
| `CulturalContext` | Cultural configuration per locale |
| `BillingPlan` | Available subscription plans |
| `ShopSubscription` | Per-shop subscription state |
| `ShopUsage` | Monthly word usage tracking |
| `ConsentRecord` | GDPR consent records |
| `DataAccessLog` | GDPR audit log |

---

## Testing

The project uses Vitest. Run all tests:

```bash
npx vitest run
```

Run tests in watch mode:

```bash
npx vitest
```

### Test conventions

- Test files live in `test/` or co-located as `*.test.ts`.
- No lenient assertions — use specific values, never `.toBeTruthy()` for existence checks.
- No `|| true` patterns that make tests trivially pass.
- Import real components — never fake inline stubs.

### Route health check

After any route change, run:

```bash
bash scripts/check-routes.sh
```

---

## Code Quality

### Lint

```bash
npm run lint
```

ESLint is configured for TypeScript strict mode (ES2022 target).

### Type checking

```bash
npx tsc --noEmit
```

### GraphQL codegen

After changing any GraphQL query in route files:

```bash
npm run graphql-codegen
```

---

## Deployment

### Build

```bash
npm run build
```

### Deploy to Shopify

```bash
npm run deploy
```

This deploys the app to Shopify's infrastructure and updates the app configuration in the Partner dashboard.

### Environment variables in production

Set all secrets through your hosting provider's environment configuration. Never commit `.env` to version control. Required in production:

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- At least one translation provider key

---

## Multi-Agent Workflow

This repository uses a multi-agent development system. Rules are defined in `.agents/RULES.md`.

- **Lead architect (Claude)**: commits directly to `main`.
- **Other agents (kimi, codex, gemini)**: use feature branches, submit to `.tasks/review/`.
- **Task format**: defined in `.agents/TASK_FORMAT.md`.
- **File locks**: listed in `.tasks/active/` — check before starting work.

### Commit message format

```
[branch-name] short description

Longer explanation if needed.
```

Example: `[feature/T0023-docs] add user guide and API reference`

---

## Common Patterns

### Accessing Shopify GraphQL

```typescript
const { admin } = await authenticate.admin(request);

const response = await admin.graphql(`
  #graphql
  query GetProduct($id: ID!) {
    product(id: $id) {
      title
    }
  }
`, { variables: { id: "gid://shopify/Product/123" } });

const data = await response.json();
```

### Accessing the database

```typescript
import db from "../db.server";

const entries = await db.glossaryEntry.findMany({
  where: { shop: session.shop, targetLocale: "ar" },
  orderBy: { createdAt: "desc" },
});
```

### Form actions

Remix actions handle `POST`, `PUT`, `PATCH`, and `DELETE` from forms. Use `useSubmit` from `@remix-run/react` for programmatic submission in Polaris UI components (never standard HTML forms with `action` attributes).
