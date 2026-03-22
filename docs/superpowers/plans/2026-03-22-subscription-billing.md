# Subscription Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Shopify Billing API subscription plans with admin-configurable tiers, free trial, hard gate on expiry, and auto-cancel on uninstall.

**Architecture:** Prisma models for plans and subscriptions, billing service layer for all Shopify GraphQL interactions and gate logic, route-level enforcement in `app.tsx` loader, webhook handlers for external cancellation. Existing `app.pricing.tsx` is replaced with DB-driven `app.billing.tsx`.

**Tech Stack:** Remix v2, Prisma/SQLite, Shopify Billing API (GraphQL `appSubscriptionCreate`), Polaris v12, Vitest

**Spec:** `docs/superpowers/specs/2026-03-22-subscription-billing-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `prisma/schema.prisma` | Modify | Add BillingPlan, ShopSubscription, ShopUsage models |
| `app/services/billing/types.ts` | Create | TypeScript types and constants for billing |
| `app/services/billing/index.ts` | Create | Core billing logic: plan queries, subscription management, gate checks, Shopify GraphQL calls |
| `app/services/billing/seed-plans.ts` | Create | Prisma seed script for default plans |
| `app/routes/app.billing.tsx` | Create | Merchant plan selection page (replaces `app.pricing.tsx`) |
| `app/routes/app.billing.confirm.tsx` | Create | Shopify charge confirmation callback |
| `app/routes/app.internal.billing.tsx` | Create | Admin-only plan configuration page |
| `app/routes/webhooks.app.subscription_update.tsx` | Create | Handle `app_subscriptions/update` webhook |
| `app/routes/app.tsx` | Modify | Add subscription gate logic to loader, trial banner, billing nav link, delete old pricing link |
| `app/routes/app.pricing.tsx` | Delete | Replaced by `app.billing.tsx` |
| `app/routes/webhooks.app.uninstalled.tsx` | Modify | Cancel subscription on uninstall |
| `shopify.app.toml` | Modify | Add subscription update webhook |
| `test/unit/billing.test.ts` | Create | Unit tests for billing service |
| `test/integration/billing.test.ts` | Create | Integration tests for billing status mapping |

---

### Task 1: Prisma Schema — Add Billing Models

**Files:**
- Modify: `prisma/schema.prisma:148` (append after DataRetentionPolicy)

- [ ] **Step 1: Add BillingPlan, ShopSubscription, and ShopUsage models to schema**

Append to end of `prisma/schema.prisma`:

```prisma
model BillingPlan {
  id               String   @id @default(cuid())
  name             String
  slug             String   @unique
  priceInCents     Int
  trialDays        Int      @default(14)
  maxLanguages     Int
  maxWordsPerMonth Int
  features         String   @default("[]")
  sortOrder        Int      @default(0)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  subscriptions ShopSubscription[]
}

model ShopSubscription {
  id                 String    @id @default(cuid())
  shop               String    @unique
  planId             String?
  plan               BillingPlan? @relation(fields: [planId], references: [id])
  status             String    @default("trial")
  shopifyChargeId    String?   @unique
  trialStartedAt     DateTime?
  trialEndsAt        DateTime?
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@index([status])
}

model ShopUsage {
  id          String   @id @default(cuid())
  shop        String
  periodStart DateTime
  wordsUsed   Int      @default(0)
  updatedAt   DateTime @updatedAt

  @@unique([shop, periodStart])
  @@index([shop])
}
```

- [ ] **Step 2: Generate migration and Prisma client**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx prisma migrate dev --name add_billing_models`
Expected: Migration created successfully, Prisma client regenerated.

- [ ] **Step 3: Verify Prisma client types are generated**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx prisma generate`
Expected: `Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(billing): add BillingPlan, ShopSubscription, ShopUsage Prisma models"
```

---

### Task 2: Billing Types and Constants

**Files:**
- Create: `app/services/billing/types.ts`

- [ ] **Step 1: Write the types file**

```typescript
export type SubscriptionStatus = "trial" | "active" | "frozen" | "expired" | "cancelled";

export type FeatureKey =
  | "basic_translation"
  | "rtl_support"
  | "glossary"
  | "premium_ai"
  | "team_collab"
  | "mena_payments"
  | "analytics"
  | "priority_support";

export interface PlanWithFeatures {
  id: string;
  name: string;
  slug: string;
  priceInCents: number;
  trialDays: number;
  maxLanguages: number;
  maxWordsPerMonth: number;
  features: FeatureKey[];
  sortOrder: number;
  isActive: boolean;
}

export interface SubscriptionWithPlan {
  id: string;
  shop: string;
  planId: string | null;
  plan: PlanWithFeatures | null;
  status: SubscriptionStatus;
  shopifyChargeId: string | null;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
}

