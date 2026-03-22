import { describe, it, expect } from 'vitest';
import {
  getRegionalTerminology,
  getAllTerminologyForMarket,
  analyzeKeywords,
  getTrendingKeywords,
  getHighOpportunityKeywords,
  getMarketInsights,
  getSupportedMarkets,
  compareMarkets,
  getCulturalPreferences,
  getColorRecommendations,
  getMessagingGuidelines,
  getTranslationRecommendations,
  checkCulturalAppropriateness,
  getSeasonalTranslationFocus,
  getKeywordSuggestions,
  REGIONAL_TERMINOLOGY,
  COMPETITOR_KEYWORDS,
  MARKET_INSIGHTS,
  CULTURAL_PREFERENCES,
} from '../../app/services/translation-features/market-research';

describe('Market Research Service - T0340', () => {
  describe('getRegionalTerminology()', () => {
    it('should return terminology for "discount" in Saudi Arabia', () => {
      const results = getRegionalTerminology('discount', 'SA');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.arabic === 'خصم')).toBe(true);
    });

    it('should return terminology for "sale" in UAE', () => {
      const results = getRegionalTerminology('sale', 'AE');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return terminology for "discount" in Egypt', () => {
      const results = getRegionalTerminology('discount', 'EG');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown term', () => {
      const results = getRegionalTerminology('xyzunknown', 'SA');
      expect(results).toEqual([]);
    });

    it('should return empty array for unknown market', () => {
      const results = getRegionalTerminology('discount', 'XX' as any);
      expect(results).toEqual([]);
    });

    it('should find alternative terms in search', () => {
      const results = getRegionalTerminology('تخفيض', 'SA');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case-insensitive', () => {
      const lowerResults = getRegionalTerminology('discount', 'SA');
      const upperResults = getRegionalTerminology('DISCOUNT', 'SA');
      expect(lowerResults.length).toBe(upperResults.length);
    });
  });

  describe('getAllTerminologyForMarket()', () => {
    it('should return all terminology for Saudi Arabia', () => {
      const results = getAllTerminologyForMarket('SA');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.market === 'SA')).toBe(true);
    });

    it('should return all terminology for UAE', () => {
      const results = getAllTerminologyForMarket('AE');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter by industry', () => {
      const fashionTerms = getAllTerminologyForMarket('SA', 'fashion');
      expect(fashionTerms.every(r => r.industry === 'fashion')).toBe(true);
    });

    it('should return empty array for market with no terms', () => {
      const results = getAllTerminologyForMarket('XX' as any);
      expect(results).toEqual([]);
    });
  });

  describe('analyzeKeywords()', () => {
    it('should analyze single keyword for Saudi Arabia', () => {
      const results = analyzeKeywords(['white friday'], 'SA');
      expect(results.length).toBe(1);
      expect(results[0].found).toBe(true);
    });

    it('should analyze multiple keywords for UAE', () => {
      const results = analyzeKeywords(['ramadan offers', 'eid sale'], 'AE');
      expect(results.length).toBe(2);
      expect(results[0].found).toBe(true);
    });

    it('should provide alternatives for found keywords', () => {
      const results = analyzeKeywords(['free delivery'], 'SA');
      expect(results[0].found).toBe(true);
      expect(results[0].alternatives.length).toBeGreaterThan(0);
    });

    it('should return market-specific results', () => {
      const saResults = analyzeKeywords(['white friday'], 'SA');
      expect(saResults[0].found).toBe(true);
    });

    it('should handle empty keywords array', () => {
      const results = analyzeKeywords([], 'SA');
      expect(results).toEqual([]);
    });
  });

  describe('getTrendingKeywords()', () => {
    it('should return trending keywords for Saudi Arabia', () => {
      const results = getTrendingKeywords('SA');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.trending)).toBe(true);
    });

    it('should return trending keywords for UAE', () => {
      const results = getTrendingKeywords('AE');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', () => {
      const results = getTrendingKeywords('SA', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return sorted by search volume', () => {
      const results = getTrendingKeywords('SA', 5);
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].searchVolume).toBeGreaterThanOrEqual(results[i + 1].searchVolume);
      }
    });

    it('should return empty array for unsupported market', () => {
      const results = getTrendingKeywords('XX' as any);
      expect(results).toEqual([]);
    });
  });

  describe('getHighOpportunityKeywords()', () => {
    it('should return low competition keywords', () => {
      const results = getHighOpportunityKeywords('SA');
      expect(results.every(r => r.competition === 'low')).toBe(true);
    });

    it('should return keywords for supported markets', () => {
      const results = getHighOpportunityKeywords('AE');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', () => {
      const results = getHighOpportunityKeywords('SA', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getMarketInsights()', () => {
    it('should return insights for Saudi Arabia', () => {
      const insights = getMarketInsights('SA');
      expect(insights).toBeDefined();
      expect(insights?.marketName).toBe('Saudi Arabia');
      expect(insights?.population).toBe(35000000);
    });

    it('should return insights for UAE', () => {
      const insights = getMarketInsights('AE');
      expect(insights?.marketName).toBe('United Arab Emirates');
    });

    it('should return insights for Egypt', () => {
      const insights = getMarketInsights('EG');
      expect(insights?.dialect).toBe('Egyptian Arabic');
    });

    it('should return null for unknown market', () => {
      const insights = getMarketInsights('XX' as any);
      expect(insights).toBeNull();
    });

    it('should include translation preferences', () => {
      const insights = getMarketInsights('SA');
      expect(insights?.translationPreferences).toBeDefined();
      expect(insights?.translationPreferences.formality).toBeDefined();
    });

    it('should include preferred payment methods', () => {
      const insights = getMarketInsights('SA');
      expect(insights?.preferredPayment).toContain('Mada');
    });

    it('should include cultural considerations', () => {
      const insights = getMarketInsights('SA');
      expect(insights?.culturalConsiderations.length).toBeGreaterThan(0);
    });
  });

  describe('getSupportedMarkets()', () => {
    it('should return array of market codes', () => {
      const markets = getSupportedMarkets();
      expect(markets).toContain('SA');
      expect(markets).toContain('AE');
      expect(markets).toContain('EG');
    });

    it('should include all 14 MENA markets', () => {
      const markets = getSupportedMarkets();
      expect(markets.length).toBe(14);
      ['SA', 'AE', 'EG', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IQ', 'MA', 'DZ', 'TN', 'LY'].forEach(m => {
        expect(markets).toContain(m);
      });
    });
  });

  describe('compareMarkets()', () => {
    it('should compare Saudi Arabia and UAE', () => {
      const comparison = compareMarkets('SA', 'AE');
      expect(comparison).toBeDefined();
      expect(comparison?.marketA.market).toBe('SA');
      expect(comparison?.marketB.market).toBe('AE');
    });

    it('should include population difference', () => {
      const comparison = compareMarkets('SA', 'AE');
      expect(comparison?.differences.populationDiff).toBeDefined();
    });

    it('should identify shared categories', () => {
      const comparison = compareMarkets('SA', 'AE');
      expect(comparison?.differences.sharedCategories.length).toBeGreaterThan(0);
    });

    it('should return null for invalid market', () => {
      const comparison = compareMarkets('XX' as any, 'SA');
      expect(comparison).toBeNull();
    });
  });

  describe('getCulturalPreferences()', () => {
    it('should return preferences for Saudi Arabia', () => {
      const prefs = getCulturalPreferences('SA');
      expect(prefs).toBeDefined();
      expect(prefs?.colors.preferred.length).toBeGreaterThan(0);
    });

    it('should return preferences for Egypt', () => {
      const prefs = getCulturalPreferences('EG');
      expect(prefs?.imagery.preferred).toContain('Pyramids');
    });

    it('should return seasonal events', () => {
      const prefs = getCulturalPreferences('SA');
      expect(prefs?.seasonalEvents.length).toBeGreaterThan(0);
    });

    it('should return null for unknown market', () => {
      const prefs = getCulturalPreferences('XX' as any);
      expect(prefs).toBeNull();
    });
  });

  describe('getColorRecommendations()', () => {
    it('should return general colors for Saudi Arabia', () => {
      const colors = getColorRecommendations('SA');
      expect(colors.length).toBeGreaterThan(0);
    });

    it('should return CTA colors', () => {
      const colors = getColorRecommendations('SA', 'cta');
      expect(colors.length).toBeGreaterThan(0);
    });

    it('should return luxury colors', () => {
      const colors = getColorRecommendations('AE', 'luxury');
      expect(colors).toContain('Gold');
    });

    it('should return discount colors', () => {
      const colors = getColorRecommendations('EG', 'discount');
      expect(colors).toContain('Red');
    });

    it('should return empty array for unknown market', () => {
      const colors = getColorRecommendations('XX' as any);
      expect(colors).toEqual([]);
    });
  });

  describe('getMessagingGuidelines()', () => {
    it('should return guidelines for Saudi Arabia', () => {
      const guidelines = getMessagingGuidelines('SA');
      expect(guidelines).toBeDefined();
      expect(guidelines?.tone).toBeDefined();
    });

    it('should return taboo list', () => {
      const guidelines = getMessagingGuidelines('SA');
      expect(guidelines?.taboos.length).toBeGreaterThan(0);
    });

    it('should return seasonal focus', () => {
      const guidelines = getMessagingGuidelines('AE');
      expect(guidelines?.seasonalFocus.length).toBeGreaterThan(0);
    });

    it('should return null for unknown market', () => {
      const guidelines = getMessagingGuidelines('XX' as any);
      expect(guidelines).toBeNull();
    });
  });

  describe('getTranslationRecommendations()', () => {
    it('should return recommendations for Saudi Arabia', () => {
      const recs = getTranslationRecommendations('SA');
      expect(recs?.formality).toBe('formal');
      expect(recs?.numberStyle).toBe('hindi');
    });

    it('should return recommendations for Egypt', () => {
      const recs = getTranslationRecommendations('EG');
      expect(recs?.numberStyle).toBe('arabic');
      expect(recs?.formality).toBe('casual');
    });

    it('should adjust formality for legal context', () => {
      const recs = getTranslationRecommendations('EG', 'legal');
      expect(recs?.formality).toBe('formal');
    });

    it('should include dialect notes', () => {
      const recs = getTranslationRecommendations('SA');
      expect(recs?.dialectNotes).toContain('Gulf Arabic');
    });

    it('should return null for unknown market', () => {
      const recs = getTranslationRecommendations('XX' as any);
      expect(recs).toBeNull();
    });
  });

  describe('checkCulturalAppropriateness()', () => {
    it('should approve appropriate content for Saudi Arabia', () => {
      const result = checkCulturalAppropriateness('Beautiful products for your family', 'SA');
      expect(result.appropriate).toBe(true);
    });

    it('should warn about alcohol references', () => {
      const result = checkCulturalAppropriateness('Best wine selection available', 'SA');
      expect(result.appropriate).toBe(false);
      expect(result.warnings.some(w => w.includes('alcohol'))).toBe(true);
    });

    it('should warn about pork references', () => {
      const result = checkCulturalAppropriateness('Delicious bacon for sale', 'AE');
      expect(result.warnings.some(w => w.includes('pork'))).toBe(true);
    });

    it('should provide suggestions', () => {
      const result = checkCulturalAppropriateness('Hello world', 'SA');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should return not appropriate for unknown market', () => {
      const result = checkCulturalAppropriateness('Hello', 'XX' as any);
      expect(result.appropriate).toBe(false);
      expect(result.warnings).toContain('Unknown market');
    });
  });

  describe('getSeasonalTranslationFocus()', () => {
    it('should return focus for Saudi Arabia', () => {
      const focus = getSeasonalTranslationFocus('SA');
      expect(focus).toBeDefined();
    });

    it('should return focus with Ramadan events', () => {
      const focus = getSeasonalTranslationFocus('SA');
      const ramadanEvent = focus.find(f => f.event === 'Ramadan');
      expect(ramadanEvent).toBeDefined();
      expect(ramadanEvent?.arabicName).toBe('رمضان');
    });

    it('should return focus for specific month', () => {
      const focus = getSeasonalTranslationFocus('AE', 'January');
      expect(focus.some(f => f.event === 'Dubai Shopping Festival')).toBe(true);
    });

    it('should return empty array for unknown market', () => {
      const focus = getSeasonalTranslationFocus('XX' as any);
      expect(focus).toEqual([]);
    });
  });

  describe('getKeywordSuggestions()', () => {
    it('should suggest keywords based on text', () => {
      const suggestions = getKeywordSuggestions('white friday sale discount', 'SA');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return relevant keywords for market', () => {
      const suggestions = getKeywordSuggestions('free delivery shipping', 'SA');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should sort by relevance', () => {
      const suggestions = getKeywordSuggestions('ramadan offers', 'SA');
      if (suggestions.length > 1) {
        expect(suggestions[0].relevance).toBeGreaterThanOrEqual(suggestions[1].relevance);
      }
    });

    it('should return empty array for unrelated text', () => {
      const suggestions = getKeywordSuggestions('xyz123nonexistent', 'SA');
      expect(suggestions).toEqual([]);
    });
  });

  describe('Data Integrity', () => {
    it('should have regional terminology for all markets', () => {
      const markets = getSupportedMarkets();
      for (const market of markets) {
        const terms = getAllTerminologyForMarket(market);
        expect(terms.length).toBeGreaterThan(0);
      }
    });

    it('should have market insights for all markets', () => {
      const markets = getSupportedMarkets();
      for (const market of markets) {
        const insights = getMarketInsights(market);
        expect(insights).toBeDefined();
      }
    });

    it('should have cultural preferences for all markets', () => {
      const markets = getSupportedMarkets();
      for (const market of markets) {
        const prefs = getCulturalPreferences(market);
        expect(prefs).toBeDefined();
      }
    });

    it('should have valid popularity scores (0-100)', () => {
      for (const term of REGIONAL_TERMINOLOGY) {
        expect(term.popularity).toBeGreaterThanOrEqual(0);
        expect(term.popularity).toBeLessThanOrEqual(100);
      }
    });

    it('should have valid search volumes for keywords', () => {
      for (const keyword of COMPETITOR_KEYWORDS) {
        expect(keyword.searchVolume).toBeGreaterThan(0);
        expect(['low', 'medium', 'high']).toContain(keyword.competition);
      }
    });

    it('should have all required market insight fields', () => {
      for (const insight of MARKET_INSIGHTS) {
        expect(insight.market).toBeDefined();
        expect(insight.marketName).toBeDefined();
        expect(insight.population).toBeGreaterThan(0);
        expect(insight.preferredPayment.length).toBeGreaterThan(0);
        expect(insight.topCategories.length).toBeGreaterThan(0);
      }
    });

    it('should have cultural preferences for each market', () => {
      for (const pref of CULTURAL_PREFERENCES) {
        expect(pref.market).toBeDefined();
        expect(pref.colors.preferred.length).toBeGreaterThan(0);
        expect(pref.messaging.values.length).toBeGreaterThan(0);
      }
    });

    it('should have unique market codes in insights', () => {
      const markets = MARKET_INSIGHTS.map(m => m.market);
      const uniqueMarkets = [...new Set(markets)];
      expect(markets.length).toBe(uniqueMarkets.length);
    });

    it('should have proper dialect information for each market', () => {
      const dialects = ['Gulf Arabic', 'Egyptian Arabic', 'Levantine Arabic', 'Maghrebi Arabic'];
      for (const insight of MARKET_INSIGHTS) {
        expect(dialects.some(d => insight.dialect.includes(d)) || insight.dialect.includes('Mix')).toBe(true);
      }
    });
  });

  describe('Market-specific Behavior', () => {
    it('Saudi Arabia should prefer formal tone', () => {
      const recs = getTranslationRecommendations('SA');
      expect(recs?.formality).toBe('formal');
    });

    it('Egypt should prefer casual tone', () => {
      const recs = getTranslationRecommendations('EG');
      expect(recs?.formality).toBe('casual');
    });

    it('UAE should allow religious references', () => {
      const recs = getTranslationRecommendations('AE');
      expect(recs?.useReligiousReferences).toBe(true);
    });

    it('Lebanon should have more relaxed taboos', () => {
      const prefs = getCulturalPreferences('LB');
      expect(prefs?.messaging.taboos).not.toContain('Dating/romance imagery');
    });

    it('GCC countries should prefer Hindi numerals', () => {
      const saRecs = getTranslationRecommendations('SA');
      const qaRecs = getTranslationRecommendations('QA');
      expect(saRecs?.numberStyle).toBe('hindi');
      expect(qaRecs?.numberStyle).toBe('hindi');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string in terminology search', () => {
      const results = getRegionalTerminology('', 'SA');
      // Empty string returns all terms for the market (matches everything)
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle whitespace in terminology search', () => {
      const results = getRegionalTerminology('  discount  ', 'SA');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle special characters in content check', () => {
      const result = checkCulturalAppropriateness('Special @#$% content', 'SA');
      expect(result.appropriate).toBe(true);
    });

    it('should handle very long text in keyword suggestions', () => {
      const longText = 'ramadan offers '.repeat(100);
      const suggestions = getKeywordSuggestions(longText, 'SA');
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});
