/**
 * AI Usage Metrics Service
 * T0090: Admin - AI Usage Metrics Dashboard
 *
 * Tracks AI translation usage, costs, and quota consumption by provider and language.
 */

import type { TranslationProviderName } from '../translation/types';

export type AIProvider = TranslationProviderName;

export interface AIUsageEntry {
  id: string;
  provider: AIProvider;
  characters: number;
  sourceLocale: string;
  targetLocale: string;
  timestamp: Date;
  cost: number;
  apiCalls: number;
}

export interface UsagePeriod {
  start: Date;
  end: Date;
}

export interface AIUsageStats {
  totalCharacters: number;
  totalCost: number;
  totalApiCalls: number;
  byProvider: Record<AIProvider, { characters: number; cost: number; calls: number }>;
  byLanguagePair: Record<string, { characters: number; cost: number; calls: number }>;
  period: UsagePeriod;
}

export interface ProviderCostBreakdown {
  provider: AIProvider;
  characters: number;
  cost: number;
  calls: number;
  avgCostPer1KChars: number;
}

export interface LanguageUsageBreakdown {
  sourceLocale: string;
  targetLocale: string;
  characters: number;
  cost: number;
  calls: number;
  primaryProvider: AIProvider;
}

export interface UsageTrendPoint {
  date: Date;
  characters: number;
  cost: number;
  calls: number;
}

export interface QuotaStatus {
  used: number;
  limit: number | null;
  remaining: number | null;
  percentage: number;
}

// Cost per 1,000 characters in USD
const PROVIDER_COST_RATES: Record<AIProvider, number> = {
  openai: 0.02,
  deepl: 0.025,
  google: 0.01,
};

// In-memory storage for usage entries
const usageStore: AIUsageEntry[] = [];

// Default quota limits
const DEFAULT_CHARACTER_QUOTA = 1_000_000;
let characterQuota: number = DEFAULT_CHARACTER_QUOTA;

/**
 * Calculate cost based on provider and character count
 */
export function calculateCost(provider: AIProvider, characters: number): number {
  const rate = PROVIDER_COST_RATES[provider] ?? 0.02;
  return (characters / 1_000) * rate;
}

/**
 * Get cost rate per 1,000 characters for a provider
 */
export function getProviderCostRate(provider: AIProvider): number {
  return PROVIDER_COST_RATES[provider] ?? 0.02;
}

/**
 * Track AI translation usage
 */
export function trackAIUsage(
  provider: AIProvider,
  characters: number,
  sourceLocale: string = 'en',
  targetLocale: string = 'ar',
  apiCalls: number = 1
): AIUsageEntry {
  const cost = calculateCost(provider, characters);
  const entry: AIUsageEntry = {
    id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    provider,
    characters,
    sourceLocale: sourceLocale.toLowerCase(),
    targetLocale: targetLocale.toLowerCase(),
    timestamp: new Date(),
    cost,
    apiCalls,
  };

  usageStore.push(entry);
  return entry;
}

/**
 * Track AI usage with a single translation request
 */
export function trackAITranslation(
  provider: AIProvider,
  text: string,
  sourceLocale: string,
  targetLocale: string
): AIUsageEntry {
  const characters = text.length;
  return trackAIUsage(provider, characters, sourceLocale, targetLocale, 1);
}

/**
 * Get AI usage statistics for a specific period
 */
export function getAIUsageStats(period: UsagePeriod): AIUsageStats {
  const entries = getUsageEntriesInPeriod(period);

  const byProvider: Record<string, { characters: number; cost: number; calls: number }> = {
    openai: { characters: 0, cost: 0, calls: 0 },
    deepl: { characters: 0, cost: 0, calls: 0 },
    google: { characters: 0, cost: 0, calls: 0 },
  };

  const byLanguagePair: Record<string, { characters: number; cost: number; calls: number }> = {};

  let totalCharacters = 0;
  let totalCost = 0;
  let totalApiCalls = 0;

  for (const entry of entries) {
    totalCharacters += entry.characters;
    totalCost += entry.cost;
    totalApiCalls += entry.apiCalls;

    // Aggregate by provider
    if (byProvider[entry.provider]) {
      byProvider[entry.provider].characters += entry.characters;
      byProvider[entry.provider].cost += entry.cost;
      byProvider[entry.provider].calls += entry.apiCalls;
    }

    // Aggregate by language pair
    const pairKey = `${entry.sourceLocale}-${entry.targetLocale}`;
    if (!byLanguagePair[pairKey]) {
      byLanguagePair[pairKey] = { characters: 0, cost: 0, calls: 0 };
    }
    byLanguagePair[pairKey].characters += entry.characters;
    byLanguagePair[pairKey].cost += entry.cost;
    byLanguagePair[pairKey].calls += entry.apiCalls;
  }

  return {
    totalCharacters,
    totalCost,
    totalApiCalls,
    byProvider: byProvider as Record<AIProvider, { characters: number; cost: number; calls: number }>,
    byLanguagePair,
    period,
  };
}