export interface BillingContext {
  subscription: SubscriptionWithPlan | null;
  currentPlan: PlanWithFeatures | null;
  isGated: boolean;
  isTrial: boolean;
  trialDaysRemaining: number;
  isFrozen: boolean;
}

export const DEFAULT_TRIAL_DAYS = 14;

export const SHOPIFY_SUBSCRIPTION_STATUS_MAP: Record<string, SubscriptionStatus> = {
  ACTIVE: "active",
  FROZEN: "frozen",
  DECLINED: "cancelled",
  EXPIRED: "cancelled",
};
```

- [ ] **Step 2: Commit**

```bash
git add app/services/billing/types.ts
git commit -m "feat(billing): add billing types and constants"
```

---

### Task 3: Billing Service — Core Logic

**Files:**
- Create: `test/unit/billing.test.ts`
- Create: `app/services/billing/index.ts`

- [ ] **Step 1: Write failing tests for billing service**

Create `test/unit/billing.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  formatPriceForShopify,
  parsePlanFeatures,
  getTrialDaysRemaining,
  isTrialExpired,
  isGated,
} from "../../app/services/billing/index";
import type { SubscriptionWithPlan } from "../../app/services/billing/types";

describe("billing service", () => {
  describe("formatPriceForShopify", () => {
    it("converts cents to dollar string", () => {
      expect(formatPriceForShopify(999)).toBe("9.99");
      expect(formatPriceForShopify(2499)).toBe("24.99");
      expect(formatPriceForShopify(5999)).toBe("59.99");
      expect(formatPriceForShopify(0)).toBe("0.00");
      expect(formatPriceForShopify(100)).toBe("1.00");
    });
  });

  describe("parsePlanFeatures", () => {
    it("parses JSON string to feature array", () => {
      const features = parsePlanFeatures('["rtl_support","glossary"]');
      expect(features).toEqual(["rtl_support", "glossary"]);
    });

    it("returns empty array for invalid JSON", () => {
      expect(parsePlanFeatures("invalid")).toEqual([]);
      expect(parsePlanFeatures("")).toEqual([]);
    });
  });

  describe("getTrialDaysRemaining", () => {
    it("returns positive days when trial is active", () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      expect(getTrialDaysRemaining(futureDate)).toBe(5);
    });

    it("returns 0 when trial has expired", () => {
      const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(getTrialDaysRemaining(pastDate)).toBe(0);
    });

    it("returns 0 for null", () => {
      expect(getTrialDaysRemaining(null)).toBe(0);
    });
  });

  describe("isTrialExpired", () => {
    it("returns true when trial end date is in the past", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() - 1000) });
      expect(isTrialExpired(sub)).toBe(true);
    });

    it("returns false when trial end date is in the future", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() + 86400000) });
      expect(isTrialExpired(sub)).toBe(false);
    });

    it("returns false for non-trial status", () => {
      const sub = makeSub({ status: "active" });
      expect(isTrialExpired(sub)).toBe(false);
    });
  });

  describe("isGated", () => {
    it("returns true when no subscription", () => {
      expect(isGated(null)).toBe(true);
    });

    it("returns false for active subscription", () => {
      expect(isGated(makeSub({ status: "active" }))).toBe(false);
    });

    it("returns false for active trial", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() + 86400000) });
      expect(isGated(sub)).toBe(false);
    });

    it("returns true for expired trial", () => {
      const sub = makeSub({ status: "trial", trialEndsAt: new Date(Date.now() - 1000) });
      expect(isGated(sub)).toBe(true);
    });

    it("returns false for frozen (still accessible with warning)", () => {
      expect(isGated(makeSub({ status: "frozen" }))).toBe(false);
    });

    it("returns true for cancelled", () => {
      expect(isGated(makeSub({ status: "cancelled" }))).toBe(true);
    });

    it("returns true for expired", () => {
      expect(isGated(makeSub({ status: "expired" }))).toBe(true);
    });
  });
});

