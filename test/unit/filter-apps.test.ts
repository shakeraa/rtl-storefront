import { describe, it, expect } from 'vitest';
import {
  // Label getters
  getFilterAppLabels,
  getCollectionFilterLabels,
  getPriceSliderLabels,
  getActiveFiltersLabels,
  // Format functions
  formatPriceSliderLabel,
  formatPriceValue,
  // Summary functions
  getActiveFiltersSummary,
  getResultsShowingText,
  // Filter group functions
  getLocalizedFilterGroups,
  // Aria labels
  getFilterAriaLabel,
  // Mobile labels
  getMobileFilterButtonLabel,
  // Input helpers
  getPriceInputPlaceholder,
  validatePriceRange,
  // Constants
  ARABIC_FILTER_APP_LABELS,
  ARABIC_COLLECTION_FILTER_LABELS,
  ARABIC_PRICE_SLIDER_LABELS,
  ARABIC_ACTIVE_FILTERS_LABELS,
  HEBREW_FILTER_APP_LABELS,
  HEBREW_COLLECTION_FILTER_LABELS,
  HEBREW_PRICE_SLIDER_LABELS,
  HEBREW_ACTIVE_FILTERS_LABELS,
  ENGLISH_FILTER_APP_LABELS,
  ENGLISH_COLLECTION_FILTER_LABELS,
  ENGLISH_PRICE_SLIDER_LABELS,
  ENGLISH_ACTIVE_FILTERS_LABELS,
} from '../../app/services/integrations/filter-apps';

