import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { runDatabaseMaintenance } from "../utils/db-maintenance.server";

export async function action({ request }: ActionFunctionArgs) {
  // Only allow authenticated admin users
  await authenticate.admin(request);

  const results = await runDatabaseMaintenance();

  return json({
    success: true,
    cleaned: results,
    timestamp: new Date().toISOString(),
  });
}
