import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  handleProductCreate,
  handleProductUpdate,
  handleProductDelete,
  handleCollectionUpdate,
} from "../services/automation/webhook-handler";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhooks.shopify.$] ${topic} for ${shop}`);

  switch (topic) {
    case "PRODUCTS_CREATE":
      await handleProductCreate(shop, payload as Record<string, unknown>);
      break;
    case "PRODUCTS_UPDATE":
      await handleProductUpdate(shop, payload as Record<string, unknown>);
      break;
    case "PRODUCTS_DELETE":
      await handleProductDelete(shop, payload as Record<string, unknown>);
      break;
    case "COLLECTIONS_UPDATE":
      await handleCollectionUpdate(shop, payload as Record<string, unknown>);
      break;
    default:
      console.log(`[webhooks.shopify.$] Unhandled topic: ${topic}`);
  }

  return new Response(null, { status: 200 });
};
