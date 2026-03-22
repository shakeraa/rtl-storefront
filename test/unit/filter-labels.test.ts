import { describe, it, expect } from 'vitest';
import {
  getFilterLabels,
  getAvailabilityLabel,
  getPriceLabel,
  getPaginationLabel,
  formatPriceLabel,
  getAvailabilityOptions,
  getPriceRangeOptions,
  getSortOptions,
  getPaginationInfo,
  ARABIC_LABELS,
  HEBREW_LABELS,
  ENGLISH_LABELS,
} from '../../app/services/filter-labels';

describe('Filter Labels Service - T0139-T0141', () => {
  describe('Locale Detection', () => {
    it('should return Arabic labels for ar locale', () => {
      const labels = getFilterLabels('ar');
      expect(labels.availability.inStock).toBe('متوفر');
      expect(labels.availability.outOfStock).toBe('نفذت الكمية');
    });

    it('should return Hebrew labels for he locale', () => {
      const labels = getFilterLabels('he');
      expect(labels.availability.inStock).toBe('במלאי');
      expect(labels.availability.outOfStock).toBe('אזל מהמלאי');
    });

    it('should return English labels for en locale', () => {
      const labels = getFilterLabels('en');
      expect(labels.availability.inStock).toBe('In Stock');
      expect(labels.availability.outOfStock).toBe('Out of Stock');
    });

    it('should handle locale with region code', () => {
      const labels = getFilterLabels('ar-SA');
      expect(labels.availability.inStock).toBe('متوفر');
    });

    it('should default to English for unknown locale', () => {
      const labels = getFilterLabels('fr');
      expect(labels.availability.inStock).toBe('In Stock');
    });
  });

  describe('Availability Labels - T0139', () => {
    it('should get Arabic in stock label', () => {
      expect(getAvailabilityLabel('inStock', 'ar')).toBe('متوفر');
    });

    it('should get Arabic out of stock label', () => {
      expect(getAvailabilityLabel('outOfStock', 'ar')).toBe('نفذت الكمية');
    });

    it('should get Hebrew in stock label', () => {
      expect(getAvailabilityLabel('inStock', 'he')).toBe('במלאי');
    });

    it('should get Hebrew out of stock label', () => {
      expect(getAvailabilityLabel('outOfStock', 'he')).toBe('אזל מהמלאי');
    });

    it('should get low stock label in Arabic', () => {
      expect(getAvailabilityLabel('lowStock', 'ar')).toBe('الكمية محدودة');
    });

    it('should get preorder label in Arabic', () => {
      expect(getAvailabilityLabel('preorder', 'ar')).toBe('طلب مسبق');
    });

    it('should get backorder label in Hebrew', () => {
      expect(getAvailabilityLabel('backorder', 'he')).toBe('הזמנה חוזרת');
    });
  });

  describe('Price Labels - T0140', () => {
    it('should get Arabic price range label', () => {
      expect(getPriceLabel('priceRange', 'ar')).toBe('نطاق السعر');
    });

    it('should get Arabic min/max price labels', () => {
      expect(getPriceLabel('minPrice', 'ar')).toBe('الحد الأدنى');
      expect(getPriceLabel('maxPrice', 'ar')).toBe('الحد الأقصى');
    });

    it('should get Hebrew price range label', () => {
      expect(getPriceLabel('priceRange', 'he')).toBe('טווח מחירים');
    });

    it('should get Hebrew min/max price labels', () => {
      expect(getPriceLabel('minPrice', 'he')).toBe('מחיר מינימום');
      expect(getPriceLabel('maxPrice', 'he')).toBe('מחיר מקסימום');
    });

    it('should get price sort labels in Arabic', () => {
      expect(getPriceLabel('priceAscending', 'ar')).toBe('الأقل سعراً');
      expect(getPriceLabel('priceDescending', 'ar')).toBe('الأعلى سعراً');
    });

    it('should get under/over labels in Arabic', () => {
      expect(getPriceLabel('under', 'ar')).toBe('أقل من');
      expect(getPriceLabel('over', 'ar')).toBe('أكثر من');
    });

    it('should get under/over labels in Hebrew', () => {
      expect(getPriceLabel('under', 'he')).toBe('מתחת ל');
      expect(getPriceLabel('over', 'he')).toBe('מעל ל');
    });
  });

  describe('Pagination Labels - T0141', () => {
    it('should get Arabic pagination labels', () => {
      expect(getPaginationLabel('previous', 'ar')).toBe('السابق');
      expect(getPaginationLabel('next', 'ar')).toBe('التالي');
      expect(getPaginationLabel('page', 'ar')).toBe('صفحة');
      expect(getPaginationLabel('of', 'ar')).toBe('من');
    });

    it('should get Hebrew pagination labels', () => {
      expect(getPaginationLabel('previous', 'he')).toBe('הקודם');
      expect(getPaginationLabel('next', 'he')).toBe('הבא');
      expect(getPaginationLabel('page', 'he')).toBe('עמוד');
      expect(getPaginationLabel('of', 'he')).toBe('מתוך');
    });

    it('should get English pagination labels', () => {
      expect(getPaginationLabel('previous', 'en')).toBe('Previous');
      expect(getPaginationLabel('next', 'en')).toBe('Next');
    });

    it('should get results label in Arabic', () => {
      expect(getPaginationLabel('results', 'ar')).toBe('نتيجة');
    });

    it('should get items per page label in Hebrew', () => {
      expect(getPaginationLabel('itemsPerPage', 'he')).toBe('פריטים בעמוד');
    });
  });

  describe('Price Formatting', () => {
    it('should format price in Arabic with currency after amount', () => {
      const formatted = formatPriceLabel(100, 'AED', 'ar');
      expect(formatted).toContain('100');
      expect(formatted).toContain('AED');
    });

    it('should format price in Hebrew with currency before amount', () => {
      const formatted = formatPriceLabel(100, '₪', 'he');
      expect(formatted).toContain('100');
      expect(formatted).toContain('₪');
    });

    it('should format price in English', () => {
      const formatted = formatPriceLabel(99.99, '$', 'en');
      expect(formatted).toContain('99.99');
      expect(formatted).toContain('$');
    });
  });

  describe('Availability Options', () => {
    it('should return all availability options in Arabic', () => {
      const options = getAvailabilityOptions('ar');
      expect(options).toHaveLength(5);
      expect(options[0]).toEqual({ value: 'in_stock', label: 'متوفر' });
      expect(options[1]).toEqual({ value: 'out_of_stock', label: 'نفذت الكمية' });
    });

    it('should return all availability options in Hebrew', () => {
      const options = getAvailabilityOptions('he');
      expect(options).toHaveLength(5);
      expect(options[0]).toEqual({ value: 'in_stock', label: 'במלאי' });
      expect(options[1]).toEqual({ value: 'out_of_stock', label: 'אזל מהמלאי' });
    });
  });

  describe('Price Range Options', () => {
    it('should generate price range options in Arabic', () => {
      const ranges = [
        { min: 0, max: 50 },
        { min: 50, max: 100 },
        { min: 100, max: null },
      ];
      const options = getPriceRangeOptions('ar', 'AED', ranges);
      expect(options).toHaveLength(3);
      expect(options[0].label).toContain('أقل من');
      expect(options[2].label).toContain('أكثر من');
    });

    it('should generate price range options in Hebrew', () => {
      const ranges = [
        { min: 0, max: 100 },
        { min: 100, max: null },
      ];
      const options = getPriceRangeOptions('he', '₪', ranges);
      expect(options).toHaveLength(2);
      expect(options[0].label).toContain('מתחת ל');
      expect(options[1].label).toContain('מעל ל');
    });

    it('should include correct min/max values in options', () => {
      const ranges = [{ min: 50, max: 100 }];
      const options = getPriceRangeOptions('en', '$', ranges);
      expect(options[0].min).toBe(50);
      expect(options[0].max).toBe(100);
      expect(options[0].value).toBe('50-100');
    });
  });

  describe('Sort Options', () => {
    it('should return sort options in Arabic', () => {
      const options = getSortOptions('ar');
      expect(options).toHaveLength(2);
      expect(options[0]).toEqual({ value: 'price-asc', label: 'الأقل سعراً' });
      expect(options[1]).toEqual({ value: 'price-desc', label: 'الأعلى سعراً' });
    });

    it('should return sort options in Hebrew', () => {
      const options = getSortOptions('he');
      expect(options).toHaveLength(2);
      expect(options[0]).toEqual({ value: 'price-asc', label: 'מהזול ליקר' });
      expect(options[1]).toEqual({ value: 'price-desc', label: 'מהיקר לזול' });
    });
  });

  describe('Pagination Info', () => {
    it('should generate pagination info in Arabic', () => {
      const info = getPaginationInfo(1, 5, 100, 20, 'ar');
      expect(info).toContain('عرض');
      expect(info).toContain('من');
      expect(info).toContain('100');
      expect(info).toContain('نتيجة');
    });

    it('should generate pagination info in Hebrew', () => {
      const info = getPaginationInfo(2, 5, 100, 20, 'he');
      expect(info).toContain('מציג');
      expect(info).toContain('מתוך');
    });

    it('should calculate correct range for first page', () => {
      const info = getPaginationInfo(1, 5, 100, 20, 'en');
      expect(info).toContain('1-20');
    });

    it('should calculate correct range for middle page', () => {
      const info = getPaginationInfo(3, 5, 100, 20, 'en');
      expect(info).toContain('41-60');
    });

    it('should calculate correct range for last page with partial results', () => {
      const info = getPaginationInfo(5, 5, 95, 20, 'en');
      expect(info).toContain('81-95');
    });
  });

  describe('Complete Label Sets', () => {
    it('should have all required availability labels in Arabic', () => {
      const labels = ARABIC_LABELS.availability;
      expect(labels.inStock).toBeDefined();
      expect(labels.outOfStock).toBeDefined();
      expect(labels.lowStock).toBeDefined();
      expect(labels.preorder).toBeDefined();
      expect(labels.backorder).toBeDefined();
    });

    it('should have all required price labels in Hebrew', () => {
      const labels = HEBREW_LABELS.price;
      expect(labels.priceRange).toBeDefined();
      expect(labels.minPrice).toBeDefined();
      expect(labels.maxPrice).toBeDefined();
      expect(labels.priceAscending).toBeDefined();
      expect(labels.priceDescending).toBeDefined();
    });

    it('should have all required pagination labels in English', () => {
      const labels = ENGLISH_LABELS.pagination;
      expect(labels.previous).toBeDefined();
      expect(labels.next).toBeDefined();
      expect(labels.page).toBeDefined();
      expect(labels.of).toBeDefined();
      expect(labels.showing).toBeDefined();
      expect(labels.results).toBeDefined();
      expect(labels.itemsPerPage).toBeDefined();
    });
  });
});