/**
 * Get cost breakdown by provider
 */
export function getCostByProvider(period?: UsagePeriod): ProviderCostBreakdown[] {
  const entries = period ? getUsageEntriesInPeriod(period) : [...usageStore];

  const providerMap = new Map<AIProvider, { characters: number; cost: number; calls: number }>();

  for (const entry of entries) {
    const existing = providerMap.get(entry.provider) ?? { characters: 0, cost: 0, calls: 0 };
    existing.characters += entry.characters;
    existing.cost += entry.cost;
    existing.calls += entry.apiCalls;
    providerMap.set(entry.provider, existing);
  }

  const result: ProviderCostBreakdown[] = [];
  for (const [provider, data] of providerMap) {
    result.push({
      provider,
      characters: data.characters,
      cost: data.cost,
      calls: data.calls,
      avgCostPer1KChars: data.characters > 0 ? (data.cost / data.characters) * 1_000 : 0,
    });
  }

  return result.sort((a, b) => b.cost - a.cost);
}

/**
 * Get cost for a specific provider
 */
export function getCostForProvider(provider: AIProvider, period?: UsagePeriod): number {
  const entries = period ? getUsageEntriesInPeriod(period) : [...usageStore];
  return entries
    .filter((e) => e.provider === provider)
    .reduce((sum, e) => sum + e.cost, 0);
}

/**
 * Get usage statistics broken down by language pair
 */
export function getUsageByLanguage(period?: UsagePeriod): LanguageUsageBreakdown[] {
  const entries = period ? getUsageEntriesInPeriod(period) : [...usageStore];

  const pairMap = new Map<string, { 
    sourceLocale: string; 
    targetLocale: string; 
    characters: number; 
    cost: number; 
    calls: number;
    providerCounts: Map<AIProvider, number>;
  }>();

  for (const entry of entries) {
    const key = `${entry.sourceLocale}-${entry.targetLocale}`;
    const existing = pairMap.get(key);
    
    if (existing) {
      existing.characters += entry.characters;
      existing.cost += entry.cost;
      existing.calls += entry.apiCalls;
      existing.providerCounts.set(
        entry.provider, 
        (existing.providerCounts.get(entry.provider) ?? 0) + entry.characters
      );
    } else {
      const providerCounts = new Map<AIProvider, number>();
      providerCounts.set(entry.provider, entry.characters);
      pairMap.set(key, {
        sourceLocale: entry.sourceLocale,
        targetLocale: entry.targetLocale,
        characters: entry.characters,
        cost: entry.cost,
        calls: entry.apiCalls,
        providerCounts,
      });
    }
  }

  const result: LanguageUsageBreakdown[] = [];
  for (const data of pairMap.values()) {
    // Find primary provider (most characters)
    let primaryProvider: AIProvider = 'openai';
    let maxChars = 0;
    for (const [provider, chars] of data.providerCounts) {
      if (chars > maxChars) {
        maxChars = chars;
        primaryProvider = provider;
      }
    }

    result.push({
      sourceLocale: data.sourceLocale,
      targetLocale: data.targetLocale,
      characters: data.characters,
      cost: data.cost,
      calls: data.calls,
      primaryProvider,
    });
  }

  return result.sort((a, b) => b.characters - a.characters);
}

/**
 * Get usage trends over time (grouped by day)
 */
export function getUsageTrends(period: UsagePeriod): UsageTrendPoint[] {
  const entries = getUsageEntriesInPeriod(period);
  const dailyMap = new Map<string, { characters: number; cost: number; calls: number }>();

  // Initialize all days in the period
  const current = new Date(period.start);
  while (current <= period.end) {
    const dateKey = current.toISOString().split('T')[0];
    dailyMap.set(dateKey, { characters: 0, cost: 0, calls: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Aggregate entries by day
  for (const entry of entries) {
    const dateKey = entry.timestamp.toISOString().split('T')[0];
    const existing = dailyMap.get(dateKey);
    if (existing) {
      existing.characters += entry.characters;
      existing.cost += entry.cost;
      existing.calls += entry.apiCalls;
    }
  }

  // Convert to sorted array
  return Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dateKey, data]) => ({
      date: new Date(dateKey),
      characters: data.characters,
      cost: data.cost,
      calls: data.calls,
    }));
}

