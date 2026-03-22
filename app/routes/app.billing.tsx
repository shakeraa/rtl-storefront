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
  getPlanById,
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

  // Look up plan from DB — never trust client-side price/name
  const plan = await getPlanById(planId);
  if (!plan) {
    return json({ error: "Plan not found" }, { status: 400 });
  }

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
      name: plan.name,
      returnUrl,
      test: isTest,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: parseFloat(formatPriceForShopify(plan.priceInCents)),
                currencyCode: "USD",
              },
            },
          },
        },
      ],
    },
  });

  const data = await response.json();
  console.log("Billing API response:", JSON.stringify(data, null, 2));

  const result = data?.data?.appSubscriptionCreate;
  const { confirmationUrl, userErrors } = result ?? {};

  if (userErrors?.length > 0) {
    console.error("Billing user errors:", userErrors);
    return redirect(`/app/billing?error=${encodeURIComponent(userErrors[0].message)}`);
  }

  if (confirmationUrl) {
    console.log("Redirecting to confirmation:", confirmationUrl);
    return redirect(confirmationUrl);
  }

  console.error("No confirmation URL returned. Full response:", JSON.stringify(data));
  return redirect("/app/billing?error=no_confirmation_url");
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

        <InlineGrid columns={Math.min(plans.length, 3)} gap="400">
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
