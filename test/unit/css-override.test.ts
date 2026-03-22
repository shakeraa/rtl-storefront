import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateCSS,
  createCSSOverride,
  getCSSOverride,
  getShopOverrides,
  getActiveOverrides,
  updateCSSOverride,
  deleteCSSOverride,
  resetToDefaults,
  formatCSS,
  minifyCSS,
  hasRTLRules,
  extractRTLRules,
  DEFAULT_RTL_CSS,
} from '../../app/services/css-override';

describe('CSS Override Service - T0055', () => {
  beforeEach(() => {
    // Clean up would happen here in real implementation
  });

  describe('CSS Validation', () => {
    it('should validate correct CSS', () => {
      const result = validateCSS('[dir="rtl"] .test { margin-right: 10px; }');
      expect(result.valid).toBe(true);
    });

    it('should warn about !important with RTL', () => {
      const result = validateCSS('[dir="rtl"] .test { margin: 0 !important; }');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate empty CSS', () => {
      const result = validateCSS('');
      expect(result.valid).toBe(true);
    });
  });

  describe('CSS Override Management', () => {
    it('should create CSS override', () => {
      const override = createCSSOverride('shop-1', 'My Override', '.test { color: red; }');
      expect(override.name).toBe('My Override');
      expect(override.css).toBe('.test { color: red; }');
      expect(override.isActive).toBe(true);
    });

    it('should get CSS override', () => {
      const created = createCSSOverride('shop-2', 'Test', '.test {}');
      const retrieved = getCSSOverride(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should get shop overrides', () => {
      const override = createCSSOverride('shop-unique', 'Test Override', '.test {}');
      const overrides = getShopOverrides('shop-unique');
      expect(overrides.length).toBeGreaterThanOrEqual(1);
      expect(overrides.some((o) => o.id === override.id)).toBe(true);
    });

    it('should get active overrides', () => {
      const override = createCSSOverride('shop-4', 'Active', '.test {}');
      const active = getActiveOverrides('shop-4', 'rtl');
      expect(active.some((o) => o.id === override.id)).toBe(true);
    });

    it('should update CSS override', () => {
      const created = createCSSOverride('shop-5', 'Original', '.test {}');
      const updated = updateCSSOverride(created.id, { name: 'Updated' });
      expect(updated?.name).toBe('Updated');
    });

    it('should delete CSS override', () => {
      const created = createCSSOverride('shop-6', 'To Delete', '.test {}');
      const deleted = deleteCSSOverride(created.id);
      expect(deleted).toBe(true);
      expect(getCSSOverride(created.id)).toBeUndefined();
    });
  });

  describe('Default RTL CSS', () => {
    it('should have default RTL CSS template', () => {
      expect(DEFAULT_RTL_CSS).toContain('[dir="rtl"]');
      expect(DEFAULT_RTL_CSS.length).toBeGreaterThan(100);
    });

    it('should reset to defaults', () => {
      const reset = resetToDefaults('shop-reset');
      expect(reset.name).toBe('Default RTL Styles');
      expect(reset.css).toContain('[dir="rtl"]');
    });
  });

  describe('CSS Processing', () => {
    it('should format CSS', () => {
      const css = '.test{color:red;}';
      const formatted = formatCSS(css);
      expect(formatted).toContain('\n');
    });

    it('should minify CSS', () => {
      const css = '/* comment */\n.test {\n  color: red;\n}';
      const minified = minifyCSS(css);
      expect(minified).not.toContain('/* comment */');
      expect(minified).not.toContain('\n');
    });

    it('should detect RTL rules', () => {
      expect(hasRTLRules('[dir="rtl"] .test {}')).toBe(true);
      expect(hasRTLRules('.test {}')).toBe(false);
    });

    it('should extract RTL rules', () => {
      const css = '[dir="rtl"] .test1 {}\n.ltr {}\n[dir="rtl"] .test2 {}';
      const extracted = extractRTLRules(css);
      expect(extracted).toContain('[dir="rtl"] .test1');
      expect(extracted).toContain('[dir="rtl"] .test2');
    });
  });
});