/**
 * Get quota status and remaining allocation
 */
export function getQuotaStatus(period?: UsagePeriod): QuotaStatus {
  const entries = period ? getUsageEntriesInPeriod(period) : [...usageStore];
  const used = entries.reduce((sum, e) => e.characters, 0);
  const remaining = characterQuota - used;

  return {
    used,
    limit: characterQuota,
    remaining: remaining > 0 ? remaining : 0,
    percentage: characterQuota > 0 ? (used / characterQuota) * 100 : 0,
  };
}

/**
 * Set the character quota limit
 */
export function setCharacterQuota(quota: number): void {
  characterQuota = quota;
}

/**
 * Get the current character quota
 */
export function getCharacterQuota(): number {
  return characterQuota;
}

/**
 * Compare providers by usage metrics
 */
export function compareProviders(period: UsagePeriod): {
  provider: AIProvider;
  efficiency: number;
  avgResponseTime: number;
}[] {
  const entries = getUsageEntriesInPeriod(period);
  const providerMap = new Map<AIProvider, { totalCost: number; totalChars: number; callCount: number }>();

  for (const entry of entries) {
    const existing = providerMap.get(entry.provider) ?? { totalCost: 0, totalChars: 0, callCount: 0 };
    existing.totalCost += entry.cost;
    existing.totalChars += entry.characters;
    existing.callCount += entry.apiCalls;
    providerMap.set(entry.provider, existing);
  }

  const result: { provider: AIProvider; efficiency: number; avgResponseTime: number }[] = [];
  for (const [provider, data] of providerMap) {
    const efficiency = data.totalChars > 0 ? data.totalChars / data.totalCost : 0;
    result.push({
      provider,
      efficiency,
      avgResponseTime: 0, // Would be tracked with actual API response times
    });
  }

  return result.sort((a, b) => b.efficiency - a.efficiency);
}

/**
 * Get API call counts by provider
 */
export function getApiCallCounts(period?: UsagePeriod): Record<AIProvider, number> {
  const entries = period ? getUsageEntriesInPeriod(period) : [...usageStore];
  const counts: Record<string, number> = { openai: 0, deepl: 0, google: 0 };

  for (const entry of entries) {
    counts[entry.provider] = (counts[entry.provider] ?? 0) + entry.apiCalls;
  }

  return counts as Record<AIProvider, number>;
}

/**
 * Get characters translated per engine
 */
export function getCharactersByEngine(period?: UsagePeriod): Record<AIProvider, number> {
  const entries = period ? getUsageEntriesInPeriod(period) : [...usageStore];
  const counts: Record<string, number> = { openai: 0, deepl: 0, google: 0 };

  for (const entry of entries) {
    counts[entry.provider] = (counts[entry.provider] ?? 0) + entry.characters;
  }

  return counts as Record<AIProvider, number>;
}

/**
 * Clear all usage data (for testing)
 */
export function clearAIUsageData(): void {
  usageStore.length = 0;
  characterQuota = DEFAULT_CHARACTER_QUOTA;
}

/**
 * Get total number of tracked entries
 */
export function getAIUsageEntryCount(): number {
  return usageStore.length;
}

/**
 * Get all usage entries within a period
 */
function getUsageEntriesInPeriod(period: UsagePeriod): AIUsageEntry[] {
  return usageStore.filter(
    (entry) => entry.timestamp >= period.start && entry.timestamp <= period.end
  );
}

/**
 * Export usage data to CSV format
 */
export function exportAIUsageToCSV(period?: UsagePeriod): string {
  const entries = period ? getUsageEntriesInPeriod(period) : [...usageStore];
  
  if (entries.length === 0) {
    return 'timestamp,provider,source_locale,target_locale,characters,cost,api_calls';
  }

  const headers = ['timestamp', 'provider', 'source_locale', 'target_locale', 'characters', 'cost', 'api_calls'];
  const rows = entries.map((entry) => [
    entry.timestamp.toISOString(),
    entry.provider,
    entry.sourceLocale,
    entry.targetLocale,
    entry.characters,
    entry.cost.toFixed(4),
    entry.apiCalls,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Get monthly usage summary for dashboard
 */
export function getMonthlyUsageSummary(months: number = 6): {
  month: string;
  characters: number;
  cost: number;
  calls: number;
}[] {
  const now = new Date();
  const result: { month: string; characters: number; cost: number; calls: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const period: UsagePeriod = { start: monthStart, end: monthEnd };
    const stats = getAIUsageStats(period);

    result.push({
      month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
      characters: stats.totalCharacters,
      cost: stats.totalCost,
      calls: stats.totalApiCalls,
    });
  }

  return result;
}
