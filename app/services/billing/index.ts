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
