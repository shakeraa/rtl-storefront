import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { handleProductCreate, handleProductUpdate } from "../services/sync/webhook-handler";
import { contentTranslator } from "../services/content-translator/index";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} for ${shop}`, payload?.id);

  switch (topic) {
    case "PRODUCTS_CREATE":
      console.log(`New product created: ${payload?.title} — queue for translation`);
      try {
        await handleProductCreate(shop, payload);
      } catch (error) {
        console.error(`[webhook] Failed to process ${topic}:`, error);
      }
      break;
    case "PRODUCTS_UPDATE":
      console.log(`Product updated: ${payload?.title} — check translations`);
      try {
        await handleProductUpdate(shop, payload);
      } catch (error) {
        console.error(`[webhook] Failed to process ${topic}:`, error);
      }
      break;
    case "PRODUCTS_DELETE":
      console.log(`Product deleted: ${payload?.id} — cleanup translations`);
      try {
        contentTranslator.invalidateCache(`product.gid://shopify/Product/${payload?.id}`);
      } catch (error) {
        console.error(`[webhook] Failed to process ${topic}:`, error);
      }
      break;
  }

  return new Response(null, { status: 200 });
};
