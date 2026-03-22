/**
 * API v1 — Status (T0020)
 *
 * GET /api/v1/status
 *
 * Returns translation coverage stats, queue status, and a health check.
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  calculateCoverage,
  getCoverageLevel,
  getCoverageSummary,
  type CoverageData,
} from "../services/coverage";

// ---------------------------------------------------------------------------
// GET loader
// ---------------------------------------------------------------------------

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? undefined;

  // Build a basic health-check response
  const healthCheck = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    shop: session.shop,
  };

  // Coverage stats — in a real implementation these would come from the
  // database. We return the helper functions' outputs so downstream
  // consumers get properly typed data.
  const coverageList: CoverageData[] = [];

  // If a specific locale was requested, return a skeleton for it
  if (locale) {
    coverageList.push({
      locale,
      totalResources: 0,
      translatedResources: 0,
      coveragePercent: calculateCoverage(0, 0),
      byResourceType: {},
      trend: { direction: "stable", changePercent: 0, period: "week" },
    });
  }

  const summary = getCoverageSummary(coverageList);

  // Queue status placeholder — would normally query a job queue table
  const queueStatus = {
    pendingJobs: 0,
    runningJobs: 0,
    failedJobs: 0,
    completedLast24h: 0,
  };

  return json({
    health: healthCheck,
    coverage: {
      locales: coverageList.map((c) => ({
        ...c,
        level: getCoverageLevel(c.coveragePercent),
      })),
      summary,
    },
    queue: queueStatus,
  });
}
