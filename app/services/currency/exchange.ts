/**
 * Exchange Rate Service
 * Fetches live exchange rates from open.er-api.com with in-memory caching.
 * Falls back to hardcoded approximate rates when the API is unavailable.
 */

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  source: string;
  timestamp: Date;
  expiresAt: Date;
}

export interface ExchangeRateHistory {
  date: Date;
  rate: number;
}

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

interface CachedRates {
  rates: Record<string, number>;
  base: string;
  fetchedAt: number;
}

let rateCache: CachedRates | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Manual rate overrides keyed by "FROM->TO".
 * These take priority over API / fallback rates.
 */
const manualOverrides = new Map<string, ExchangeRate>();

// ---------------------------------------------------------------------------
// Fallback rates (approximate, used when the API is unreachable)
// All rates are expressed as 1 USD = X target.
// ---------------------------------------------------------------------------

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.31,
  BHD: 0.38,
  QAR: 3.64,
  OMR: 0.38,
  EGP: 49.5,
  JOD: 0.71,
  ILS: 3.65,
  TRY: 36.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.5,
  CAD: 1.35,
  AUD: 1.52,
  CHF: 0.88,
  CNY: 7.19,
  INR: 83.1,
};

// ---------------------------------------------------------------------------
// Core: fetch live rates from open.er-api.com (free, no key required)
// ---------------------------------------------------------------------------

async function fetchLiveRates(base: string = "USD"): Promise<{ rates: Record<string, number>; source: string }> {
  // Return cache if still fresh
  if (rateCache && rateCache.base === base && Date.now() - rateCache.fetchedAt < CACHE_TTL) {
    return { rates: rateCache.rates, source: "open.er-api.com (cached)" };
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data = await response.json();
    if (data.result === "success" && data.rates) {
      rateCache = { rates: data.rates, base, fetchedAt: Date.now() };
      return { rates: data.rates, source: "open.er-api.com" };
    }
    throw new Error("Invalid API response");
  } catch (error) {
    console.warn("Currency API unavailable, using fallback rates:", error);
    return { rates: FALLBACK_RATES, source: "fallback" };
  }
}

/**
 * Compute a cross-rate between two currencies using a shared rate table.
 * If the table is based on USD and we need EUR -> SAR, we do SAR/EUR.
 */
function computeCrossRate(
  rates: Record<string, number>,
  base: string,
  from: string,
  to: string,
): number {
  // If the rates table is already based on `from`, just read the target.
  if (base === from) {
    return rates[to] ?? 1;
  }

  // Otherwise compute a cross-rate via the table base.
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return 1;
  return toRate / fromRate;
}

// ---------------------------------------------------------------------------
// Public API — same signatures as the original module
// ---------------------------------------------------------------------------

/**
 * Get current exchange rate.
 * Checks manual overrides first, then live API (with cache), then fallback.
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  options: { skipCache?: boolean } = {},
): Promise<ExchangeRate> {
  // Same currency — trivial
  if (fromCurrency === toCurrency) {
    return {
      from: fromCurrency,
      to: toCurrency,
      rate: 1,
      source: "identity",
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL),
    };
  }

  // Check manual override
  const overrideKey = `${fromCurrency}->${toCurrency}`;
  const override = manualOverrides.get(overrideKey);
  if (override && new Date() < override.expiresAt) {
    return override;
  }

  // If skipCache requested, invalidate our in-memory cache
  if (options.skipCache) {
    rateCache = null;
  }

  // Fetch live (or cached) rates based on USD, then compute cross-rate
  const { rates, source } = await fetchLiveRates("USD");
  const rate = computeCrossRate(rates, "USD", fromCurrency, toCurrency);

  return {
    from: fromCurrency,
    to: toCurrency,
    rate: parseFloat(rate.toFixed(6)),
    source,
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + CACHE_TTL),
  };
}

/**
 * Get multiple exchange rates at once.
 */
