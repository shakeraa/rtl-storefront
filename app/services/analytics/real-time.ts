/**
 * Real-time Dashboard Metrics Service
 * T0261: Analytics - Real-time Dashboard
 */

export interface RealTimeMetrics {
  activeTranslations: number;
  wordsPerMinute: number;
  activeLocales: string[];
  queueDepth: number;
  errorRate: number;
}

// Lightweight in-memory state representing the real-time translation pipeline.
// In production these counters would be backed by Redis or a similar store.
interface PipelineState {
  activeTranslations: number;
  wordsTranslatedLastMinute: number;
  activeLocales: Set<string>;
  queueDepth: number;
  totalRequests: number;
  errorCount: number;
}

const pipelineState: Map<string, PipelineState> = new Map();

function getOrCreateState(shop: string): PipelineState {
  if (!pipelineState.has(shop)) {
    pipelineState.set(shop, {
      activeTranslations: 0,
      wordsTranslatedLastMinute: 0,
      activeLocales: new Set(),
      queueDepth: 0,
      totalRequests: 0,
      errorCount: 0,
    });
  }
  return pipelineState.get(shop)!;
}

/**
 * Retrieve real-time metrics for a shop.
 */
export async function getRealTimeMetrics(shop: string): Promise<RealTimeMetrics> {
  const state = getOrCreateState(shop);

  const errorRate =
    state.totalRequests > 0
      ? Number(((state.errorCount / state.totalRequests) * 100).toFixed(2))
      : 0;

  return {
    activeTranslations: state.activeTranslations,
    wordsPerMinute: state.wordsTranslatedLastMinute,
    activeLocales: [...state.activeLocales],
    queueDepth: state.queueDepth,
    errorRate,
  };
}

/**
 * Format a metric value for human-readable display.
 *
 * Examples:
 *   formatMetricForDisplay("wordsPerMinute", 1234)  => "1,234 wpm"
 *   formatMetricForDisplay("errorRate", 2.5)         => "2.50%"
 *   formatMetricForDisplay("queueDepth", 10)         => "10 items"
 */
export function formatMetricForDisplay(metric: string, value: number): string {
  switch (metric) {
    case "wordsPerMinute":
      return `${value.toLocaleString()} wpm`;
    case "errorRate":
      return `${value.toFixed(2)}%`;
    case "activeTranslations":
      return `${value} active`;
    case "queueDepth":
      return `${value} items`;
    default:
      return String(value);
  }
}

// ---------------------------------------------------------------------------
// Internal helpers (used by tests and integration code)
// ---------------------------------------------------------------------------

/** Record the start of a translation job for a shop. */
export function recordTranslationStart(shop: string, locale: string): void {
  const state = getOrCreateState(shop);
  state.activeTranslations++;
  state.activeLocales.add(locale);
  state.totalRequests++;
  state.queueDepth = Math.max(0, state.queueDepth - 1);
}

/** Record the completion of a translation job for a shop. */
export function recordTranslationComplete(shop: string, wordCount: number): void {
  const state = getOrCreateState(shop);
  state.activeTranslations = Math.max(0, state.activeTranslations - 1);
  state.wordsTranslatedLastMinute += wordCount;
}

/** Record a translation error for a shop. */
export function recordTranslationError(shop: string): void {
  const state = getOrCreateState(shop);
  state.activeTranslations = Math.max(0, state.activeTranslations - 1);
  state.errorCount++;
}

/** Enqueue work items for a shop. */
export function enqueueWork(shop: string, count: number): void {
  const state = getOrCreateState(shop);
  state.queueDepth += count;
}

/** Reset per-minute rolling counters (call this on a 60-second interval). */
export function resetMinuteCounters(shop: string): void {
  const state = getOrCreateState(shop);
  state.wordsTranslatedLastMinute = 0;
}

/** Clear all pipeline state (for testing). */
export function clearRealTimeState(): void {
  pipelineState.clear();
}
