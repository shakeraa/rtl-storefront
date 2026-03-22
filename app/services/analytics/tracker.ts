/**
 * Analytics Tracker - T0251: Translation Volume Tracking
 * In-memory analytics tracker for translation volume metrics.
 */

import type { TranslationVolumeEntry } from "./types";

const MAX_ENTRIES = 100_000;

interface InternalEntry {
  date: string;
  locale: string;
  provider: string;
  characters: number;
  cost: number;
  shop: string;
}

export class AnalyticsTracker {
  private entries: InternalEntry[] = [];

  trackTranslation(
    shop: string,
    locale: string,
    provider: string,
    characters: number,
    cost: number,
  ): void {
    if (this.entries.length >= MAX_ENTRIES) {
      // Drop oldest 10% when limit is reached
      this.entries = this.entries.slice(Math.floor(MAX_ENTRIES * 0.1));
    }

    this.entries.push({
      date: new Date().toISOString().split("T")[0],
      locale,
      provider,
      characters,
      cost,
      shop,
    });
  }

  getVolumeByDate(
    shop: string,
    from: string,
    to: string,
  ): TranslationVolumeEntry[] {
    const grouped = new Map<string, TranslationVolumeEntry>();

    for (const entry of this.entries) {
      if (entry.shop !== shop) continue;
      if (entry.date < from || entry.date > to) continue;

      const key = `${entry.date}:${entry.locale}:${entry.provider}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.characters += entry.characters;
        existing.requests += 1;
        existing.cost += entry.cost;
      } else {
        grouped.set(key, {
          date: entry.date,
          locale: entry.locale,
          provider: entry.provider,
          characters: entry.characters,
          requests: 1,
          cost: entry.cost,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  }

  getVolumeByLocale(
    shop: string,
  ): Record<string, { characters: number; requests: number; cost: number }> {
    const result: Record<
      string,
      { characters: number; requests: number; cost: number }
    > = {};

    for (const entry of this.entries) {
      if (entry.shop !== shop) continue;

      if (!result[entry.locale]) {
        result[entry.locale] = { characters: 0, requests: 0, cost: 0 };
      }
      result[entry.locale].characters += entry.characters;
      result[entry.locale].requests += 1;
      result[entry.locale].cost += entry.cost;
    }

    return result;
  }

  getVolumeByProvider(
    shop: string,
  ): Record<string, { characters: number; requests: number; cost: number }> {
    const result: Record<
      string,
      { characters: number; requests: number; cost: number }
    > = {};

    for (const entry of this.entries) {
      if (entry.shop !== shop) continue;

      if (!result[entry.provider]) {
        result[entry.provider] = { characters: 0, requests: 0, cost: 0 };
      }
      result[entry.provider].characters += entry.characters;
      result[entry.provider].requests += 1;
      result[entry.provider].cost += entry.cost;
    }

    return result;
  }

  getTotalVolume(
    shop: string,
  ): { characters: number; requests: number; cost: number } {
    const result = { characters: 0, requests: 0, cost: 0 };

    for (const entry of this.entries) {
      if (entry.shop !== shop) continue;
      result.characters += entry.characters;
      result.requests += 1;
      result.cost += entry.cost;
    }

    return result;
  }
}

// Singleton instance
export const analyticsTracker = new AnalyticsTracker();
