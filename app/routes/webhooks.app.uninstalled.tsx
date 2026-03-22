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
