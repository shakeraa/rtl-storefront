/**
 * Translation Usage Tracker
 * Records all translation API calls for analytics and cost tracking
 */

import db from "../../db.server";

export interface UsageTrackingParams {
  shop: string;
  provider: string;
  model?: string;
  characters: number;
  words?: number;
  costPer1kChars: number;
  responseTimeMs?: number;
  sourceLocale: string;
  targetLocale: string;
  resourceType?: string;
  resourceId?: string;
  contentType?: string;
  success?: boolean;
  errorMessage?: string;
  qualityScore?: number;
  cached?: boolean;
  glossaryUsed?: boolean;
}

/**
 * Calculate cost in cents based on characters and rate
 */
export function calculateCostCents(characters: number, costPer1kChars: number): number {
  return Math.round((characters / 1000) * costPer1kChars * 100);
}

/**
 * Estimate word count from characters
 * Rough estimate: 1 word ≈ 5 characters
 */
export function estimateWords(characters: number): number {
  return Math.ceil(characters / 5);
}

/**
 * Get provider cost rate per 1K characters
 */
export function getProviderCostRate(provider: string): number {
  const rates: Record<string, number> = {
    openai: 0.020,      // GPT-4: $0.02 per 1K tokens (roughly chars)
    "gpt-4": 0.030,     // GPT-4: $0.03 per 1K
    "gpt-3.5-turbo": 0.002, // GPT-3.5: $0.002 per 1K
    deepl: 0.025,       // DeepL: $0.025 per 1K chars
    google: 0.010,      // Google Translate: $0.01 per 1K chars
    azure: 0.010,       // Azure Translator: $0.01 per 1K chars
    aws: 0.015,         // AWS Translate: $0.015 per 1K chars
    anthropic: 0.008,   // Claude: $0.008 per 1K tokens
    libretranslate: 0,  // Self-hosted: free
  };
  
  return rates[provider.toLowerCase()] || 0.020;
}

/**
 * Track a translation usage event
 */
export async function trackTranslationUsage(params: UsageTrackingParams): Promise<void> {
  const {
    shop,
    provider,
    model,
    characters,
    words,
    costPer1kChars,
    responseTimeMs,
    sourceLocale,
    targetLocale,
    resourceType,
    resourceId,
    contentType,
    success = true,
    errorMessage,
    qualityScore,
    cached = false,
    glossaryUsed = false,
  } = params;

  const estimatedWords = words || estimateWords(characters);
  const costCents = cached ? 0 : calculateCostCents(characters, costPer1kChars);

  try {
    await db.translationUsage.create({
      data: {
        shop,
        provider: provider.toLowerCase(),
        model,
        characters,
        words: estimatedWords,
        costCents,
        costPer1kChars,
        responseTimeMs,
        sourceLocale,
        targetLocale,
        resourceType: resourceType?.toLowerCase(),
        resourceId,
        contentType: contentType?.toLowerCase(),
        success,
        errorMessage,
        qualityScore,
        cached,
        glossaryUsed,
      },
    });

    // Also update monthly aggregate
    await updateMonthlyUsage(shop, estimatedWords);
  } catch (error) {
    console.error("[UsageTracker] Failed to track usage:", error);
    // Don't throw - usage tracking should not break translations
  }
}

/**
 * Update monthly aggregate usage
 */
async function updateMonthlyUsage(shop: string, words: number): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    await db.shopUsage.upsert({
      where: {
        shop_periodStart: {
          shop,
          periodStart,
        },
      },
      update: {
        wordsUsed: { increment: words },
      },
      create: {
        shop,
        periodStart,
        wordsUsed: words,
      },
    });
  } catch (error) {
    console.error("[UsageTracker] Failed to update monthly usage:", error);
  }
}

/**
 * Get usage statistics for a shop
 */
