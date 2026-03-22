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
