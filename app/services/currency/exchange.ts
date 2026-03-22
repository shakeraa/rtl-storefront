/**
 * Exchange Rate Service
 * Manages real-time and cached exchange rates
 */

import { db } from '../../db.server';

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

// Cache duration in minutes
const DEFAULT_CACHE_DURATION = 60;

/**
 * Get current exchange rate
 * First checks cache, then fetches from API if needed
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  options: { skipCache?: boolean } = {}
): Promise<ExchangeRate> {
  const { skipCache = false } = options;
  
  // Same currency
  if (fromCurrency === toCurrency) {
    return {
      from: fromCurrency,
      to: toCurrency,
      rate: 1,
      source: 'identity',
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + DEFAULT_CACHE_DURATION * 60000),
    };
  }
  
  // Check cache first
  if (!skipCache) {
    const cached = await getCachedRate(fromCurrency, toCurrency);
    if (cached && !isExpired(cached)) {
      return cached;
    }
  }
  
  // Fetch from API
  const rate = await fetchExchangeRate(fromCurrency, toCurrency);
  
  // Cache the result
  await cacheRate(rate);
  
  return rate;
}

/**
 * Get multiple exchange rates at once
 */
export async function getExchangeRates(
  fromCurrency: string,
  toCurrencies: string[]
): Promise<Map<string, ExchangeRate>> {
  const rates = new Map<string, ExchangeRate>();
  
  await Promise.all(
    toCurrencies.map(async (toCurrency) => {
      const rate = await getExchangeRate(fromCurrency, toCurrency);
      rates.set(toCurrency, rate);
    })
  );
  
  return rates;
}

/**
 * Fetch exchange rate from external API
 */
async function fetchExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRate> {
  // This would integrate with a real exchange rate API
  // For now, using mock rates
  const mockRates: Record<string, Record<string, number>> = {
    USD: {
      EUR: 0.92,
      GBP: 0.79,
      JPY: 150.5,
      SAR: 3.75,
      AED: 3.67,
      QAR: 3.64,
      KWD: 0.31,
      BHD: 0.38,
      OMR: 0.38,
      EGP: 30.9,
      CAD: 1.35,
      AUD: 1.52,
      CHF: 0.88,
      CNY: 7.19,
      INR: 83.1,
      TRY: 30.5,
    },
    EUR: {
      USD: 1.09,
      GBP: 0.86,
      SAR: 4.08,
      AED: 4.0,
    },
    SAR: {
      USD: 0.27,
      EUR: 0.25,
      AED: 0.98,
      QAR: 0.97,
    },
    AED: {
      USD: 0.27,
      EUR: 0.25,
      SAR: 1.02,
    },
  };
  
  const rate = mockRates[fromCurrency]?.[toCurrency] || 1;
  
  return {
    from: fromCurrency,
    to: toCurrency,
    rate,
    source: 'mock-api',
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + DEFAULT_CACHE_DURATION * 60000),
  };
}

/**
 * Get cached rate from database
 */
async function getCachedRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRate | null> {
  try {
    const cached = await db.exchangeRate.findUnique({
      where: {
        from_to: {
          from: fromCurrency,
          to: toCurrency,
        },
      },
    });
    
    if (!cached) return null;
    
    return {
      from: cached.from,
      to: cached.to,
      rate: cached.rate,
      source: cached.source,
      timestamp: cached.timestamp,
      expiresAt: cached.expiresAt,
    };
  } catch (error) {
    // Database might not have the table yet
    return null;
  }
}

/**
 * Cache rate in database
 */
async function cacheRate(rate: ExchangeRate): Promise<void> {
  try {
    await db.exchangeRate.upsert({
      where: {
        from_to: {
          from: rate.from,
          to: rate.to,
        },
      },
      update: {
        rate: rate.rate,
        source: rate.source,
        timestamp: rate.timestamp,
        expiresAt: rate.expiresAt,
      },
      create: {
        from: rate.from,
        to: rate.to,
        rate: rate.rate,
        source: rate.source,
        timestamp: rate.timestamp,
        expiresAt: rate.expiresAt,
      },
    });
  } catch (error) {
    // Database might not have the table yet
    console.warn('Failed to cache exchange rate:', error);
  }
}

/**
 * Check if cached rate is expired
 */
function isExpired(rate: ExchangeRate): boolean {
  return new Date() > rate.expiresAt;
}

/**
 * Get exchange rate history
 */
export async function getRateHistory(
  fromCurrency: string,
  toCurrency: string,
  days: number = 30
): Promise<ExchangeRateHistory[]> {
  const history: ExchangeRateHistory[] = [];
  const today = new Date();
  
  // Generate mock historical data
  const baseRate = 1.0; // This would come from actual historical data
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some random variation to simulate real market fluctuations
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const rate = baseRate * (1 + variation);
    
    history.push({
      date,
      rate: parseFloat(rate.toFixed(6)),
    });
  }
  
  return history;
}

/**
 * Get rate trend (increasing, decreasing, stable)
 */
export function getRateTrend(
  history: ExchangeRateHistory[]
): 'increasing' | 'decreasing' | 'stable' {
  if (history.length < 2) return 'stable';
  
  const first = history[0].rate;
  const last = history[history.length - 1].rate;
  const change = ((last - first) / first) * 100;
  
  if (change > 2) return 'increasing';
  if (change < -2) return 'decreasing';
  return 'stable';
}

/**
 * Set manual exchange rate override
 */
export async function setManualRate(
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  expiresAt?: Date
): Promise<ExchangeRate> {
  const exchangeRate: ExchangeRate = {
    from: fromCurrency,
    to: toCurrency,
    rate,
    source: 'manual',
    timestamp: new Date(),
    expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60000), // 24 hours default
  };
  
  await cacheRate(exchangeRate);
  
  return exchangeRate;
}

/**
 * Clear manual override and use API rates
 */
export async function clearManualRate(
  fromCurrency: string,
  toCurrency: string
): Promise<void> {
  await db.exchangeRate.delete({
    where: {
      from_to: {
        from: fromCurrency,
        to: toCurrency,
      },
    },
  }).catch(() => {
    // Ignore if not found
  });
}

/**
 * Get all active rates
 */
export async function getAllActiveRates(): Promise<ExchangeRate[]> {
  try {
    const rates = await db.exchangeRate.findMany({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    
    return rates.map((r) => ({
      from: r.from,
      to: r.to,
      rate: r.rate,
      source: r.source,
      timestamp: r.timestamp,
      expiresAt: r.expiresAt,
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Update rates for all configured currency pairs
 */
export async function updateAllRates(
  baseCurrency: string,
  targetCurrencies: string[]
): Promise<Map<string, ExchangeRate>> {
  const rates = await getExchangeRates(baseCurrency, targetCurrencies);
  
  // Also store inverse rates
  for (const [toCurrency, rate] of rates.entries()) {
    if (rate.rate !== 0) {
      const inverseRate: ExchangeRate = {
        from: toCurrency,
        to: baseCurrency,
        rate: 1 / rate.rate,
        source: rate.source,
        timestamp: rate.timestamp,
        expiresAt: rate.expiresAt,
      };
      await cacheRate(inverseRate);
    }
  }
  
  return rates;
}
