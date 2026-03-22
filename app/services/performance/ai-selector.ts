/**
 * T0164 — Smart AI engine selection
 *
 * Selects the optimal translation provider based on language pair,
 * text length, and caller priority (cost / quality / speed).
 */

const RTL_LOCALES = new Set(["ar", "he", "fa", "ur", "ps", "ku", "sd"]);

const EUROPEAN_LOCALES = new Set([
  "de", "fr", "es", "it", "pt", "nl", "pl", "ro", "cs", "sv", "da",
  "fi", "el", "hu", "bg", "sk", "sl", "hr", "lt", "lv", "et",
]);

export interface ProviderCost {
  provider: string;
  costPer1000Chars: number;
  avgLatencyMs: number;
  /** 0-1 quality score (1 = best) */
  qualityScore: number;
}

export const PROVIDER_COSTS: Record<string, ProviderCost> = {
  openai: {
    provider: "openai",
    costPer1000Chars: 0.02,
    avgLatencyMs: 800,
    qualityScore: 0.95,
  },
  deepl: {
    provider: "deepl",
    costPer1000Chars: 0.025,
    avgLatencyMs: 400,
    qualityScore: 0.92,
  },
  google: {
    provider: "google",
    costPer1000Chars: 0.01,
    avgLatencyMs: 300,
    qualityScore: 0.85,
  },
};

/**
 * Select the optimal provider for a translation job.
 *
 * Heuristics:
 * - RTL target languages → prefer OpenAI (higher quality for Arabic/Hebrew)
 * - European target languages → prefer DeepL (specialised)
 * - Priority "cost"   → cheapest provider
 * - Priority "quality" → highest quality score
 * - Priority "speed"  → lowest latency
 */
export function selectProvider(
  _sourceLocale: string,
  targetLocale: string,
  _textLength: number,
  priority: "cost" | "quality" | "speed",
): string {
  const targetBase = targetLocale.toLowerCase().split("-")[0];

  // Language-pair overrides take precedence when priority is "quality"
  if (priority === "quality") {
    if (RTL_LOCALES.has(targetBase)) return "openai";
    if (EUROPEAN_LOCALES.has(targetBase)) return "deepl";
  }

  const providers = Object.values(PROVIDER_COSTS);

  switch (priority) {
    case "cost":
      return providers.sort((a, b) => a.costPer1000Chars - b.costPer1000Chars)[0].provider;
    case "speed":
      return providers.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs)[0].provider;
    case "quality":
    default:
      return providers.sort((a, b) => b.qualityScore - a.qualityScore)[0].provider;
  }
}

/**
 * Estimate the cost of translating `charCount` characters with a given provider.
 */
export function estimateCost(provider: string, charCount: number): number {
  const info = PROVIDER_COSTS[provider];
  if (!info) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return Math.round((charCount / 1_000) * info.costPer1000Chars * 10_000) / 10_000;
}

/**
 * Return cost, latency, and quality information for every configured provider.
 */
export function getProviderStats(): ProviderCost[] {
  return Object.values(PROVIDER_COSTS);
}
