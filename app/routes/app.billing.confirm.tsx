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

  // Validate that at least one active subscription matches the plan name
  const matchingSub = activeSubscriptions.find(
    (sub: any) => sub.name === plan.name && sub.status === "ACTIVE"
  );

  if (!matchingSub) {
    return redirect("/app/billing?error=charge_not_active");
  }

  await activateSubscription(session.shop, planId, chargeId);

  return redirect("/app");
};