export async function getExchangeRates(
  fromCurrency: string,
  toCurrencies: string[],
): Promise<Map<string, ExchangeRate>> {
  const rates = new Map<string, ExchangeRate>();

  // Fetch once, then compute each target — avoids N API calls.
  const { rates: rateTable, source } = await fetchLiveRates("USD");

  for (const toCurrency of toCurrencies) {
    if (fromCurrency === toCurrency) {
      rates.set(toCurrency, {
        from: fromCurrency,
        to: toCurrency,
        rate: 1,
        source: "identity",
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + CACHE_TTL),
      });
      continue;
    }

    // Check manual override first
    const overrideKey = `${fromCurrency}->${toCurrency}`;
    const override = manualOverrides.get(overrideKey);
    if (override && new Date() < override.expiresAt) {
      rates.set(toCurrency, override);
      continue;
    }

    const rate = computeCrossRate(rateTable, "USD", fromCurrency, toCurrency);
    rates.set(toCurrency, {
      from: fromCurrency,
      to: toCurrency,
      rate: parseFloat(rate.toFixed(6)),
      source,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL),
    });
  }

  return rates;
}

/**
 * Get exchange rate history.
 *
 * NOTE: Real historical rates require a paid API such as Fixer.io or
 * CurrencyLayer. This implementation generates simulated history using the
 * current live rate as the baseline so the most-recent data point is accurate.
 */
export async function getRateHistory(
  fromCurrency: string,
  toCurrency: string,
  days: number = 30,
): Promise<ExchangeRateHistory[]> {
  // Get the real current rate to anchor the simulated history
  const current = await getExchangeRate(fromCurrency, toCurrency);
  const baseRate = current.rate;

  const history: ExchangeRateHistory[] = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Simulated variation (seeded loosely by day index for consistency)
    const variation = i === 0 ? 0 : (Math.sin(i * 0.7) * 0.03 + (Math.cos(i * 1.3) * 0.02));
    const rate = baseRate * (1 + variation);

    history.push({
      date,
      rate: parseFloat(rate.toFixed(6)),
    });
  }

  return history;
}

/**
 * Get rate trend (increasing, decreasing, stable).
 */
export function getRateTrend(
  history: ExchangeRateHistory[],
): "increasing" | "decreasing" | "stable" {
  if (history.length < 2) return "stable";

  const first = history[0].rate;
  const last = history[history.length - 1].rate;
  const change = ((last - first) / first) * 100;

  if (change > 2) return "increasing";
  if (change < -2) return "decreasing";
  return "stable";
}

/**
 * Set a manual exchange rate override (stored in memory).
 */
export async function setManualRate(
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  expiresAt?: Date,
): Promise<ExchangeRate> {
  const exchangeRate: ExchangeRate = {
    from: fromCurrency,
    to: toCurrency,
    rate,
    source: "manual",
    timestamp: new Date(),
    expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60_000), // 24 hours default
  };

  manualOverrides.set(`${fromCurrency}->${toCurrency}`, exchangeRate);

  return exchangeRate;
}

/**
 * Clear a manual override so the service falls back to API rates.
 */
export async function clearManualRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<void> {
  manualOverrides.delete(`${fromCurrency}->${toCurrency}`);
}

/**
 * Get all active rates (manual overrides that haven't expired).
 */
export async function getAllActiveRates(): Promise<ExchangeRate[]> {
  const now = new Date();
  const active: ExchangeRate[] = [];

  manualOverrides.forEach((rate) => {
    if (rate.expiresAt > now) {
      active.push(rate);
    }
  });

  return active;
}

/**
 * Update rates for all configured currency pairs.
 * Forces a fresh fetch from the API.
 */
export async function updateAllRates(
  baseCurrency: string,
  targetCurrencies: string[],
): Promise<Map<string, ExchangeRate>> {
  // Invalidate cache to force a fresh fetch
  rateCache = null;

  const rates = await getExchangeRates(baseCurrency, targetCurrencies);
  return rates;
}
