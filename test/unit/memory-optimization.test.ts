import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentTranslator } from '../../app/services/content-translator';
import { CostMonitor } from '../../app/services/performance/cost-monitor';

describe('memory usage optimization', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-22T10:00:00.000Z'));
  });

  it('caps cost-monitor history to the configured entry limit', () => {
    const monitor = new CostMonitor({ maxEntries: 3 });

    monitor.recordUsage('openai', 100, 'ar');
    monitor.recordUsage('openai', 200, 'ar');
    monitor.recordUsage('google', 300, 'he');
    monitor.recordUsage('deepl', 400, 'fr');

    expect(monitor.getEntryCount()).toBe(3);
    const costByProvider = monitor.getCostByProvider();
    expect(costByProvider.openai).toBeCloseTo(0.004);
    expect(costByProvider.google).toBeCloseTo(0.003);
    expect(costByProvider.deepl).toBeCloseTo(0.01);
  });

  it('drops cost-monitor entries outside the retention window', () => {
    const monitor = new CostMonitor({ retentionDays: 1 });

    monitor.recordUsage('openai', 1000, 'ar');
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);
    monitor.recordUsage('google', 1000, 'he');

    expect(monitor.getEntryCount()).toBe(1);
    expect(monitor.getCostByLocale()).toEqual({ he: 0.01 });
  });

  it('evicts the least recently used content cache entry when over capacity', async () => {
    const translator = new ContentTranslator({ maxCacheEntries: 2, cacheTtlHours: 24 });

    await translator.translate('product.1.title', 'Shirt', 'ar');
    await translator.translate('product.2.title', 'Pants', 'ar');
    await translator.translate('product.1.title', 'Shirt', 'ar');
    await translator.translate('product.3.title', 'Shoes', 'ar');

    expect(translator.getCacheStats().size).toBe(2);

    const cached = await translator.translate('product.1.title', 'Shirt', 'ar');
    expect(cached.provider).toBe('cache');

    const evicted = await translator.translate('product.2.title', 'Pants', 'ar');
    expect(evicted.provider).not.toBe('cache');
  });

  it('removes expired content cache entries before reporting stats', async () => {
    const translator = new ContentTranslator({ maxCacheEntries: 3, cacheTtlHours: 1 / 3600 });

    await translator.translate('product.1.title', 'Shirt', 'ar');
    expect(translator.getCacheStats().size).toBe(1);

    vi.advanceTimersByTime(1500);

    expect(translator.getCacheStats()).toEqual({
      size: 0,
      hitRate: 0,
    });
  });
});
