import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { handleCollectionUpdate } from "../services/sync/webhook-handler";
import { contentTranslator } from "../services/content-translator/index";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} for ${shop}`, payload?.id);

  switch (topic) {
    case "COLLECTIONS_CREATE":
      console.log(`New collection created: ${payload?.title} — queue for translation`);
      try {
        await handleCollectionUpdate(shop, payload);
      } catch (error) {
        console.error(`[webhook] Failed to process ${topic}:`, error);
      }
      break;
    case "COLLECTIONS_UPDATE":
      console.log(`Collection updated: ${payload?.title} — check translations`);
      try {
        await handleCollectionUpdate(shop, payload);
      } catch (error) {
        console.error(`[webhook] Failed to process ${topic}:`, error);
      }
      break;
    case "COLLECTIONS_DELETE":
      console.log(`Collection deleted: ${payload?.id} — cleanup translations`);
      try {
        contentTranslator.invalidateCache(`collection.gid://shopify/Collection/${payload?.id}`);
      } catch (error) {
        console.error(`[webhook] Failed to process ${topic}:`, error);
      }
      break;
  }

  return new Response(null, { status: 200 });
};