export async function getShopUsageStats(
  shop: string,
  startDate?: Date,
  endDate?: Date
) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const end = endDate || new Date();

  const [totalStats, providerBreakdown, dailyTrends] = await Promise.all([
    // Total stats
    db.translationUsage.aggregate({
      where: {
        shop,
        createdAt: { gte: start, lte: end },
      },
      _sum: {
        characters: true,
        words: true,
        costCents: true,
        apiCalls: true,
      },
      _count: {
        _all: true,
      },
      _avg: {
        responseTimeMs: true,
        qualityScore: true,
      },
    }),

    // Provider breakdown
    db.translationUsage.groupBy({
      by: ["provider"],
      where: {
        shop,
        createdAt: { gte: start, lte: end },
      },
      _sum: {
        characters: true,
        costCents: true,
        apiCalls: true,
      },
      _avg: {
        responseTimeMs: true,
        qualityScore: true,
      },
      orderBy: {
        _sum: {
          characters: "desc",
        },
      },
    }),

    // Daily trends
    db.translationUsage.groupBy({
      by: ["createdAt"],
      where: {
        shop,
        createdAt: { gte: start, lte: end },
      },
      _sum: {
        characters: true,
        costCents: true,
        apiCalls: true,
      },
    }),
  ]);

  return {
    total: {
      characters: totalStats._sum.characters || 0,
      words: totalStats._sum.words || 0,
      costCents: totalStats._sum.costCents || 0,
      apiCalls: totalStats._sum.apiCalls || 0,
      totalCalls: totalStats._count._all,
      avgResponseTimeMs: Math.round(totalStats._avg.responseTimeMs || 0),
      avgQualityScore: Math.round(totalStats._avg.qualityScore || 0),
    },
    providers: providerBreakdown.map((p) => ({
      provider: p.provider,
      characters: p._sum.characters || 0,
      costCents: p._sum.costCents || 0,
      apiCalls: p._sum.apiCalls || 0,
      avgResponseTimeMs: Math.round(p._avg.responseTimeMs || 0),
      avgQualityScore: Math.round(p._avg.qualityScore || 0),
    })),
    dailyTrends: dailyTrends.map((d) => ({
      date: d.createdAt,
      characters: d._sum.characters || 0,
      costCents: d._sum.costCents || 0,
      apiCalls: d._sum.apiCalls || 0,
    })),
  };
}

/**
 * Get weekly trends for the last 5 weeks
 */
export async function getWeeklyTrends(shop: string) {
  const now = new Date();
  const fiveWeeksAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);

  const usage = await db.translationUsage.findMany({
    where: {
      shop,
      createdAt: { gte: fiveWeeksAgo },
    },
    select: {
      createdAt: true,
      characters: true,
      costCents: true,
      apiCalls: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group by week
  const weeklyData = new Map<string, { characters: number; costCents: number; apiCalls: number }>();

  for (const record of usage) {
    const date = new Date(record.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
    
    const weekKey = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    
    const existing = weeklyData.get(weekKey) || { characters: 0, costCents: 0, apiCalls: 0 };
    existing.characters += record.characters;
    existing.costCents += record.costCents;
    existing.apiCalls += record.apiCalls;
    weeklyData.set(weekKey, existing);
  }

  // Convert to array and get last 5 weeks
  return Array.from(weeklyData.entries())
    .slice(-5)
    .map(([week, data]) => ({
      week,
      characters: data.characters,
      apiCalls: data.apiCalls,
      cost: `$${(data.costCents / 100).toFixed(2)}`,
    }));
}

/**
 * Get current month's quota usage
 */
export async function getCurrentMonthQuota(shop: string, quotaLimit: number = 1_000_000) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usage = await db.translationUsage.aggregate({
    where: {
      shop,
      createdAt: { gte: periodStart },
    },
    _sum: {
      characters: true,
      costCents: true,
      apiCalls: true,
    },
  });

  const used = usage._sum.characters || 0;
  const remaining = quotaLimit - used;
  const percent = Math.round((used / quotaLimit) * 100);

  return {
    limit: quotaLimit,
    used,
    remaining,
    percent,
    costCents: usage._sum.costCents || 0,
    apiCalls: usage._sum.apiCalls || 0,
  };
}

/**
 * Get engine comparison stats
 */
export async function getEngineComparison(shop: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const providers = await db.translationUsage.groupBy({
    by: ["provider"],
    where: {
      shop,
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: {
      characters: true,
      apiCalls: true,
      costCents: true,
    },
    _avg: {
      responseTimeMs: true,
      qualityScore: true,
    },
  });

  return providers.map((p) => ({
    engine: p.provider.charAt(0).toUpperCase() + p.provider.slice(1),
    characters: p._sum.characters || 0,
    apiCalls: p._sum.apiCalls || 0,
    cost: (p._sum.costCents || 0) / 100,
    ratePer1K: getProviderCostRate(p.provider),
    qualityScore: Math.round(p._avg.qualityScore || 85),
    avgSpeed: formatAvgSpeed(p._avg.responseTimeMs),
  }));
}

function formatAvgSpeed(ms: number | null): string {
  if (!ms) return "1.0s";
  if (ms < 500) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 1000) return "0.8s";
  if (ms < 2000) return "1.2s";
  return `${(ms / 1000).toFixed(1)}s`;
}
