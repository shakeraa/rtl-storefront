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
