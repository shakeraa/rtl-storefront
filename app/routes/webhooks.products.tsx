import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`[webhook] ${topic} for ${shop}`, payload?.id);

  switch (topic) {
    case "PRODUCTS_CREATE":
      // Queue new product for translation
      console.log(
        `New product created: ${payload?.title} — queue for translation`,
      );
      break;
    case "PRODUCTS_UPDATE":
      // Check if translatable fields changed
      console.log(
        `Product updated: ${payload?.title} — check translations`,
      );
      break;
    case "PRODUCTS_DELETE":
      // Clean up translations
      console.log(
        `Product deleted: ${payload?.id} — cleanup translations`,
      );
      break;
  }

  return new Response(null, { status: 200 });
};
