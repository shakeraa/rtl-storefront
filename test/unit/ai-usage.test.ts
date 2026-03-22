import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackAIUsage,
  trackAITranslation,
  getAIUsageStats,
  getCostByProvider,
  getCostForProvider,
  getUsageByLanguage,
  getUsageTrends,
  getQuotaStatus,
  setCharacterQuota,
  getCharacterQuota,
  compareProviders,
  getApiCallCounts,
  getCharactersByEngine,
  calculateCost,
  getProviderCostRate,
  clearAIUsageData,
  getAIUsageEntryCount,
  exportAIUsageToCSV,
  getMonthlyUsageSummary,
  type UsagePeriod,
} from '../../app/services/analytics/ai-usage';

describe('AI Usage Metrics Service - T0090', () => {
  beforeEach(() => {
    clearAIUsageData();
  });

  describe('Cost Calculation', () => {
    it('should calculate cost correctly for OpenAI', () => {
      const cost = calculateCost('openai', 1000);
      expect(cost).toBe(0.02);
    });

    it('should calculate cost correctly for Google', () => {
      const cost = calculateCost('google', 1000);
      expect(cost).toBe(0.01);
    });

    it('should calculate cost correctly for DeepL', () => {
      const cost = calculateCost('deepl', 1000);
      expect(cost).toBe(0.025);
    });

    it('should calculate cost for partial thousand characters', () => {
      const cost = calculateCost('openai', 500);
      expect(cost).toBe(0.01);
    });

    it('should return provider cost rates', () => {
      expect(getProviderCostRate('openai')).toBe(0.02);
      expect(getProviderCostRate('google')).toBe(0.01);
      expect(getProviderCostRate('deepl')).toBe(0.025);
    });

    it('should use default rate for unknown provider', () => {
      const cost = calculateCost('unknown' as any, 1000);
      expect(cost).toBe(0.02);
    });
  });

  describe('Usage Tracking', () => {
    it('should track AI usage with correct cost calculation', () => {
      const entry = trackAIUsage('openai', 2000, 'en', 'ar', 1);
      
      expect(entry.provider).toBe('openai');
      expect(entry.characters).toBe(2000);
      expect(entry.sourceLocale).toBe('en');
      expect(entry.targetLocale).toBe('ar');
      expect(entry.cost).toBe(0.04);
      expect(entry.apiCalls).toBe(1);
      expect(entry.id).toMatch(/^ai_\d+_/);
    });

    it('should track AI translation from text', () => {
      const entry = trackAITranslation('google', 'Hello world', 'en', 'ar');
      
      expect(entry.provider).toBe('google');
      expect(entry.characters).toBe(11);
      expect(entry.cost).toBeCloseTo(0.00011, 5);
    });

    it('should track multiple usage entries', () => {
      trackAIUsage('openai', 1000, 'en', 'ar');
      trackAIUsage('google', 2000, 'en', 'he');
      trackAIUsage('deepl', 1500, 'en', 'fr');
      
      expect(getAIUsageEntryCount()).toBe(3);
    });

    it('should clear all usage data', () => {
      trackAIUsage('openai', 1000);
      trackAIUsage('google', 2000);
      
      clearAIUsageData();
      
      expect(getAIUsageEntryCount()).toBe(0);
    });

    it('should normalize locales to lowercase', () => {
      const entry = trackAIUsage('openai', 1000, 'EN', 'AR');
      
      expect(entry.sourceLocale).toBe('en');
      expect(entry.targetLocale).toBe('ar');
    });
  });

  describe('AI Usage Statistics', () => {
    it('should get AI usage stats for a period', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 86400000),
        end: new Date(now.getTime() + 86400000),
      };

      trackAIUsage('openai', 1000, 'en', 'ar');
      trackAIUsage('openai', 2000, 'en', 'ar');
      trackAIUsage('google', 1500, 'en', 'he');

      const stats = getAIUsageStats(period);

      expect(stats.totalCharacters).toBe(4500);
      expect(stats.totalCost).toBeCloseTo(0.075, 3);
      expect(stats.totalApiCalls).toBe(3);
      expect(stats.byProvider.openai.characters).toBe(3000);
      expect(stats.byProvider.google.characters).toBe(1500);
    });

    it('should aggregate by language pair', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 86400000),
        end: new Date(now.getTime() + 86400000),
      };

      trackAIUsage('openai', 1000, 'en', 'ar');
      trackAIUsage('google', 2000, 'en', 'ar');
      trackAIUsage('deepl', 1500, 'en', 'he');

      const stats = getAIUsageStats(period);

      expect(stats.byLanguagePair['en-ar'].characters).toBe(3000);
      expect(stats.byLanguagePair['en-he'].characters).toBe(1500);
    });

    it('should filter stats by date period', () => {
      const now = new Date();
      const oldPeriod: UsagePeriod = {
        start: new Date(now.getTime() - 172800000),
        end: new Date(now.getTime() - 86400000),
      };
      const currentPeriod: UsagePeriod = {
        start: new Date(now.getTime() - 3600000),
        end: new Date(now.getTime() + 3600000),
      };

      // These won't match current period
      const oldEntry = trackAIUsage('openai', 1000);
      oldEntry.timestamp = new Date(now.getTime() - 86400000);

      // This will match current period
      trackAIUsage('openai', 2000);

      const stats = getAIUsageStats(currentPeriod);
      expect(stats.totalCharacters).toBe(2000);
    });
  });

  describe('Cost by Provider', () => {
    it('should get cost breakdown by provider', () => {
      trackAIUsage('openai', 2000);
      trackAIUsage('google', 3000);
      trackAIUsage('deepl', 4000);

      const breakdown = getCostByProvider();

      expect(breakdown).toHaveLength(3);
      
      const openaiData = breakdown.find(b => b.provider === 'openai');
      expect(openaiData?.cost).toBe(0.04);
      expect(openaiData?.characters).toBe(2000);
      
      const googleData = breakdown.find(b => b.provider === 'google');
      expect(googleData?.cost).toBe(0.03);
      
      const deeplData = breakdown.find(b => b.provider === 'deepl');
      expect(deeplData?.cost).toBe(0.10);
    });

    it('should calculate average cost per 1K characters', () => {
      trackAIUsage('openai', 5000);

      const breakdown = getCostByProvider();
      const openaiData = breakdown.find(b => b.provider === 'openai');
      
      expect(openaiData?.avgCostPer1KChars).toBe(0.02);
    });

    it('should sort providers by cost descending', () => {
      trackAIUsage('openai', 1000);  // $0.02
      trackAIUsage('google', 5000);  // $0.05
      trackAIUsage('deepl', 1000);   // $0.025

      const breakdown = getCostByProvider();
      expect(breakdown[0].provider).toBe('google');
      expect(breakdown[1].provider).toBe('deepl');
      expect(breakdown[2].provider).toBe('openai');
    });

    it('should get cost for specific provider', () => {
      trackAIUsage('openai', 2000);
      trackAIUsage('google', 3000);

      expect(getCostForProvider('openai')).toBe(0.04);
      expect(getCostForProvider('google')).toBe(0.03);
    });

    it('should return zero for provider with no usage', () => {
      trackAIUsage('openai', 1000);
      
      expect(getCostForProvider('google')).toBe(0);
    });

    it('should filter by period when getting cost breakdown', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 3600000),
        end: new Date(now.getTime() + 3600000),
      };

      // Old entry
      const oldEntry = trackAIUsage('openai', 5000);
      oldEntry.timestamp = new Date(now.getTime() - 86400000);

      // Recent entry
      trackAIUsage('openai', 1000);

      const breakdown = getCostByProvider(period);
      const openaiData = breakdown.find(b => b.provider === 'openai');
      
      expect(openaiData?.cost).toBe(0.02);
    });
  });

  describe('Usage by Language', () => {
    it('should get usage breakdown by language pair', () => {
      trackAIUsage('openai', 1000, 'en', 'ar');
      trackAIUsage('google', 2000, 'en', 'ar');
      trackAIUsage('deepl', 1500, 'en', 'he');

      const usage = getUsageByLanguage();

      expect(usage).toHaveLength(2);
      
      const arUsage = usage.find(u => u.targetLocale === 'ar');
      expect(arUsage?.characters).toBe(3000);
      expect(arUsage?.primaryProvider).toBe('google'); // Most characters
      
      const heUsage = usage.find(u => u.targetLocale === 'he');
      expect(heUsage?.characters).toBe(1500);
    });

    it('should sort usage by character count descending', () => {
      trackAIUsage('openai', 1000, 'en', 'de');
      trackAIUsage('openai', 5000, 'en', 'fr');
      trackAIUsage('openai', 3000, 'en', 'es');

      const usage = getUsageByLanguage();
      
      expect(usage[0].targetLocale).toBe('fr');
      expect(usage[1].targetLocale).toBe('es');
      expect(usage[2].targetLocale).toBe('de');
    });

    it('should filter by period when getting usage by language', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 3600000),
        end: new Date(now.getTime() + 3600000),
      };

      const oldEntry = trackAIUsage('openai', 5000, 'en', 'ar');
      oldEntry.timestamp = new Date(now.getTime() - 86400000);

      trackAIUsage('openai', 1000, 'en', 'he');

      const usage = getUsageByLanguage(period);
      
      expect(usage).toHaveLength(1);
      expect(usage[0].targetLocale).toBe('he');
    });
  });

  describe('Usage Trends', () => {
    it('should get daily usage trends', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 2 * 86400000),
        end: new Date(now.getTime() + 86400000),
      };

      trackAIUsage('openai', 1000);
      trackAIUsage('openai', 2000);

      const trends = getUsageTrends(period);

      // Should have 4 days: 2 days ago, 1 day ago, today, tomorrow
      expect(trends.length).toBeGreaterThanOrEqual(3);
      
      // Today's data should include our tracked usage
      const today = trends.find(t => 
        t.date.toISOString().split('T')[0] === now.toISOString().split('T')[0]
      );
      expect(today?.characters).toBe(3000);
    });

    it('should initialize all days in period even with no data', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 2 * 86400000),
        end: now,
      };

      const trends = getUsageTrends(period);
      
      expect(trends).toHaveLength(3);
      trends.forEach(day => {
        expect(day.characters).toBe(0);
        expect(day.cost).toBe(0);
        expect(day.calls).toBe(0);
      });
    });
  });

  describe('Quota Management', () => {
    it('should get quota status', () => {
      trackAIUsage('openai', 50000);
      
      const status = getQuotaStatus();
      
      expect(status.used).toBe(50000);
      expect(status.limit).toBe(1000000);
      expect(status.remaining).toBe(950000);
      expect(status.percentage).toBe(5);
    });

    it('should return zero remaining when over quota', () => {
      setCharacterQuota(1000);
      trackAIUsage('openai', 1500);
      
      const status = getQuotaStatus();
      
      expect(status.used).toBe(1500);
      expect(status.remaining).toBe(0);
      expect(status.percentage).toBe(150);
    });

    it('should set and get character quota', () => {
      setCharacterQuota(500000);
      
      expect(getCharacterQuota()).toBe(500000);
    });

    it('should reset quota on clear', () => {
      setCharacterQuota(500000);
      clearAIUsageData();
      
      expect(getCharacterQuota()).toBe(1000000);
    });

    it('should filter quota by period', () => {
      const now = new Date();
      const oldEntry = trackAIUsage('openai', 100000);
      oldEntry.timestamp = new Date(now.getTime() - 86400000);
      
      trackAIUsage('openai', 50000);

      const period: UsagePeriod = {
        start: new Date(now.getTime() - 3600000),
        end: new Date(now.getTime() + 3600000),
      };

      const status = getQuotaStatus(period);
      expect(status.used).toBe(50000);
    });
  });

  describe('Provider Comparison', () => {
    it('should compare providers by efficiency', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 86400000),
        end: new Date(now.getTime() + 86400000),
      };

      // Google: 1000 chars / $0.01 = 100000 efficiency
      trackAIUsage('google', 1000);
      // OpenAI: 1000 chars / $0.02 = 50000 efficiency
      trackAIUsage('openai', 1000);

      const comparison = compareProviders(period);
      
      expect(comparison[0].provider).toBe('google');
      expect(comparison[1].provider).toBe('openai');
      expect(comparison[0].efficiency).toBeGreaterThan(comparison[1].efficiency);
    });
  });

  describe('API Call Counts', () => {
    it('should get API call counts by provider', () => {
      trackAIUsage('openai', 1000, 'en', 'ar', 2);
      trackAIUsage('openai', 2000, 'en', 'ar', 3);
      trackAIUsage('google', 1500, 'en', 'he', 1);

      const counts = getApiCallCounts();
      
      expect(counts.openai).toBe(5);
      expect(counts.google).toBe(1);
      expect(counts.deepl).toBe(0);
    });

    it('should filter API call counts by period', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 3600000),
        end: new Date(now.getTime() + 3600000),
      };

      const oldEntry = trackAIUsage('openai', 1000, 'en', 'ar', 5);
      oldEntry.timestamp = new Date(now.getTime() - 86400000);

      trackAIUsage('openai', 1000, 'en', 'ar', 3);

      const counts = getApiCallCounts(period);
      expect(counts.openai).toBe(3);
    });
  });

  describe('Characters by Engine', () => {
    it('should get characters translated per engine', () => {
      trackAIUsage('openai', 5000);
      trackAIUsage('openai', 3000);
      trackAIUsage('google', 4000);
      trackAIUsage('deepl', 2000);

      const chars = getCharactersByEngine();
      
      expect(chars.openai).toBe(8000);
      expect(chars.google).toBe(4000);
      expect(chars.deepl).toBe(2000);
    });

    it('should filter characters by period', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 3600000),
        end: new Date(now.getTime() + 3600000),
      };

      const oldEntry = trackAIUsage('openai', 10000);
      oldEntry.timestamp = new Date(now.getTime() - 86400000);

      trackAIUsage('openai', 5000);

      const chars = getCharactersByEngine(period);
      expect(chars.openai).toBe(5000);
    });
  });

  describe('CSV Export', () => {
    it('should export usage data to CSV', () => {
      trackAIUsage('openai', 1000, 'en', 'ar', 1);
      trackAIUsage('google', 2000, 'en', 'he', 2);

      const csv = exportAIUsageToCSV();
      
      expect(csv).toContain('timestamp,provider,source_locale,target_locale,characters,cost,api_calls');
      expect(csv).toContain('openai');
      expect(csv).toContain('google');
      expect(csv).toContain('en');
      expect(csv).toContain('ar');
      expect(csv).toContain('he');
    });

    it('should export only headers when no data', () => {
      const csv = exportAIUsageToCSV();
      
      expect(csv).toBe('timestamp,provider,source_locale,target_locale,characters,cost,api_calls');
    });

    it('should filter CSV export by period', () => {
      const now = new Date();
      const period: UsagePeriod = {
        start: new Date(now.getTime() - 3600000),
        end: new Date(now.getTime() + 3600000),
      };

      const oldEntry = trackAIUsage('openai', 1000);
      oldEntry.timestamp = new Date(now.getTime() - 86400000);

      trackAIUsage('google', 2000);

      const csv = exportAIUsageToCSV(period);
      
      expect(csv).toContain('google');
      expect(csv).not.toContain('openai,en,ar');
    });
  });

  describe('Monthly Usage Summary', () => {
    it('should get monthly usage summary for specified months', () => {
      // Track some usage in current month
      trackAIUsage('openai', 10000);
      trackAIUsage('google', 5000);

      const summary = getMonthlyUsageSummary(3);
      
      expect(summary).toHaveLength(3);
      // Current month should have our data
      const currentMonth = summary[summary.length - 1];
      expect(currentMonth.characters).toBe(15000);
      expect(currentMonth.cost).toBeGreaterThan(0);
    });

    it('should return correct month format', () => {
      const summary = getMonthlyUsageSummary(1);
      
      expect(summary[0].month).toMatch(/^\d{4}-\d{2}$/);
    });
  });
});
