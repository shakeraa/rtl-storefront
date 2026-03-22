/**
 * T0165 — Translation cost monitoring
 *
 * In-memory cost tracker that records per-request usage and provides
 * aggregated views by provider, locale, and time window.
 */

export interface CostEntry {
  provider: string;
  characters: number;
  cost: number;
  locale: string;
  timestamp: Date;
}

/** Cost rates per 1 000 characters by provider (USD) */
const RATES: Record<string, number> = {
  openai: 0.02,
  deepl: 0.025,
  google: 0.01,
};

function costForChars(provider: string, characters: number): number {
  const rate = RATES[provider] ?? 0.02;
  return (characters / 1_000) * rate;
}

export class CostMonitor {
  private entries: CostEntry[] = [];

  /**
   * Record a translation usage event. The cost is computed automatically
   * from the provider's rate and the character count.
   */
  recordUsage(provider: string, characters: number, locale: string): void {
    const cost = costForChars(provider, characters);
    this.entries.push({
      provider,
      characters,
      cost,
      locale,
      timestamp: new Date(),
    });
  }

  /** Total cost for the current UTC day. */
  getDailyCost(): number {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    return this.sumCostSince(todayStart);
  }

  /** Total cost for the current UTC calendar month. */
  getMonthlyCost(): number {
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    return this.sumCostSince(monthStart);
  }

  /** Aggregate cost grouped by provider name. */
  getCostByProvider(): Record<string, number> {
    return this.groupCost((e) => e.provider);
  }

  /** Aggregate cost grouped by target locale. */
  getCostByLocale(): Record<string, number> {
    return this.groupCost((e) => e.locale);
  }

  /** Returns `true` when the current month's spend exceeds the budget. */
  isOverBudget(monthlyBudget: number): boolean {
    return this.getMonthlyCost() >= monthlyBudget;
  }

  /**
   * Generate human-readable budget alerts.
   * - Warning at 80 % of budget
   * - Critical at 95 % of budget
   * - Over-budget when exceeded
   */
  getAlerts(monthlyBudget: number): string[] {
    const spent = this.getMonthlyCost();
    const pct = (spent / monthlyBudget) * 100;
    const alerts: string[] = [];

    if (pct >= 100) {
      alerts.push(
        `OVER BUDGET: Monthly spend $${spent.toFixed(2)} exceeds budget $${monthlyBudget.toFixed(2)} (${pct.toFixed(1)}%)`,
      );
    } else if (pct >= 95) {
      alerts.push(
        `CRITICAL: Monthly spend $${spent.toFixed(2)} is at ${pct.toFixed(1)}% of $${monthlyBudget.toFixed(2)} budget`,
      );
    } else if (pct >= 80) {
      alerts.push(
        `WARNING: Monthly spend $${spent.toFixed(2)} is at ${pct.toFixed(1)}% of $${monthlyBudget.toFixed(2)} budget`,
      );
    }

    return alerts;
  }

  // ---- private helpers ----

  private sumCostSince(since: Date): number {
    const ts = since.getTime();
    return this.entries
      .filter((e) => e.timestamp.getTime() >= ts)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  private groupCost(keyFn: (e: CostEntry) => string): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const entry of this.entries) {
      const key = keyFn(entry);
      groups[key] = (groups[key] ?? 0) + entry.cost;
    }
    return groups;
  }
}
