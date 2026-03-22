import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} for ${shop}`, payload?.id);

  switch (topic) {
    case "COLLECTIONS_CREATE":
      // Queue new collection for translation
      console.log(
        `New collection created: ${payload?.title} — queue for translation`,
      );
      break;
    case "COLLECTIONS_UPDATE":
      // Check if translatable fields changed
      console.log(
        `Collection updated: ${payload?.title} — check translations`,
      );
      break;
    case "COLLECTIONS_DELETE":
      // Clean up translations
      console.log(
        `Collection deleted: ${payload?.id} — cleanup translations`,
      );
      break;
  }

  return new Response(null, { status: 200 });
};
