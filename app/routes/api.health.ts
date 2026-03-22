/**
 * GET /api/health
 *
 * Public health endpoint — no authentication required.
 * Returns 200 for healthy/degraded, 503 for unhealthy.
 */

import { json } from "@remix-run/node";
import { getHealthStatus } from "../services/system/health-check";

export async function loader() {
  const health = await getHealthStatus();

  const httpStatus = health.status === "unhealthy" ? 503 : 200;

  return json(health, { status: httpStatus });
}
