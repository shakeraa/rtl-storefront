/**
 * POST /api/privacy/delete
 *
 * GDPR Right to Erasure endpoint for the authenticated shop.
 *
 * Body (JSON, optional):
 *   { "scheduleAfterDays": number }  — schedule deletion instead of immediate
 *
 * Responds with JSON:
 *   Immediate: { success: true, deletedCounts: {...} }
 *   Scheduled: { success: true, scheduled: true, executeAfterDays: number }
 */

import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { deleteShopData, scheduleDataDeletion } from "../services/privacy";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Parse optional body
  let scheduleAfterDays: number | undefined;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json() as Record<string, unknown>;
      if (typeof body.scheduleAfterDays === "number" && body.scheduleAfterDays > 0) {
        scheduleAfterDays = body.scheduleAfterDays;
      }
    }
  } catch {
    // Body parsing is best-effort; proceed with immediate deletion
  }

  if (scheduleAfterDays !== undefined) {
    await scheduleDataDeletion(shop, scheduleAfterDays);
    return json({
      success: true,
      scheduled: true,
      executeAfterDays: scheduleAfterDays,
    });
  }

  const result = await deleteShopData(shop);
  return json({
    success: true,
    deletedCounts: result.deletedCounts,
    deletedAt: result.deletedAt,
  });
}