describe('Filter Apps Integration Service - T0220', () => {
  // ==========================================================================
  // Locale Detection Tests
  // ==========================================================================
  describe('Locale Detection', () => {
    it('should return Arabic filter app labels for ar locale', () => {
      const labels = getFilterAppLabels('ar');
      expect(labels.app.title).toBe('تصفية المنتجات');
      expect(labels.app.clearAll).toBe('مسح الكل');
    });

    it('should return Hebrew filter app labels for he locale', () => {
      const labels = getFilterAppLabels('he');
      expect(labels.app.title).toBe('סינון מוצרים');
      expect(labels.app.clearAll).toBe('נקה הכל');
    });

    it('should return English filter app labels for en locale', () => {
      const labels = getFilterAppLabels('en');
      expect(labels.app.title).toBe('Filter Products');
      expect(labels.app.clearAll).toBe('Clear All');
    });

    it('should handle locale with region code', () => {
      const labels = getFilterAppLabels('ar-SA');
      expect(labels.app.applyFilters).toBe('تطبيق التصفية');
    });

    it('should default to English for unknown locale', () => {
      const labels = getFilterAppLabels('fr');
      expect(labels.app.title).toBe('Filter Products');
    });
  });

  // ==========================================================================
  // Collection Filter Labels Tests
  // ==========================================================================
  describe('Collection Filter Labels', () => {
    it('should get Arabic price filter labels', () => {
      const labels = getCollectionFilterLabels('ar');
      expect(labels.price.title).toBe('السعر');
      expect(labels.price.minLabel).toBe('من');
      expect(labels.price.maxLabel).toBe('إلى');
    });

    it('should get Hebrew availability filter labels', () => {
      const labels = getCollectionFilterLabels('he');
      expect(labels.availability.title).toBe('זמינות');
      expect(labels.availability.inStock).toBe('במלאי');
      expect(labels.availability.onSale).toBe('במבצע');
    });

    it('should get English size and color filter labels', () => {
      const labels = getCollectionFilterLabels('en');
      expect(labels.size.title).toBe('Size');
      expect(labels.color.title).toBe('Color');
    });

    it('should get Arabic brand and material labels', () => {
      const labels = getCollectionFilterLabels('ar');
      expect(labels.brand.title).toBe('العلامة التجارية');
      expect(labels.material.title).toBe('المادة');
    });

    it('should get Hebrew rating labels with andUp suffix', () => {
      const labels = getCollectionFilterLabels('he');
      expect(labels.rating.title).toBe('דירוג');
      expect(labels.rating.andUp).toBe('ומעלה');
    });
  });

  // ==========================================================================
  // Price Slider Labels Tests
  // ==========================================================================
  describe('Price Slider Labels', () => {
    it('should get Arabic price slider labels', () => {
      const labels = getPriceSliderLabels('ar');
      expect(labels.slider.minHandle).toBe('السعر الأدنى');
      expect(labels.slider.maxHandle).toBe('السعر الأقصى');
    });

    it('should get Hebrew price slider input labels', () => {
      const labels = getPriceSliderLabels('he');
      expect(labels.input.from).toBe('מ');
      expect(labels.input.to).toBe('עד');
      expect(labels.input.go).toBe('החל');
    });

    it('should get English price slider validation messages', () => {
      const labels = getPriceSliderLabels('en');
      expect(labels.validation.minGreaterThanMax).toBe('Minimum price must be less than maximum price');
      expect(labels.validation.invalidRange).toBe('Invalid price range');
    });

    it('should get Arabic validation error messages', () => {
      const labels = getPriceSliderLabels('ar');
      expect(labels.validation.minGreaterThanMax).toContain('السعر الأدنى');
      expect(labels.validation.minGreaterThanMax).toContain('السعر الأقصى');
    });
  });

  // ==========================================================================
  // Active Filters Labels Tests
  // ==========================================================================
  describe('Active Filters Labels', () => {
    it('should get Arabic active filters labels', () => {
      const labels = getActiveFiltersLabels('ar');
      expect(labels.summary.showing).toBe('عرض');
      expect(labels.summary.of).toBe('من');
      expect(labels.summary.results).toBe('نتيجة');
    });

    it('should get Hebrew mobile filter labels', () => {
      const labels = getActiveFiltersLabels('he');
      expect(labels.mobile.showFilters).toBe('הצג מסננים');
      expect(labels.mobile.hideFilters).toBe('הסתר מסננים');
    });

    it('should get English filter chips labels', () => {
      const labels = getActiveFiltersLabels('en');
      expect(labels.chips.remove).toBe('Remove');
      expect(labels.chips.clearAll).toBe('Clear All');
    });

    it('should get Hebrew summary labels', () => {
      const labels = getActiveFiltersLabels('he');
      expect(labels.summary.filteredBy).toBe('מסונן לפי');
    });
  });

  // ==========================================================================
  // Price Slider Formatting Tests
  // ==========================================================================
  describe('Price Slider Formatting', () => {
    it('should format price slider label in Arabic with AED', () => {
      const label = formatPriceSliderLabel(100, 500, 'AED', 'ar');
      expect(label).toContain('100');
      expect(label).toContain('500');
      expect(label).toContain('د.إ');
    });

    it('should format price slider label in Hebrew with ILS', () => {
      const label = formatPriceSliderLabel(50, 300, 'ILS', 'he');
      expect(label).toContain('50');
      expect(label).toContain('300');
      expect(label).toContain('₪');
    });

    it('should format price slider label in English with USD', () => {
      const label = formatPriceSliderLabel(10, 100, 'USD', 'en');
      expect(label).toContain('$');
      expect(label).toContain('10');
      expect(label).toContain('100');
    });

    it('should format single price value in Arabic', () => {
      const formatted = formatPriceValue(250, 'AED', 'ar');
      expect(formatted).toContain('250');
      expect(formatted).toContain('د.إ');
    });

    it('should format single price value in Hebrew', () => {
      const formatted = formatPriceValue(199, 'ILS', 'he');
      expect(formatted).toContain('199');
      expect(formatted).toContain('₪');
    });
  });

  // ==========================================================================
  // Active Filters Summary Tests
  // ==========================================================================
  describe('Active Filters Summary', () => {
    it('should return Arabic summary with 0 filters', () => {
      const summary = getActiveFiltersSummary(0, 'ar');
      expect(summary).toContain('عرض');
    });

    it('should return Arabic summary with 1 filter', () => {
      const summary = getActiveFiltersSummary(1, 'ar');
      expect(summary).toContain('1');
      expect(summary).toContain('نتيجة');
    });

    it('should return Arabic summary with 2 filters (dual form)', () => {
      const summary = getActiveFiltersSummary(2, 'ar');
      expect(summary).toContain('2');
      expect(summary).toContain('نتيجتين');
    });

    it('should return Arabic summary with 5 filters (plural form)', () => {
      const summary = getActiveFiltersSummary(5, 'ar');
      expect(summary).toContain('5');
      expect(summary).toContain('نتائج');
    });

    it('should return Hebrew summary with singular filter', () => {
      const summary = getActiveFiltersSummary(1, 'he');
      expect(summary).toContain('1');
      expect(summary).toContain('תוצאה');
    });

    it('should return Hebrew summary with plural filters', () => {
      const summary = getActiveFiltersSummary(3, 'he');
      expect(summary).toContain('3');
      expect(summary).toContain('תוצאות');
    });

    it('should return English summary with filters', () => {
      const summary = getActiveFiltersSummary(2, 'en');
      expect(summary).toContain('2');
      expect(summary).toContain('filters');
    });

    it('should return English summary with singular filter', () => {
      const summary = getActiveFiltersSummary(1, 'en');
      expect(summary).toContain('1');
      expect(summary).toContain('filter');
    });
  });

  // ==========================================================================
  // Results Showing Text Tests
  // ==========================================================================
  describe('Results Showing Text', () => {
    it('should generate Arabic results showing text', () => {
      const text = getResultsShowingText(10, 100, 'ar');
      expect(text).toContain('عرض');
      expect(text).toContain('10');
      expect(text).toContain('من');
      expect(text).toContain('100');
      expect(text).toContain('نتيجة');
    });

    it('should generate Hebrew results showing text', () => {
      const text = getResultsShowingText(20, 50, 'he');
      expect(text).toContain('מציג');
      expect(text).toContain('20');
      expect(text).toContain('מתוך');
      expect(text).toContain('50');
    });

    it('should generate English results showing text', () => {
      const text = getResultsShowingText(5, 25, 'en');
      expect(text).toContain('Showing');
      expect(text).toContain('5');
      expect(text).toContain('of');
      expect(text).toContain('25');
      expect(text).toContain('results');
    });
  });

  // ==========================================================================
  // Localized Filter Groups Tests
  // ==========================================================================
  describe('Localized Filter Groups', () => {
    it('should return all filter groups in Arabic', () => {
      const groups = getLocalizedFilterGroups('ar');
      expect(groups).toHaveLength(7);
      
      const priceGroup = groups.find(g => g.id === 'price');
      expect(priceGroup?.title).toBe('السعر');
      expect(priceGroup?.type).toBe('range');
      
      const availabilityGroup = groups.find(g => g.id === 'availability');
      expect(availabilityGroup?.title).toBe('التوفر');
      expect(availabilityGroup?.values).toHaveLength(3);
      expect(availabilityGroup?.values[0].label).toBe('متوفر');
    });

    it('should return filter groups with Hebrew labels', () => {
      const groups = getLocalizedFilterGroups('he');
      
      const sizeGroup = groups.find(g => g.id === 'size');
      expect(sizeGroup?.title).toBe('מידה');
      
      const colorGroup = groups.find(g => g.id === 'color');
      expect(colorGroup?.title).toBe('צבע');
    });

    it('should return rating group with star ratings in Arabic', () => {
      const groups = getLocalizedFilterGroups('ar');
      const ratingGroup = groups.find(g => g.id === 'rating');
      expect(ratingGroup?.title).toBe('التقييم');
      expect(ratingGroup?.values[0].label).toContain('★');
      expect(ratingGroup?.values[0].label).toContain('فأعلى');
    });
  });

  // ==========================================================================
  // Aria Labels Tests
  // ==========================================================================
  describe('Aria Labels', () => {
    it('should return Arabic aria label for panel', () => {
      const label = getFilterAriaLabel('panel', 'ar');
      expect(label).toBe('لوحة عوامل التصفية');
    });

    it('should return Hebrew aria label for slider', () => {
      const label = getFilterAriaLabel('slider', 'he');
      expect(label).toBe('טווח מחירים נבחר');
    });

    it('should return dynamic Arabic aria label for remove with context', () => {
      const label = getFilterAriaLabel('remove', 'ar', { filterName: 'السعر' });
      expect(label).toContain('إزالة عامل التصفية');
      expect(label).toContain('السعر');
    });

    it('should return English aria labels', () => {
      expect(getFilterAriaLabel('close', 'en')).toBe('Close Filters');
      expect(getFilterAriaLabel('handle', 'en')).toBe('Slider Handle');
    });
  });

  // ==========================================================================
  // Mobile Filter Button Tests
  // ==========================================================================
  describe('Mobile Filter Button Labels', () => {
    it('should return Arabic show filters label with no filters', () => {
      const label = getMobileFilterButtonLabel(0, 'ar');
      expect(label).toBe('عرض التصفية');
    });

    it('should return Arabic show filters label with filter count', () => {
      const label = getMobileFilterButtonLabel(3, 'ar');
      expect(label).toBe('عرض التصفية (3)');
    });

    it('should return Hebrew show filters label', () => {
      const label = getMobileFilterButtonLabel(0, 'he');
      expect(label).toBe('הצג מסננים');
    });

    it('should return Hebrew label with count', () => {
      const label = getMobileFilterButtonLabel(5, 'he');
      expect(label).toBe('הצג מסננים (5)');
    });
  });

  // ==========================================================================
  // Price Input Placeholder Tests
  // ==========================================================================
  describe('Price Input Placeholders', () => {
    it('should return Arabic min placeholder', () => {
      const placeholder = getPriceInputPlaceholder('min', 'ar');
      expect(placeholder).toBe('من');
    });

    it('should return Arabic max placeholder', () => {
      const placeholder = getPriceInputPlaceholder('max', 'ar');
      expect(placeholder).toBe('إلى');
    });

    it('should return Hebrew min/max placeholders', () => {
      expect(getPriceInputPlaceholder('min', 'he')).toBe('מ');
      expect(getPriceInputPlaceholder('max', 'he')).toBe('עד');
    });

    it('should return English min/max placeholders', () => {
      expect(getPriceInputPlaceholder('min', 'en')).toBe('Min');
      expect(getPriceInputPlaceholder('max', 'en')).toBe('Max');
    });
  });

  // ==========================================================================
  // Price Range Validation Tests
  // ==========================================================================
  describe('Price Range Validation', () => {
    it('should validate correct price range', () => {
      const result = validatePriceRange(10, 100, 'en');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should invalidate when min > max in Arabic', () => {
      const result = validatePriceRange(100, 10, 'ar');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('السعر الأدنى');
    });

    it('should invalidate when min > max in Hebrew', () => {
      const result = validatePriceRange(100, 10, 'he');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('מחיר מינימום');
    });

    it('should invalidate negative prices', () => {
      const result = validatePriceRange(-10, 50, 'en');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid price range');
    });
  });

  // ==========================================================================
  // Label Constants Completeness Tests
  // ==========================================================================
  describe('Label Constants Completeness', () => {
    it('should have all required Arabic filter app labels', () => {
      expect(ARABIC_FILTER_APP_LABELS.app.title).toBeDefined();
      expect(ARABIC_FILTER_APP_LABELS.app.clearAll).toBeDefined();
      expect(ARABIC_FILTER_APP_LABELS.app.applyFilters).toBeDefined();
      expect(ARABIC_FILTER_APP_LABELS.app.filterBy).toBeDefined();
      expect(ARABIC_FILTER_APP_LABELS.app.noFilters).toBeDefined();
    });

    it('should have all Hebrew collection filter labels', () => {
      expect(HEBREW_COLLECTION_FILTER_LABELS.price.title).toBeDefined();
      expect(HEBREW_COLLECTION_FILTER_LABELS.price.minLabel).toBeDefined();
      expect(HEBREW_COLLECTION_FILTER_LABELS.price.maxLabel).toBeDefined();
      expect(HEBREW_COLLECTION_FILTER_LABELS.availability.inStock).toBeDefined();
      expect(HEBREW_COLLECTION_FILTER_LABELS.availability.outOfStock).toBeDefined();
    });

    it('should have all English price slider labels', () => {
      expect(ENGLISH_PRICE_SLIDER_LABELS.slider.minHandle).toBeDefined();
      expect(ENGLISH_PRICE_SLIDER_LABELS.slider.maxHandle).toBeDefined();
      expect(ENGLISH_PRICE_SLIDER_LABELS.input.from).toBeDefined();
      expect(ENGLISH_PRICE_SLIDER_LABELS.input.to).toBeDefined();
      expect(ENGLISH_PRICE_SLIDER_LABELS.validation.minGreaterThanMax).toBeDefined();
    });

    it('should have all Arabic active filters labels', () => {
      expect(ARABIC_ACTIVE_FILTERS_LABELS.summary.showing).toBeDefined();
      expect(ARABIC_ACTIVE_FILTERS_LABELS.summary.of).toBeDefined();
      expect(ARABIC_ACTIVE_FILTERS_LABELS.summary.results).toBeDefined();
      expect(ARABIC_ACTIVE_FILTERS_LABELS.chips.remove).toBeDefined();
      expect(ARABIC_ACTIVE_FILTERS_LABELS.mobile.showFilters).toBeDefined();
    });

    it('should have filter type labels in all languages', () => {
      expect(ARABIC_FILTER_APP_LABELS.filterTypes.range).toBeDefined();
      expect(HEBREW_FILTER_APP_LABELS.filterTypes.checkbox).toBeDefined();
      expect(ENGLISH_FILTER_APP_LABELS.filterTypes.multiSelect).toBeDefined();
    });

    it('should have accessibility labels in all languages', () => {
      expect(ARABIC_FILTER_APP_LABELS.accessibility.filtersPanel).toBeDefined();
      expect(HEBREW_FILTER_APP_LABELS.accessibility.closeFilters).toBeDefined();
      expect(ENGLISH_FILTER_APP_LABELS.accessibility.removeFilter).toBeDefined();
    });
  });

  // ==========================================================================
  // Filter Types Support Tests
  // ==========================================================================
  describe('Filter Types Support', () => {
    it('should support range filter type', () => {
      const groups = getLocalizedFilterGroups('en');
      const priceGroup = groups.find(g => g.id === 'price');
      expect(priceGroup?.type).toBe('range');
    });

    it('should support checkbox filter type', () => {
      const groups = getLocalizedFilterGroups('en');
      const availabilityGroup = groups.find(g => g.id === 'availability');
      expect(availabilityGroup?.type).toBe('checkbox');
    });

    it('should support multi-select filter type', () => {
      const groups = getLocalizedFilterGroups('en');
      const sizeGroup = groups.find(g => g.id === 'size');
      expect(sizeGroup?.type).toBe('multi_select');
    });

    it('should support single-select filter type', () => {
      const groups = getLocalizedFilterGroups('en');
      const ratingGroup = groups.find(g => g.id === 'rating');
      expect(ratingGroup?.type).toBe('single_select');
    });

    it('should have correct Arabic filter type labels', () => {
      const labels = getFilterAppLabels('ar');
      expect(labels.filterTypes.range).toBe('نطاق');
      expect(labels.filterTypes.checkbox).toBe('خيار متعدد');
    });
  });
});
