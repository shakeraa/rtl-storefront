/**
 * System Health Check Service (T0381)
 *
 * Provides comprehensive health status for all system components:
 * database, Shopify API connectivity, and the translation engine.
 */

import db from "../../db.server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CheckStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthCheck {
  name: string;
  status: CheckStatus;
  latencyMs?: number;
  message?: string;
}

export interface HealthStatus {
  status: CheckStatus;
  checks: HealthCheck[];
  uptime: number;
  version: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

/**
 * Ping Prisma and measure round-trip latency.
 */
export async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return {
      name: "database",
      status: latencyMs < 500 ? "healthy" : "degraded",
      latencyMs,
      message: `SQLite responded in ${latencyMs}ms`,
    };
  } catch (err) {
    return {
      name: "database",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}

/**
 * Verify basic Shopify API connectivity by checking that the required
 * environment variables are present and well-formed. A full HTTP probe
 * would require a session token and is therefore reserved for
 * authenticated callers; this check is intentionally lightweight so the
 * health endpoint can remain unauthenticated.
 */
export async function checkShopifyApi(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return {
        name: "shopify_api",
        status: "unhealthy",
        latencyMs: Date.now() - start,
        message: "SHOPIFY_API_KEY or SHOPIFY_API_SECRET not configured",
      };
    }

    // Key format: 32-character hex string (Shopify convention)
    const keyLooksValid = /^[a-f0-9]{32}$/.test(apiKey);
    return {
      name: "shopify_api",
      status: keyLooksValid ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
      message: keyLooksValid
        ? "API credentials present and well-formed"
        : "API key format unexpected — connectivity not guaranteed",
    };
  } catch (err) {
    return {
      name: "shopify_api",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message: err instanceof Error ? err.message : "Unknown Shopify API error",
    };
  }
}

/**
 * Verify the translation engine is available by checking that either the
 * built-in translation module or an external API key is configured.
 */
export async function checkTranslationService(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // Check for any of the supported translation provider keys
    const hasProvider =
      Boolean(process.env.OPENAI_API_KEY) ||
      Boolean(process.env.GOOGLE_TRANSLATE_API_KEY) ||
      Boolean(process.env.DEEPL_API_KEY) ||
      Boolean(process.env.TRANSLATION_ENGINE);

    if (!hasProvider) {
      return {
        name: "translation_service",
        status: "degraded",
        latencyMs: Date.now() - start,
        message:
          "No translation provider API key found; only built-in/mock engine available",
      };
    }

    return {
      name: "translation_service",
      status: "healthy",
      latencyMs: Date.now() - start,
      message: "Translation engine configured and available",
    };
  } catch (err) {
    return {
      name: "translation_service",
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message:
        err instanceof Error ? err.message : "Unknown translation service error",
    };
  }
}

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

const APP_VERSION = "1.0.0";
const START_TIME = Date.now();

/**
 * Run all health checks and return an aggregated status object.
 *
 * Status precedence: unhealthy > degraded > healthy
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const [dbCheck, shopifyCheck, translationCheck] = await Promise.all([
    checkDatabase(),
    checkShopifyApi(),
    checkTranslationService(),
  ]);

  const checks: HealthCheck[] = [dbCheck, shopifyCheck, translationCheck];

  const overallStatus: CheckStatus = checks.some(
    (c) => c.status === "unhealthy",
  )
    ? "unhealthy"
    : checks.some((c) => c.status === "degraded")
      ? "degraded"
      : "healthy";

  return {
    status: overallStatus,
    checks,
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  };
}