function makeSub(overrides: Partial<SubscriptionWithPlan> = {}): SubscriptionWithPlan {
  return {
    id: "sub_1",
    shop: "test.myshopify.com",
    planId: null,
    plan: null,
    status: "trial",
    shopifyChargeId: null,
    trialStartedAt: new Date(),
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currentPeriodStart: null,
    currentPeriodEnd: null,
    ...overrides,
  };
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx vitest run test/unit/billing.test.ts`
Expected: FAIL -- module `../../app/services/billing/index` not found.

- [ ] **Step 3: Implement the billing service**

Create `app/services/billing/index.ts`:

```typescript
import db from "../../db.server";
import type {
  SubscriptionWithPlan,
  PlanWithFeatures,
  BillingContext,
  FeatureKey,
  SubscriptionStatus,
} from "./types";
import { DEFAULT_TRIAL_DAYS, SHOPIFY_SUBSCRIPTION_STATUS_MAP } from "./types";

// --- Pure functions (tested directly) ---

export function formatPriceForShopify(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function parsePlanFeatures(featuresJson: string): FeatureKey[] {
  try {
    const parsed = JSON.parse(featuresJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getTrialDaysRemaining(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0;
  const diff = trialEndsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialExpired(sub: SubscriptionWithPlan): boolean {
  if (sub.status !== "trial") return false;
  if (!sub.trialEndsAt) return true;
  return sub.trialEndsAt.getTime() < Date.now();
}

export function isGated(sub: SubscriptionWithPlan | null): boolean {
  if (!sub) return true;
  if (sub.status === "active" || sub.status === "frozen") return false;
  if (sub.status === "trial") return isTrialExpired(sub);
  return true; // cancelled, expired
}

// --- Data transformation helpers ---

function toPlanWithFeatures(plan: any): PlanWithFeatures {
  return {
    ...plan,
    features: parsePlanFeatures(plan.features),
  };
}

function toSubscriptionWithPlan(sub: any): SubscriptionWithPlan {
  return {
    ...sub,
    plan: sub.plan ? toPlanWithFeatures(sub.plan) : null,
  };
}

// --- Database operations ---

export async function getSubscription(shop: string): Promise<SubscriptionWithPlan | null> {
  const sub = await db.shopSubscription.findUnique({
    where: { shop },
    include: { plan: true },
  });
  return sub ? toSubscriptionWithPlan(sub) : null;
}

export async function getOrCreateTrialSubscription(shop: string): Promise<SubscriptionWithPlan> {
  const trialDays = parseInt(process.env.DEFAULT_TRIAL_DAYS || "", 10) || DEFAULT_TRIAL_DAYS;
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  // upsert handles race conditions from concurrent tab loads.
  // update: {} means existing records (including cancelled) are NOT modified --
  // this prevents trial abuse on reinstall. Cancelled shops go straight to plan selection.
  const sub = await db.shopSubscription.upsert({
    where: { shop },
    create: {
      shop,
      status: "trial",
      trialStartedAt: now,
      trialEndsAt,
    },
    update: {},
    include: { plan: true },
  });

  return toSubscriptionWithPlan(sub);
}

export async function getBillingContext(shop: string): Promise<BillingContext> {
  const subscription = await getOrCreateTrialSubscription(shop);
  const currentPlan = subscription.plan;

  return {
    subscription,
    currentPlan,
    isGated: isGated(subscription),
    isTrial: subscription.status === "trial",
    trialDaysRemaining: getTrialDaysRemaining(subscription.trialEndsAt),
    isFrozen: subscription.status === "frozen",
  };
}

export async function activateSubscription(
  shop: string,
  planId: string,
  shopifyChargeId: string,
): Promise<SubscriptionWithPlan> {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const sub = await db.shopSubscription.update({
    where: { shop },
    data: {
      planId,
      status: "active",
      shopifyChargeId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    include: { plan: true },
  });

  return toSubscriptionWithPlan(sub);
}

export async function cancelSubscription(shop: string): Promise<void> {
  await db.shopSubscription.updateMany({
    where: { shop },
    data: { status: "cancelled" },
  });
}

export async function updateSubscriptionStatus(
  shop: string,
  shopifyStatus: string,
): Promise<void> {
  const status = SHOPIFY_SUBSCRIPTION_STATUS_MAP[shopifyStatus];
  if (!status) return; // e.g. PENDING -- no change

  await db.shopSubscription.updateMany({
    where: { shop },
    data: { status },
  });
}

// --- Plan queries ---

export async function getActivePlans(): Promise<PlanWithFeatures[]> {
  const plans = await db.billingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return plans.map(toPlanWithFeatures);
}

export async function getAllPlans(): Promise<PlanWithFeatures[]> {
  const plans = await db.billingPlan.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return plans.map(toPlanWithFeatures);
}

export async function getPlanById(id: string): Promise<PlanWithFeatures | null> {
  const plan = await db.billingPlan.findUnique({ where: { id } });
  return plan ? toPlanWithFeatures(plan) : null;
}

export async function upsertPlan(
  id: string | null,
  data: {
    name: string;
    slug: string;
    priceInCents: number;
    trialDays: number;
    maxLanguages: number;
    maxWordsPerMonth: number;
    features: FeatureKey[];
    sortOrder: number;
    isActive: boolean;
  },
): Promise<PlanWithFeatures> {
  const featuresJson = JSON.stringify(data.features);
  const planData = { ...data, features: featuresJson };

  const plan = id
    ? await db.billingPlan.update({ where: { id }, data: planData })
    : await db.billingPlan.create({ data: planData });

  return toPlanWithFeatures(plan);
}

// --- Feature gating ---

export function requirePlanFeature(
  billingContext: BillingContext,
  feature: FeatureKey,
): void {
  if (!billingContext.currentPlan) return; // trial gets all features
  if (!billingContext.currentPlan.features.includes(feature)) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/app/billing?upgrade=true" },
    });
  }
}

// --- Usage tracking ---

export async function checkWordLimit(
  shop: string,
  billingContext: BillingContext,
  wordCount: number,
): Promise<boolean> {
  if (!billingContext.currentPlan) return true; // trial = unlimited
  if (billingContext.currentPlan.maxWordsPerMonth <= 0) return true; // unlimited plan (-1)

  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const usage = await db.shopUsage.findUnique({
    where: { shop_periodStart: { shop, periodStart } },
  });

  const currentUsage = usage?.wordsUsed ?? 0;
  return (currentUsage + wordCount) <= billingContext.currentPlan.maxWordsPerMonth;
}

export async function incrementWordUsage(shop: string, wordCount: number): Promise<void> {
  const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  await db.shopUsage.upsert({
    where: { shop_periodStart: { shop, periodStart } },
    create: { shop, periodStart, wordsUsed: wordCount },
    update: { wordsUsed: { increment: wordCount } },
  });
}

// --- Admin check ---

export function isAdmin(shop: string): boolean {
  const adminShops = (process.env.ADMIN_SHOP_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminShops.includes(shop);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx vitest run test/unit/billing.test.ts`
Expected: All 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/services/billing/index.ts test/unit/billing.test.ts
git commit -m "feat(billing): add billing service with plan queries, gate logic, usage tracking"
```

---

### Task 4: Seed Script for Default Plans

**Files:**
- Create: `app/services/billing/seed-plans.ts`
- Modify: `package.json` (add prisma seed config + tsx dependency)

- [ ] **Step 1: Install tsx as dev dependency**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npm install --save-dev tsx`
Expected: tsx added to devDependencies.

- [ ] **Step 2: Create the seed script**

Create `app/services/billing/seed-plans.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PLANS = [
  {
    name: "Starter",
    slug: "starter",
    priceInCents: 999,
    trialDays: 14,
    maxLanguages: 2,
    maxWordsPerMonth: 5000,
    features: JSON.stringify(["basic_translation", "rtl_support"]),
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Professional",
    slug: "professional",
    priceInCents: 2499,
    trialDays: 14,
    maxLanguages: 10,
    maxWordsPerMonth: 50000,
    features: JSON.stringify([
      "basic_translation",
      "rtl_support",
      "glossary",
      "premium_ai",
    ]),
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    priceInCents: 5999,
    trialDays: 14,
    maxLanguages: -1,
    maxWordsPerMonth: -1,
    features: JSON.stringify([
      "basic_translation",
      "rtl_support",
      "glossary",
      "premium_ai",
      "team_collab",
      "mena_payments",
      "analytics",
      "priority_support",
    ]),
    sortOrder: 3,
    isActive: true,
  },
];

async function seed() {
  console.log("Seeding billing plans...");

  for (const plan of DEFAULT_PLANS) {
    await prisma.billingPlan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan,
    });
    console.log(`  Upserted plan: ${plan.name} ($${(plan.priceInCents / 100).toFixed(2)}/mo)`);
  }

  console.log("Billing plans seeded successfully.");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: Add prisma seed config to package.json**

Add to `package.json` top-level:

```json
"prisma": {
  "seed": "npx tsx app/services/billing/seed-plans.ts"
}
```

- [ ] **Step 4: Run the seed**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx prisma db seed`
Expected: Output showing 3 plans upserted.

- [ ] **Step 5: Commit**

```bash
git add app/services/billing/seed-plans.ts package.json package-lock.json
git commit -m "feat(billing): add seed script for default billing plans (Starter/Pro/Enterprise)"
```

---

### Task 5: Shopify App TOML — Add Subscription Webhook

**Files:**
- Modify: `shopify.app.toml:20` (after existing webhook subscriptions)

- [ ] **Step 1: Add subscription update webhook to toml**

After the existing `app/scopes_update` webhook block in `shopify.app.toml`, add:

```toml
  [[webhooks.subscriptions]]
  topics = ["app_subscriptions/update"]
  uri = "/webhooks/app/subscription_update"
```

- [ ] **Step 2: Commit**

```bash
git add shopify.app.toml
git commit -m "feat(billing): add app_subscriptions/update webhook to shopify.app.toml"
```

---

### Task 6: Subscription Update Webhook Handler

**Files:**
- Create: `app/routes/webhooks.app.subscription_update.tsx`
- Create: `test/integration/billing.test.ts`

- [ ] **Step 1: Write the status mapping test**

Create `test/integration/billing.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { SHOPIFY_SUBSCRIPTION_STATUS_MAP } from "../../app/services/billing/types";

describe("billing integration", () => {
  describe("Shopify status mapping", () => {
    it("maps ACTIVE to active", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["ACTIVE"]).toBe("active");
    });

    it("maps FROZEN to frozen", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["FROZEN"]).toBe("frozen");
    });

    it("maps DECLINED to cancelled", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["DECLINED"]).toBe("cancelled");
    });

    it("maps EXPIRED to cancelled", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["EXPIRED"]).toBe("cancelled");
    });

    it("does not map PENDING", () => {
      expect(SHOPIFY_SUBSCRIPTION_STATUS_MAP["PENDING"]).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Run the test**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx vitest run test/integration/billing.test.ts`
Expected: All 5 tests PASS.

- [ ] **Step 3: Create the webhook route**

Create `app/routes/webhooks.app.subscription_update.tsx`:

```typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { updateSubscriptionStatus } from "../services/billing/index";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (payload && typeof payload === "object" && "app_subscription" in payload) {
    const subscription = (payload as any).app_subscription;
    const status = subscription?.status;

    if (status) {
      await updateSubscriptionStatus(shop, status);
      console.log(`Updated subscription status for ${shop}: ${status}`);
    }
  }

  return new Response();
};
```

- [ ] **Step 4: Commit**

```bash
git add app/routes/webhooks.app.subscription_update.tsx test/integration/billing.test.ts
git commit -m "feat(billing): add subscription update webhook handler with status mapping"
```

---

### Task 7: Modify Uninstall Webhook to Cancel Subscription

**Files:**
- Modify: `app/routes/webhooks.app.uninstalled.tsx`

- [ ] **Step 1: Add subscription cancellation to uninstall handler**

Replace the contents of `app/routes/webhooks.app.uninstalled.tsx`:

```typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { cancelSubscription } from "../services/billing/index";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Cancel billing subscription (record kept for reinstall -- no second trial)
  await cancelSubscription(shop);
  console.log(`Cancelled subscription for ${shop}`);

  return new Response();
};
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/webhooks.app.uninstalled.tsx
git commit -m "feat(billing): cancel subscription on app uninstall"
```

---

### Task 8: Billing Confirmation Route

**Files:**
- Create: `app/routes/app.billing.confirm.tsx`

- [ ] **Step 1: Create the confirmation route**

Create `app/routes/app.billing.confirm.tsx`:

```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  getSubscription,
  activateSubscription,
  getPlanById,
} from "../services/billing/index";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");
  const planId = url.searchParams.get("planId");

  if (!chargeId || !planId) {
    return redirect("/app/billing");
  }

  // Idempotency: check if already processed
  const existing = await getSubscription(session.shop);
  if (existing?.shopifyChargeId === chargeId && existing.status === "active") {
    return redirect("/app");
  }

  // Verify the plan exists
  const plan = await getPlanById(planId);
  if (!plan) {
    return redirect("/app/billing?error=plan_not_found");
  }

  // Verify charge is active via Shopify GraphQL
  const response = await admin.graphql(`
    query {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
        }
      }
    }
  `);

  const data = await response.json();
  const activeSubscriptions =
    data?.data?.currentAppInstallation?.activeSubscriptions ?? [];

  if (activeSubscriptions.length === 0) {
    return redirect("/app/billing?error=charge_not_active");
  }

  await activateSubscription(session.shop, planId, chargeId);

  return redirect("/app");
};
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/app.billing.confirm.tsx
git commit -m "feat(billing): add charge confirmation callback route with planId matching"
```

---

### Task 9: Merchant Billing Page

**Files:**
- Create: `app/routes/app.billing.tsx`

- [ ] **Step 1: Create the billing route**

Create `app/routes/app.billing.tsx`:

```typescript
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page, Card, BlockStack, InlineStack, InlineGrid, Text,
  Badge, Button, Banner, Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  getActivePlans,
  getSubscription,
  formatPriceForShopify,
  getTrialDaysRemaining,
} from "../services/billing/index";
import type { PlanWithFeatures } from "../services/billing/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [plans, subscription] = await Promise.all([
    getActivePlans(),
    getSubscription(session.shop),
  ]);

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const upgrade = url.searchParams.get("upgrade");

  return json({
    plans,
    subscription,
    trialDaysRemaining: subscription
      ? getTrialDaysRemaining(subscription.trialEndsAt)
      : 0,
    error,
    showUpgrade: upgrade === "true",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const planId = formData.get("planId") as string;
  const planName = formData.get("planName") as string;
  const priceInCents = parseInt(formData.get("priceInCents") as string, 10);

  const isTest = process.env.NODE_ENV !== "production";

  // Derive app URL from request rather than relying on env var
  const url = new URL(request.url);
  const appOrigin = url.origin;
  const returnUrl = `${appOrigin}/app/billing/confirm?planId=${encodeURIComponent(planId)}`;

  const response = await admin.graphql(`
    mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $test: Boolean, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        test: $test
        replacementBehavior: APPLY_IMMEDIATELY
        lineItems: $lineItems
      ) {
        appSubscription {
          id
        }
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      name: planName,
      returnUrl,
      test: isTest,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: parseFloat(formatPriceForShopify(priceInCents)),
                currencyCode: "USD",
              },
            },
          },
        },
      ],
    },
  });

  const data = await response.json();
  const { confirmationUrl, userErrors } =
    data?.data?.appSubscriptionCreate ?? {};

  if (userErrors?.length > 0) {
    return json({ error: userErrors[0].message }, { status: 400 });
  }

  if (confirmationUrl) {
    return redirect(confirmationUrl);
  }

  return json({ error: "Failed to create subscription" }, { status: 500 });
};

const FEATURE_LABELS: Record<string, string> = {
  basic_translation: "Basic AI Translation (Google)",
  rtl_support: "RTL Layout Engine",
  glossary: "Brand Glossary & Translation Memory",
  premium_ai: "Premium AI (GPT-4, DeepL)",
  team_collab: "Team Collaboration",
  mena_payments: "MENA Payment Gateways",
  analytics: "Advanced Analytics & ROI",
  priority_support: "Priority Support",
};

export default function BillingPage() {
  const { plans, subscription, trialDaysRemaining, error, showUpgrade } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleSelectPlan = (plan: PlanWithFeatures) => {
    const formData = new FormData();
    formData.set("planId", plan.id);
    formData.set("planName", plan.name);
    formData.set("priceInCents", plan.priceInCents.toString());
    submit(formData, { method: "post" });
  };

  const isCurrentPlan = (plan: PlanWithFeatures) =>
    subscription?.planId === plan.id && subscription?.status === "active";

  return (
    <Page>
      <TitleBar title="Plans & Billing" />
      <BlockStack gap="500">
        {error && (
          <Banner tone="critical" title="Billing Error">
            <p>
              {error === "charge_not_active"
                ? "The charge could not be verified. Please try again."
                : error === "plan_not_found"
                  ? "Plan not found. Please select a plan."
                  : error}
            </p>
          </Banner>
        )}

        {showUpgrade && (
          <Banner tone="warning" title="Upgrade Required">
            <p>This feature requires a higher plan. Choose a plan below to unlock it.</p>
          </Banner>
        )}

        {subscription?.status === "trial" && trialDaysRemaining > 0 && (
          <Banner tone="info" title="Free Trial Active">
            <p>
              You have {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} remaining
              in your free trial. Choose a plan to continue after the trial ends.
            </p>
          </Banner>
        )}

        {subscription?.status === "trial" && trialDaysRemaining === 0 && (
          <Banner tone="critical" title="Trial Expired">
            <p>Your free trial has ended. Select a plan below to continue using the app.</p>
          </Banner>
        )}

        {subscription?.status === "cancelled" && (
          <Banner tone="warning" title="Subscription Cancelled">
            <p>Your subscription has been cancelled. Select a plan to reactivate.</p>
          </Banner>
        )}

        <InlineGrid columns={plans.length} gap="400">
          {plans.map((plan: PlanWithFeatures) => (
            <Card key={plan.id}>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingLg">{plan.name}</Text>
                    {isCurrentPlan(plan) && <Badge tone="success">Current Plan</Badge>}
                  </InlineStack>
                </BlockStack>

                <BlockStack gap="100">
                  <InlineStack gap="100" blockAlign="end">
                    <Text as="span" variant="heading2xl">
                      ${(plan.priceInCents / 100).toFixed(2)}
                    </Text>
                    <Text as="span" variant="bodyMd" tone="subdued">/month</Text>
                  </InlineStack>
                </BlockStack>

                <Text as="p" variant="bodySm" tone="subdued">
                  {plan.maxLanguages === -1 ? "Unlimited" : plan.maxLanguages} language
                  {plan.maxLanguages !== 1 ? "s" : ""}
                  {" · "}
                  {plan.maxWordsPerMonth === -1
                    ? "Unlimited"
                    : plan.maxWordsPerMonth.toLocaleString()}{" "}
                  words/mo
                </Text>

                <Button
                  variant="primary"
                  fullWidth
                  disabled={isCurrentPlan(plan) || isSubmitting}
                  onClick={() => handleSelectPlan(plan)}
                  loading={isSubmitting}
                >
                  {isCurrentPlan(plan) ? "Current Plan" : "Choose Plan"}
                </Button>

                <Divider />

                <BlockStack gap="200">
                  {plan.features.map((feature: string) => (
                    <InlineStack gap="200" key={feature} wrap={false}>
                      <Text as="span" variant="bodyMd" tone="success">
                        ✓
                      </Text>
                      <Text as="span" variant="bodyMd">
                        {FEATURE_LABELS[feature] || feature}
                      </Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          ))}
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/app.billing.tsx
git commit -m "feat(billing): add merchant billing page with plan selection and Shopify Billing API"
```

---

### Task 10: Admin Billing Configuration Page

**Files:**
- Create: `app/routes/app.internal.billing.tsx`

- [ ] **Step 1: Create the admin billing route**

Create `app/routes/app.internal.billing.tsx`:

```typescript
import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page, Card, BlockStack, InlineStack, Text,
  TextField, Checkbox, Button, DataTable, Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getAllPlans, upsertPlan, isAdmin } from "../services/billing/index";
import type { FeatureKey } from "../services/billing/types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!isAdmin(session.shop)) {
    throw new Response("Not Found", { status: 404 });
  }

  const plans = await getAllPlans();
  return json({ plans, shop: session.shop });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  if (!isAdmin(session.shop)) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "upsert") {
    const id = (formData.get("id") as string) || null;
    const featuresRaw = formData.get("features") as string;

    await upsertPlan(id, {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      priceInCents: parseInt(formData.get("priceInCents") as string, 10),
      trialDays: parseInt(formData.get("trialDays") as string, 10),
      maxLanguages: parseInt(formData.get("maxLanguages") as string, 10),
      maxWordsPerMonth: parseInt(formData.get("maxWordsPerMonth") as string, 10),
      features: JSON.parse(featuresRaw) as FeatureKey[],
      sortOrder: parseInt(formData.get("sortOrder") as string, 10),
      isActive: formData.get("isActive") === "true",
    });
  }

  return json({ success: true });
};

const ALL_FEATURES: { key: FeatureKey; label: string }[] = [
  { key: "basic_translation", label: "Basic Translation" },
  { key: "rtl_support", label: "RTL Support" },
  { key: "glossary", label: "Glossary" },
  { key: "premium_ai", label: "Premium AI" },
  { key: "team_collab", label: "Team Collaboration" },
  { key: "mena_payments", label: "MENA Payments" },
  { key: "analytics", label: "Analytics" },
  { key: "priority_support", label: "Priority Support" },
];

export default function AdminBillingPage() {
  const { plans } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    priceInCents: "0",
    trialDays: "14",
    maxLanguages: "2",
    maxWordsPerMonth: "5000",
    features: [] as FeatureKey[],
    sortOrder: "0",
    isActive: true,
  });

  const startEdit = (plan: any) => {
    setEditing(plan.id);
    setForm({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      priceInCents: plan.priceInCents.toString(),
      trialDays: plan.trialDays.toString(),
      maxLanguages: plan.maxLanguages.toString(),
      maxWordsPerMonth: plan.maxWordsPerMonth.toString(),
      features: plan.features,
      sortOrder: plan.sortOrder.toString(),
      isActive: plan.isActive,
    });
  };

  const startNew = () => {
    setEditing("new");
    setForm({
      id: "",
      name: "",
      slug: "",
      priceInCents: "0",
      trialDays: "14",
      maxLanguages: "2",
      maxWordsPerMonth: "5000",
      features: [],
      sortOrder: ((plans.length + 1) * 10).toString(),
      isActive: true,
    });
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.set("intent", "upsert");
    if (form.id) formData.set("id", form.id);
    formData.set("name", form.name);
    formData.set("slug", form.slug);
    formData.set("priceInCents", form.priceInCents);
    formData.set("trialDays", form.trialDays);
    formData.set("maxLanguages", form.maxLanguages);
    formData.set("maxWordsPerMonth", form.maxWordsPerMonth);
    formData.set("features", JSON.stringify(form.features));
    formData.set("sortOrder", form.sortOrder);
    formData.set("isActive", form.isActive.toString());
    submit(formData, { method: "post" });
    setEditing(null);
  };

  const toggleFeature = (key: FeatureKey) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(key)
        ? prev.features.filter((f) => f !== key)
        : [...prev.features, key],
    }));
  };

  return (
    <Page>
      <TitleBar title="Billing Admin (Internal)" />
      <BlockStack gap="500">
        <Banner tone="warning">
          <p>This page is only visible to admin shops. Changes affect new subscriptions.</p>
        </Banner>

        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">Plans</Text>
              <Button onClick={startNew} size="slim">Add Plan</Button>
            </InlineStack>

            <DataTable
              columnContentTypes={["text", "text", "numeric", "numeric", "numeric", "text", "text"]}
              headings={["Name", "Slug", "Price", "Languages", "Words/mo", "Status", "Actions"]}
              rows={plans.map((plan: any) => [
                plan.name,
                plan.slug,
                `$${(plan.priceInCents / 100).toFixed(2)}`,
                plan.maxLanguages === -1 ? "Unlimited" : plan.maxLanguages,
                plan.maxWordsPerMonth === -1 ? "Unlimited" : plan.maxWordsPerMonth.toLocaleString(),
                plan.isActive ? "Active" : "Inactive",
                <Button key={plan.id} onClick={() => startEdit(plan)} size="slim">
                  Edit
                </Button>,
              ])}
            />
          </BlockStack>
        </Card>

        {editing && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                {form.id ? `Edit: ${form.name}` : "New Plan"}
              </Text>
              <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="off" />
              <TextField label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} autoComplete="off" />
              <TextField label="Price (cents)" type="number" value={form.priceInCents} onChange={(v) => setForm({ ...form, priceInCents: v })} autoComplete="off" />
              <TextField label="Trial Days" type="number" value={form.trialDays} onChange={(v) => setForm({ ...form, trialDays: v })} autoComplete="off" />
              <TextField label="Max Languages (-1 = unlimited)" type="number" value={form.maxLanguages} onChange={(v) => setForm({ ...form, maxLanguages: v })} autoComplete="off" />
              <TextField label="Max Words/Month (-1 = unlimited)" type="number" value={form.maxWordsPerMonth} onChange={(v) => setForm({ ...form, maxWordsPerMonth: v })} autoComplete="off" />
              <TextField label="Sort Order" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} autoComplete="off" />

              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">Features</Text>
                {ALL_FEATURES.map((f) => (
                  <Checkbox
                    key={f.key}
                    label={f.label}
                    checked={form.features.includes(f.key)}
                    onChange={() => toggleFeature(f.key)}
                  />
                ))}
              </BlockStack>

              <Checkbox label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />

              <InlineStack gap="200">
                <Button variant="primary" onClick={handleSave} loading={isSubmitting}>Save</Button>
                <Button onClick={() => setEditing(null)}>Cancel</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/routes/app.internal.billing.tsx
git commit -m "feat(billing): add admin-only plan configuration page"
```

---

### Task 11: Modify app.tsx — Gate Logic, Trial Banner, Delete Old Pricing

**Files:**
- Modify: `app/routes/app.tsx`
- Delete: `app/routes/app.pricing.tsx`

- [ ] **Step 1: Delete the old pricing page**

Run: `rm /Users/shaker/shopify-dev/rtl-storefront/app/routes/app.pricing.tsx`

- [ ] **Step 2: Replace app.tsx with gate logic, context, and trial banner**

Replace the full contents of `app/routes/app.tsx`:

```typescript
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { Banner } from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { getBillingContext } from "../services/billing/index";
import type { BillingContext } from "../services/billing/types";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const billing = await getBillingContext(session.shop);

  const url = new URL(request.url);

  // Skip gate for billing routes (must be accessible to select/confirm plans)
  if (!url.pathname.startsWith("/app/billing")) {
    if (billing.isGated) {
      return redirect("/app/billing");
    }
  }

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    billing,
  });
};

export default function App() {
  const { apiKey, billing } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Dashboard</Link>
        <Link to="/app/translate">Translate</Link>
        <Link to="/app/rtl-settings">RTL Settings</Link>
        <Link to="/app/glossary">Glossary</Link>
        <Link to="/app/coverage">Coverage</Link>
        <Link to="/app/analytics">Analytics</Link>
        <Link to="/app/payments">MENA Payments</Link>
        <Link to="/app/billing">Plans & Billing</Link>
      </NavMenu>
      {billing.isTrial && billing.trialDaysRemaining > 0 && (
        <div style={{ padding: "0 20px" }}>
          <Banner tone="info">
            <p>
              Free trial: {billing.trialDaysRemaining} day
              {billing.trialDaysRemaining !== 1 ? "s" : ""} remaining.{" "}
              <Link to="/app/billing">Choose a plan</Link>
            </p>
          </Banner>
        </div>
      )}
      {billing.isFrozen && (
        <div style={{ padding: "0 20px" }}>
          <Banner tone="warning">
            <p>
              There is a payment issue with your subscription. Please update
              your billing in Shopify Admin.
            </p>
          </Banner>
        </div>
      )}
      <Outlet context={billing satisfies BillingContext} />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
```

- [ ] **Step 3: Commit**

```bash
git rm app/routes/app.pricing.tsx
git add app/routes/app.tsx
git commit -m "feat(billing): add subscription gate, trial banner, replace pricing nav with billing"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Run all billing tests**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx vitest run test/unit/billing.test.ts test/integration/billing.test.ts`
Expected: All tests PASS.

- [ ] **Step 2: Run lint**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npm run lint`
Expected: No errors.

- [ ] **Step 3: Run build to check for compilation errors**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Verify Prisma schema is valid**

Run: `cd /Users/shaker/shopify-dev/rtl-storefront && npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid.`

- [ ] **Step 5: Final commit if any lint/build fixes were needed**

```bash
git add -A
git commit -m "fix(billing): address lint and build issues"
```
