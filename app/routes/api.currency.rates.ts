/**
 * Currency Rates API
 *
 * GET /api/currency/rates
 *
 * Returns the current exchange rates for all configured currencies.
 * Rates are served from cache (SQLite) when fresh; otherwise fetched
 * and cached before responding.
 *
 * Query params:
 *   base      — ISO 4217 base currency code (default: "USD")
 *   targets   — comma-separated target codes  (default: all POPULAR_CURRENCIES)
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticateWithTenant } from "../utils/auth.server";
import {
  getExchangeRates,
  type ExchangeRate,
} from "../services/currency/exchange";
import { POPULAR_CURRENCIES, DEFAULT_CURRENCY } from "../services/currency/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RateResponse {
  base: string;
  timestamp: string;
  rates: Record<string, RateEntry>;
}

interface RateEntry {
  rate: number;
  source: string;
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// GET loader
// ---------------------------------------------------------------------------

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Authenticate with Shopify Admin
  await authenticateWithTenant(request);

  const url = new URL(request.url);

  // Resolve base currency
  const base = (url.searchParams.get("base") ?? DEFAULT_CURRENCY).toUpperCase();

  // Resolve target currencies
  const targetsParam = url.searchParams.get("targets");
  const targets: string[] = targetsParam
    ? targetsParam
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean)
    : POPULAR_CURRENCIES.filter((c) => c !== base);

  // Remove base from targets (same-currency rate is always 1)
  const filteredTargets = targets.filter((t) => t !== base);

  let ratesMap: Map<string, ExchangeRate>;
  try {
    ratesMap = await getExchangeRates(base, filteredTargets);
  } catch (err) {
    console.error("[api.currency.rates] Failed to fetch exchange rates:", err);
    return json(
      { error: "Failed to retrieve exchange rates. Please try again later." },
      { status: 503 }
    );
  }

  // Build response payload
  const rates: Record<string, RateEntry> = {
    // Always include base → base as 1
    [base]: {
      rate: 1,
      source: "identity",
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    },
  };

  for (const [currency, entry] of ratesMap.entries()) {
    rates[currency] = {
      rate: entry.rate,
      source: entry.source,
      expiresAt: entry.expiresAt.toISOString(),
    };
  }

  const payload: RateResponse = {
    base,
    timestamp: new Date().toISOString(),
    rates,
  };

  return json(payload, {
    headers: {
      // Allow browsers / CDNs to cache for up to 5 minutes
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
    },
  });
};
