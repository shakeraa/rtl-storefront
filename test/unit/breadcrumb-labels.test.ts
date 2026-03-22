import { describe, it, expect } from 'vitest';
import {
  getBreadcrumbLabels,
  getBreadcrumbLabel,
  getSeparator,
  getAltSeparator,
  formatBreadcrumbPath,
  getBreadcrumbPath,
  renderBreadcrumbHTML,
  getBreadcrumbStructuredData,
  collapseBreadcrumbs,
  getBackNavigation,
  isRTLLocale,
  addBreadcrumbNameTranslation,
  getAvailableSeparators,
  validateBreadcrumbItems,
  ARABIC_BREADCRUMB_LABELS,
  HEBREW_BREADCRUMB_LABELS,
  ENGLISH_BREADCRUMB_LABELS,
  SEPARATOR_STYLES,
  COMMON_BREADCRUMB_NAMES,
} from '../../app/services/ui-labels/breadcrumbs';

describe('Breadcrumb Labels Service - T0142', () => {
  describe('Locale Detection', () => {
    it('should detect Arabic as RTL locale', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('ar-SA')).toBe(true);
      expect(isRTLLocale('ar-EG')).toBe(true);
    });

    it('should detect Hebrew as RTL locale', () => {
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('he-IL')).toBe(true);
    });

    it('should detect English as LTR locale', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('en-US')).toBe(false);
      expect(isRTLLocale('en-GB')).toBe(false);
    });

    it('should detect other RTL locales', () => {
      expect(isRTLLocale('fa')).toBe(true); // Persian
      expect(isRTLLocale('ur')).toBe(true); // Urdu
    });

    it('should default to LTR for unknown locales', () => {
      expect(isRTLLocale('fr')).toBe(false);
      expect(isRTLLocale('de')).toBe(false);
      expect(isRTLLocale('unknown')).toBe(false);
    });
  });

  describe('Breadcrumb Label Sets', () => {
    it('should return Arabic labels for ar locale', () => {
      const labels = getBreadcrumbLabels('ar');
      expect(labels.home).toBe('الرئيسية');
      expect(labels.back).toBe('رجوع');
      expect(labels.ariaLabel).toBe('مسار التنقل');
    });

    it('should return Hebrew labels for he locale', () => {
      const labels = getBreadcrumbLabels('he');
      expect(labels.home).toBe('בית');
      expect(labels.back).toBe('חזור');
      expect(labels.ariaLabel).toBe('שביל ניווט');
    });

    it('should return English labels for en locale', () => {
      const labels = getBreadcrumbLabels('en');
      expect(labels.home).toBe('Home');
      expect(labels.back).toBe('Back');
      expect(labels.ariaLabel).toBe('Breadcrumb');
    });

    it('should handle locale with region code', () => {
      const labels = getBreadcrumbLabels('ar-SA');
      expect(labels.home).toBe('الرئيسية');
      expect(labels.back).toBe('رجوع');
    });

    it('should default to English for unknown locale', () => {
      const labels = getBreadcrumbLabels('fr');
      expect(labels.home).toBe('Home');
      expect(labels.back).toBe('Back');
    });
  });

  describe('Individual Label Retrieval', () => {
    it('should get Arabic home label', () => {
      expect(getBreadcrumbLabel('home', 'ar')).toBe('الرئيسية');
    });

    it('should get Hebrew back label', () => {
      expect(getBreadcrumbLabel('back', 'he')).toBe('חזור');
    });

    it('should get English aria labels', () => {
      expect(getBreadcrumbLabel('ariaLabel', 'en')).toBe('Breadcrumb');
      expect(getBreadcrumbLabel('ariaCurrent', 'en')).toBe('Current page');
    });

    it('should get Arabic aria labels', () => {
      expect(getBreadcrumbLabel('ariaLabel', 'ar')).toBe('مسار التنقل');
      expect(getBreadcrumbLabel('ariaCurrent', 'ar')).toBe('الصفحة الحالية');
    });

    it('should get Hebrew aria labels', () => {
      expect(getBreadcrumbLabel('ariaLabel', 'he')).toBe('שביל ניווט');
      expect(getBreadcrumbLabel('ariaCurrent', 'he')).toBe('דף נוכחי');
    });

    it('should get navigation labels in Arabic', () => {
      expect(getBreadcrumbLabel('navigateTo', 'ar')).toBe('انتقل إلى');
      expect(getBreadcrumbLabel('youAreHere', 'ar')).toBe('أنت هنا');
    });

    it('should get navigation labels in Hebrew', () => {
      expect(getBreadcrumbLabel('navigateTo', 'he')).toBe('נווט אל');
      expect(getBreadcrumbLabel('youAreHere', 'he')).toBe('אתה כאן');
    });

    it('should get collapse/expand labels in Arabic', () => {
      expect(getBreadcrumbLabel('collapse', 'ar')).toBe('طي');
      expect(getBreadcrumbLabel('expand', 'ar')).toBe('توسيع');
    });

    it('should get collapse/expand labels in Hebrew', () => {
      expect(getBreadcrumbLabel('collapse', 'he')).toBe('כווץ');
      expect(getBreadcrumbLabel('expand', 'he')).toBe('הרחב');
    });
  });

  describe('Separator Selection', () => {
    it('should return default separator for English', () => {
      expect(getSeparator('en')).toBe('/');
    });

    it('should return RTL separator for Arabic', () => {
      expect(getSeparator('ar')).toBe('\\');
    });

    it('should return RTL separator for Hebrew', () => {
      expect(getSeparator('he')).toBe('\\');
    });

    it('should return slash style when specified', () => {
      expect(getSeparator('en', 'slash')).toBe('/');
    });

    it('should return arrow style for LTR', () => {
      expect(getSeparator('en', 'arrow')).toBe('>');
    });

    it('should return left arrow for RTL when arrow style specified', () => {
      expect(getSeparator('ar', 'arrow')).toBe('<');
      expect(getSeparator('he', 'arrow')).toBe('<');
    });

    it('should return double arrow for LTR', () => {
      expect(getSeparator('en', 'doubleArrow')).toBe('»');
    });

    it('should return left double arrow for RTL', () => {
      expect(getSeparator('ar', 'doubleArrow')).toBe('«');
    });

    it('should return alternative separator for English', () => {
      expect(getAltSeparator('en')).toBe('>');
    });

    it('should return RTL alternative separator for Arabic', () => {
      expect(getAltSeparator('ar')).toBe('»');
    });

    it('should return RTL alternative separator for Hebrew', () => {
      expect(getAltSeparator('he')).toBe('»');
    });
  });

  describe('Breadcrumb Path Formatting', () => {
    it('should format path with default separator', () => {
      const items = [
        { name: 'Home', item: '/' },
        { name: 'Products', item: '/products' },
        { name: 'Category', item: '/products/category' },
      ];
      const path = formatBreadcrumbPath(items, 'en');
      expect(path).toBe('Home / Products / Category');
    });

    it('should format path with arrow separator', () => {
      const items = [
        { name: 'Home', item: '/' },
        { name: 'Products', item: '/products' },
      ];
      const path = formatBreadcrumbPath(items, 'en', 'arrow');
      expect(path).toBe('Home > Products');
    });

    it('should format path with RTL-appropriate separator for Arabic', () => {
      const items = [
        { name: 'الرئيسية', item: '/' },
        { name: 'المنتجات', item: '/products' },
      ];
      const path = formatBreadcrumbPath(items, 'ar', 'arrow');
      expect(path).toBe('الرئيسية < المنتجات');
    });
  });

  describe('Breadcrumb Path Generation', () => {
    it('should generate breadcrumb path with translations', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
        { name: 'Products', nameAr: 'المنتجات', item: '/products', position: 2 },
      ];
      const path = getBreadcrumbPath(items, 'ar');
      expect(path[0].name).toBe('الرئيسية');
      expect(path[1].name).toBe('المنتجات');
    });

    it('should generate breadcrumb path with Hebrew translations', () => {
      const items = [
        { name: 'Home', nameHe: 'בית', item: '/', position: 1 },
        { name: 'Products', nameHe: 'מוצרים', item: '/products', position: 2 },
      ];
      const path = getBreadcrumbPath(items, 'he');
      expect(path[0].name).toBe('בית');
      expect(path[1].name).toBe('מוצרים');
    });

    it('should fallback to English when translation not available', () => {
      const items = [
        { name: 'Custom Page', item: '/custom', position: 1 },
      ];
      const path = getBreadcrumbPath(items, 'ar');
      expect(path[0].name).toBe('Custom Page');
    });

    it('should use common translations for known names', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Products', item: '/products', position: 2 },
        { name: 'Collections', item: '/collections', position: 3 },
      ];
      const pathAr = getBreadcrumbPath(items, 'ar');
      expect(pathAr[0].name).toBe('الرئيسية');
      expect(pathAr[1].name).toBe('المنتجات');
      expect(pathAr[2].name).toBe('المجموعات');
      
      const pathHe = getBreadcrumbPath(items, 'he');
      expect(pathHe[0].name).toBe('בית');
      expect(pathHe[1].name).toBe('מוצרים');
    });
  });

  describe('HTML Rendering', () => {
    it('should render breadcrumb HTML with English labels', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Products', item: '/products', position: 2 },
      ];
      const html = renderBreadcrumbHTML(items, 'en');
      expect(html).toContain('dir="ltr"');
      expect(html).toContain('aria-label="Breadcrumb"');
      expect(html).toContain('Home');
      expect(html).toContain('Products');
    });

    it('should render breadcrumb HTML with Arabic labels and RTL', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
        { name: 'Products', nameAr: 'المنتجات', item: '/products', position: 2 },
      ];
      const html = renderBreadcrumbHTML(items, 'ar');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('مسار التنقل');
      expect(html).toContain('الرئيسية');
      expect(html).toContain('المنتجات');
    });

    it('should render breadcrumb HTML with Hebrew labels', () => {
      const items = [
        { name: 'Home', nameHe: 'בית', item: '/', position: 1 },
        { name: 'Products', nameHe: 'מוצרים', item: '/products', position: 2 },
      ];
      const html = renderBreadcrumbHTML(items, 'he');
      expect(html).toContain('dir="rtl"');
      expect(html).toContain('שביל ניווט');
      expect(html).toContain('בית');
    });

    it('should render last item as current page', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Current', item: '/current', position: 2 },
      ];
      const html = renderBreadcrumbHTML(items, 'en');
      expect(html).toContain('aria-current="page"');
      expect(html).toContain('breadcrumb__item--current');
    });

    it('should add home item when showHome is true', () => {
      const items = [
        { name: 'Products', item: '/products', position: 1 },
      ];
      const html = renderBreadcrumbHTML(items, 'en', { showHome: true });
      expect(html).toContain('Home');
    });

    it('should use custom home URL when provided', () => {
      const items = [
        { name: 'Products', item: '/products', position: 1 },
      ];
      const html = renderBreadcrumbHTML(items, 'en', { showHome: true, homeUrl: '/home' });
      expect(html).toContain('href="/home"');
    });
  });

  describe('Structured Data Generation', () => {
    it('should generate valid schema.org structured data', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Products', item: '/products', position: 2 },
      ];
      const data = getBreadcrumbStructuredData(items, 'en', 'https://example.com');
      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('BreadcrumbList');
      expect(data.itemListElement).toHaveLength(2);
      expect(data.itemListElement[0]['@type']).toBe('ListItem');
    });

    it('should include translated names in structured data', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
        { name: 'Products', nameAr: 'المنتجات', item: '/products', position: 2 },
      ];
      const data = getBreadcrumbStructuredData(items, 'ar', 'https://example.com');
      expect(data.itemListElement[0].name).toBe('الرئيسية');
      expect(data.itemListElement[1].name).toBe('المنتجات');
    });

    it('should prepend base URL to relative paths', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
      ];
      const data = getBreadcrumbStructuredData(items, 'en', 'https://example.com');
      expect(data.itemListElement[0].item).toBe('https://example.com/');
    });

    it('should not modify absolute URLs', () => {
      const items = [
        { name: 'External', item: 'https://external.com/page', position: 1 },
      ];
      const data = getBreadcrumbStructuredData(items, 'en', 'https://example.com');
      expect(data.itemListElement[0].item).toBe('https://external.com/page');
    });
  });

  describe('Breadcrumb Collapsing', () => {
    it('should not collapse when items are within limit', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Products', item: '/products', position: 2 },
      ];
      const collapsed = collapseBreadcrumbs(items, 3);
      expect(collapsed).toHaveLength(2);
    });

    it('should collapse middle items when exceeding limit', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'A', item: '/a', position: 2 },
        { name: 'B', item: '/b', position: 3 },
        { name: 'C', item: '/c', position: 4 },
        { name: 'D', item: '/d', position: 5 },
      ];
      const collapsed = collapseBreadcrumbs(items, 3);
      expect(collapsed).toHaveLength(3);
      expect((collapsed[1] as any).name).toBe('...');
      expect((collapsed[1] as any).isCollapsed).toBe(true);
    });

    it('should keep first and last items when collapsing', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'A', item: '/a', position: 2 },
        { name: 'B', item: '/b', position: 3 },
        { name: 'Last', item: '/last', position: 4 },
      ];
      const collapsed = collapseBreadcrumbs(items, 3);
      expect(collapsed).toHaveLength(3);
      expect((collapsed[0] as any).name).toBe('Home');
      expect((collapsed[1] as any).name).toBe('...');
      expect((collapsed[2] as any).name).toBe('Last');
    });
  });

  describe('Back Navigation', () => {
    it('should provide back navigation with parent item', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Products', item: '/products', position: 2 },
        { name: 'Category', item: '/products/category', position: 3 },
      ];
      const back = getBackNavigation(items, 'en');
      expect(back.available).toBe(true);
      expect(back.url).toBe('/products');
      expect(back.label).toContain('Back');
      expect(back.label).toContain('Products');
    });

    it('should provide back navigation in Arabic', () => {
      const items = [
        { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
        { name: 'Products', nameAr: 'المنتجات', item: '/products', position: 2 },
      ];
      const back = getBackNavigation(items, 'ar');
      expect(back.available).toBe(true);
      expect(back.label).toContain('رجوع');
      expect(back.label).toContain('الرئيسية'); // Parent item (Home) for back navigation
    });

    it('should indicate unavailable back when only one item', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
      ];
      const back = getBackNavigation(items, 'en');
      expect(back.available).toBe(false);
      expect(back.url).toBe('/');
    });

    it('should provide back navigation in Hebrew', () => {
      const items = [
        { name: 'Home', nameHe: 'בית', item: '/', position: 1 },
        { name: 'Products', nameHe: 'מוצרים', item: '/products', position: 2 },
      ];
      const back = getBackNavigation(items, 'he');
      expect(back.available).toBe(true);
      expect(back.label).toContain('חזור');
      expect(back.label).toContain('בית'); // Parent item (Home) for back navigation
    });
  });

  describe('Common Breadcrumb Names', () => {
    it('should have Arabic translations for common names', () => {
      expect(COMMON_BREADCRUMB_NAMES['Home']['ar']).toBe('الرئيسية');
      expect(COMMON_BREADCRUMB_NAMES['Products']['ar']).toBe('المنتجات');
      expect(COMMON_BREADCRUMB_NAMES['Collections']['ar']).toBe('المجموعات');
    });

    it('should have Hebrew translations for common names', () => {
      expect(COMMON_BREADCRUMB_NAMES['Home']['he']).toBe('בית');
      expect(COMMON_BREADCRUMB_NAMES['Products']['he']).toBe('מוצרים');
      expect(COMMON_BREADCRUMB_NAMES['Collections']['he']).toBe('אוספים');
    });

    it('should support adding custom translations', () => {
      addBreadcrumbNameTranslation('CustomPage', { ar: 'صفحة مخصصة', he: 'דף מותאם' });
      expect(COMMON_BREADCRUMB_NAMES['CustomPage']['ar']).toBe('صفحة مخصصة');
      expect(COMMON_BREADCRUMB_NAMES['CustomPage']['he']).toBe('דף מותאם');
    });
  });

  describe('Available Separators', () => {
    it('should return all available separator styles', () => {
      const separators = getAvailableSeparators();
      expect(separators.length).toBeGreaterThan(0);
      expect(separators.some((s) => s.key === 'slash')).toBe(true);
      expect(separators.some((s) => s.key === 'arrow')).toBe(true);
    });

    it('should include symbol and name for each separator', () => {
      const separators = getAvailableSeparators();
      separators.forEach((sep) => {
        expect(sep.symbol).toBeDefined();
        expect(sep.name).toBeDefined();
      });
    });
  });

  describe('Separator Styles Constants', () => {
    it('should define slash separator', () => {
      expect(SEPARATOR_STYLES.slash).toBe('/');
    });

    it('should define arrow separators', () => {
      expect(SEPARATOR_STYLES.arrow).toBe('>');
      expect(SEPARATOR_STYLES.arrowLeft).toBe('<');
    });

    it('should define double arrow separators', () => {
      expect(SEPARATOR_STYLES.doubleArrow).toBe('»');
      expect(SEPARATOR_STYLES.doubleArrowLeft).toBe('«');
    });

    it('should define raquo separators', () => {
      expect(SEPARATOR_STYLES.raquo).toBe('»');
      expect(SEPARATOR_STYLES.laquo).toBe('«');
    });
  });

  describe('Breadcrumb Validation', () => {
    it('should validate correct breadcrumb items', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Products', item: '/products', position: 2 },
      ];
      const result = validateBreadcrumbItems(items);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing name', () => {
      const items = [
        { name: '', item: '/', position: 1 },
      ];
      const result = validateBreadcrumbItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('name'))).toBe(true);
    });

    it('should detect missing item URL', () => {
      const items = [
        { name: 'Home', item: '', position: 1 },
      ];
      const result = validateBreadcrumbItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('URL'))).toBe(true);
    });

    it('should detect invalid position', () => {
      const items = [
        { name: 'Home', item: '/', position: 0 },
      ];
      const result = validateBreadcrumbItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('position'))).toBe(true);
    });

    it('should detect non-sequential positions', () => {
      const items = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Products', item: '/products', position: 3 },
      ];
      const result = validateBreadcrumbItems(items);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('sequential'))).toBe(true);
    });

    it('should detect empty items array', () => {
      const result = validateBreadcrumbItems([]);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('non-empty');
    });

    it('should handle non-array input', () => {
      const result = validateBreadcrumbItems(null as any);
      expect(result.valid).toBe(false);
    });
  });

  describe('Label Set Constants', () => {
    it('should have all required labels in Arabic set', () => {
      expect(ARABIC_BREADCRUMB_LABELS.home).toBeDefined();
      expect(ARABIC_BREADCRUMB_LABELS.back).toBeDefined();
      expect(ARABIC_BREADCRUMB_LABELS.separator).toBeDefined();
      expect(ARABIC_BREADCRUMB_LABELS.separatorRTL).toBeDefined();
      expect(ARABIC_BREADCRUMB_LABELS.ariaLabel).toBeDefined();
      expect(ARABIC_BREADCRUMB_LABELS.ariaCurrent).toBeDefined();
    });

    it('should have all required labels in Hebrew set', () => {
      expect(HEBREW_BREADCRUMB_LABELS.home).toBeDefined();
      expect(HEBREW_BREADCRUMB_LABELS.back).toBeDefined();
      expect(HEBREW_BREADCRUMB_LABELS.separator).toBeDefined();
      expect(HEBREW_BREADCRUMB_LABELS.separatorRTL).toBeDefined();
      expect(HEBREW_BREADCRUMB_LABELS.ariaLabel).toBeDefined();
      expect(HEBREW_BREADCRUMB_LABELS.ariaCurrent).toBeDefined();
    });

    it('should have all required labels in English set', () => {
      expect(ENGLISH_BREADCRUMB_LABELS.home).toBeDefined();
      expect(ENGLISH_BREADCRUMB_LABELS.back).toBeDefined();
      expect(ENGLISH_BREADCRUMB_LABELS.separator).toBeDefined();
      expect(ENGLISH_BREADCRUMB_LABELS.separatorRTL).toBeDefined();
      expect(ENGLISH_BREADCRUMB_LABELS.ariaLabel).toBeDefined();
      expect(ENGLISH_BREADCRUMB_LABELS.ariaCurrent).toBeDefined();
    });

    it('should have RTL-appropriate separators for Arabic', () => {
      expect(ARABIC_BREADCRUMB_LABELS.separator).toBe('/');
      expect(ARABIC_BREADCRUMB_LABELS.separatorRTL).toBe('\\');
      expect(ARABIC_BREADCRUMB_LABELS.altSeparator).toBe('«');
      expect(ARABIC_BREADCRUMB_LABELS.altSeparatorRTL).toBe('»');
    });

    it('should have RTL-appropriate separators for Hebrew', () => {
      expect(HEBREW_BREADCRUMB_LABELS.separator).toBe('/');
      expect(HEBREW_BREADCRUMB_LABELS.separatorRTL).toBe('\\');
      expect(HEBREW_BREADCRUMB_LABELS.altSeparator).toBe('«');
      expect(HEBREW_BREADCRUMB_LABELS.altSeparatorRTL).toBe('»');
    });
  });
});
