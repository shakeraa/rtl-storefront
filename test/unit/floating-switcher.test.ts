import { describe, it, expect } from 'vitest';
import {
  getFloatingSwitcherConfig,
  getPositionStyles,
  getVisibilityRules,
  getSwitcherLabels,
  getRTLPositionAdjustments,
  getResponsiveOffsets,
  shouldMinimizeOnScroll,
  getMobileOptimizedConfig,
  shouldShowOnMobile,
  getAccessibilityAttributes,
  getBestPositionForLocale,
  buildFloatingSwitcherStyles,
  type FloatingPosition,
  type FloatingVisibility,
} from '../../app/services/language-switcher/floating';

describe('Floating Switcher', () => {
  describe('getFloatingSwitcherConfig', () => {
    it('returns default config for English locale', () => {
      const config = getFloatingSwitcherConfig('en');
      expect(config.position).toBe('bottom-right');
      expect(config.visibility).toBe('always');
      expect(config.offsetX).toBe(16);
      expect(config.offsetY).toBe(16);
      expect(config.zIndex).toBe(9999);
      expect(config.compact).toBe(false);
      expect(config.showFlags).toBe(true);
      expect(config.showNativeNames).toBe(true);
    });

    it('flips position to bottom-left for Arabic RTL locale', () => {
      const config = getFloatingSwitcherConfig('ar');
      expect(config.position).toBe('bottom-left');
    });

    it('flips position to bottom-left for Hebrew RTL locale', () => {
      const config = getFloatingSwitcherConfig('he');
      expect(config.position).toBe('bottom-left');
    });

    it('flips position correctly for Persian locale', () => {
      const config = getFloatingSwitcherConfig('fa');
      expect(config.position).toBe('bottom-left');
    });

    it('keeps position for Urdu RTL locale when set to top-right', () => {
      const config = getFloatingSwitcherConfig('ur', { position: 'top-right' });
      expect(config.position).toBe('top-left');
    });

    it('applies overrides while respecting RTL for Arabic', () => {
      const config = getFloatingSwitcherConfig('ar', {
        position: 'bottom-right',
        compact: true,
        offsetX: 24,
      });
      expect(config.position).toBe('bottom-left');
      expect(config.compact).toBe(true);
      expect(config.offsetX).toBe(24);
    });

    it('applies overrides without RTL flip for English', () => {
      const config = getFloatingSwitcherConfig('en', {
        position: 'top-left',
        visibility: 'hover',
      });
      expect(config.position).toBe('top-left');
      expect(config.visibility).toBe('hover');
    });

    it('handles region-specific locales like ar-SA', () => {
      const config = getFloatingSwitcherConfig('ar-SA');
      expect(config.position).toBe('bottom-left');
    });

    it('handles region-specific locales like he-IL', () => {
      const config = getFloatingSwitcherConfig('he-IL');
      expect(config.position).toBe('bottom-left');
    });
  });

  describe('getPositionStyles', () => {
    it('returns correct desktop styles for bottom-right position', () => {
      const styles = getPositionStyles('bottom-right', 16, 16);
      expect(styles.desktop.position).toBe('fixed');
      expect(styles.desktop.bottom).toBe('16px');
      expect(styles.desktop.right).toBe('16px');
      expect(styles.desktop.left).toBe('auto');
      expect(styles.desktop.top).toBe('auto');
    });

    it('returns correct desktop styles for bottom-left position', () => {
      const styles = getPositionStyles('bottom-left', 20, 20);
      expect(styles.desktop.bottom).toBe('20px');
      expect(styles.desktop.left).toBe('20px');
      expect(styles.desktop.right).toBe('auto');
    });

    it('returns correct desktop styles for top-right position', () => {
      const styles = getPositionStyles('top-right', 16, 16);
      expect(styles.desktop.top).toBe('16px');
      expect(styles.desktop.right).toBe('16px');
      expect(styles.desktop.bottom).toBe('auto');
    });

    it('returns correct desktop styles for top-left position', () => {
      const styles = getPositionStyles('top-left', 24, 24);
      expect(styles.desktop.top).toBe('24px');
      expect(styles.desktop.left).toBe('24px');
    });

    it('returns correct desktop styles for bottom-center position with transform', () => {
      const styles = getPositionStyles('bottom-center', 16, 16);
      expect(styles.desktop.bottom).toBe('16px');
      expect(styles.desktop.left).toBe('50%');
      expect(styles.desktop.transform).toBe('translateX(-50%)');
    });

    it('returns correct desktop styles for top-center position', () => {
      const styles = getPositionStyles('top-center', 16, 16);
      expect(styles.desktop.top).toBe('16px');
      expect(styles.desktop.left).toBe('50%');
      expect(styles.desktop.transform).toBe('translateX(-50%)');
    });

    it('returns scaled mobile styles', () => {
      const styles = getPositionStyles('bottom-right', 16, 16);
      expect(styles.mobile.bottom).toBe('8px');
      expect(styles.mobile.right).toBe('8px');
    });

    it('returns desktop styles for tablet', () => {
      const styles = getPositionStyles('bottom-right', 16, 16);
      expect(styles.tablet.bottom).toBe('16px');
      expect(styles.tablet.right).toBe('16px');
    });

    it('uses default offsets when not provided', () => {
      const styles = getPositionStyles('bottom-right');
      expect(styles.desktop.bottom).toBe('16px');
      expect(styles.desktop.right).toBe('16px');
    });
  });

  describe('getVisibilityRules', () => {
    it('returns correct rules for "always" visibility', () => {
      const rules = getVisibilityRules('always');
      expect(rules.followScroll).toBe(false);
      expect(rules.minimizeOnScroll).toBe(false);
      expect(rules.expandOnHover).toBe(false);
      expect(rules.autoHide).toBe(false);
    });

    it('returns correct rules for "scroll" visibility', () => {
      const rules = getVisibilityRules('scroll');
      expect(rules.followScroll).toBe(true);
      expect(rules.minimizeOnScroll).toBe(false);
      expect(rules.expandOnHover).toBe(false);
    });

    it('returns correct rules for "hover" visibility', () => {
      const rules = getVisibilityRules('hover');
      expect(rules.followScroll).toBe(false);
      expect(rules.minimizeOnScroll).toBe(false);
      expect(rules.expandOnHover).toBe(true);
      expect(rules.autoHide).toBe(true);
      expect(rules.hideDelay).toBe(300);
      expect(rules.showDelay).toBe(100);
    });

    it('returns correct rules for "minimize-on-scroll" visibility', () => {
      const rules = getVisibilityRules('minimize-on-scroll');
      expect(rules.followScroll).toBe(true);
      expect(rules.minimizeOnScroll).toBe(true);
      expect(rules.expandOnHover).toBe(true);
      expect(rules.showDelay).toBe(200);
    });
  });

  describe('getSwitcherLabels', () => {
    it('returns English labels for en locale', () => {
      const labels = getSwitcherLabels('en');
      expect(labels.selectLanguage).toBe('Select Language');
      expect(labels.currentLanguage).toBe('Current Language');
      expect(labels.switchTo).toBe('Switch to');
      expect(labels.minimize).toBe('Minimize');
      expect(labels.expand).toBe('Expand');
      expect(labels.close).toBe('Close');
    });

    it('returns Arabic labels for ar locale', () => {
      const labels = getSwitcherLabels('ar');
      expect(labels.selectLanguage).toBe('اختيار اللغة');
      expect(labels.currentLanguage).toBe('اللغة الحالية');
      expect(labels.switchTo).toBe('التبديل إلى');
      expect(labels.minimize).toBe('تصغير');
      expect(labels.expand).toBe('توسيع');
      expect(labels.close).toBe('إغلاق');
    });

    it('returns Hebrew labels for he locale', () => {
      const labels = getSwitcherLabels('he');
      expect(labels.selectLanguage).toBe('בחירת שפה');
      expect(labels.currentLanguage).toBe('שפה נוכחית');
    });

    it('returns Persian labels for fa locale', () => {
      const labels = getSwitcherLabels('fa');
      expect(labels.selectLanguage).toBe('انتخاب زبان');
      expect(labels.close).toBe('بستن');
    });

    it('returns French labels for fr locale', () => {
      const labels = getSwitcherLabels('fr');
      expect(labels.selectLanguage).toBe('Choisir la langue');
      expect(labels.close).toBe('Fermer');
    });

    it('returns German labels for de locale', () => {
      const labels = getSwitcherLabels('de');
      expect(labels.selectLanguage).toBe('Sprache auswählen');
    });

    it('returns Spanish labels for es locale', () => {
      const labels = getSwitcherLabels('es');
      expect(labels.selectLanguage).toBe('Seleccionar idioma');
    });

    it('falls back to English for unknown locale', () => {
      const labels = getSwitcherLabels('xx');
      expect(labels.selectLanguage).toBe('Select Language');
    });

    it('handles region-specific locales like en-US', () => {
      const labels = getSwitcherLabels('en-US');
      expect(labels.selectLanguage).toBe('Select Language');
    });

    it('handles region-specific Arabic locales like ar-SA', () => {
      const labels = getSwitcherLabels('ar-SA');
      expect(labels.selectLanguage).toBe('اختيار اللغة');
    });
  });

  describe('getRTLPositionAdjustments', () => {
    it('returns all true adjustments for RTL', () => {
      const adjustments = getRTLPositionAdjustments(true);
      expect(adjustments.flipHorizontal).toBe(true);
      expect(adjustments.mirrorOffsets).toBe(true);
      expect(adjustments.adjustTextAlign).toBe(true);
    });

    it('returns all false adjustments for LTR', () => {
      const adjustments = getRTLPositionAdjustments(false);
      expect(adjustments.flipHorizontal).toBe(false);
      expect(adjustments.mirrorOffsets).toBe(false);
      expect(adjustments.adjustTextAlign).toBe(false);
    });
  });

  describe('getResponsiveOffsets', () => {
    it('returns scaled offsets for mobile viewport (< 768px)', () => {
      const offsets = getResponsiveOffsets(375, 16, 16);
      expect(offsets.offsetX).toBe(8);
      expect(offsets.offsetY).toBe(8);
    });

    it('returns minimum 8px for mobile even with small base offsets', () => {
      const offsets = getResponsiveOffsets(375, 10, 10);
      expect(offsets.offsetX).toBe(8);
      expect(offsets.offsetY).toBe(8);
    });

    it('returns 75% offsets for tablet viewport (768px - 1024px)', () => {
      const offsets = getResponsiveOffsets(900, 16, 16);
      expect(offsets.offsetX).toBe(12);
      expect(offsets.offsetY).toBe(12);
    });

    it('returns full offsets for desktop viewport (>= 1024px)', () => {
      const offsets = getResponsiveOffsets(1200, 24, 24);
      expect(offsets.offsetX).toBe(24);
      expect(offsets.offsetY).toBe(24);
    });

    it('handles exact mobile breakpoint (768px) as tablet', () => {
      const offsets = getResponsiveOffsets(768, 16, 16);
      expect(offsets.offsetX).toBe(12);
      expect(offsets.offsetY).toBe(12);
    });
  });

  describe('shouldMinimizeOnScroll', () => {
    it('returns true when scrollY exceeds threshold and not minimized', () => {
      const result = shouldMinimizeOnScroll(150, 100, false);
      expect(result).toBe(true);
    });

    it('returns false when scrollY is below threshold and not minimized', () => {
      const result = shouldMinimizeOnScroll(50, 100, false);
      expect(result).toBe(false);
    });

    it('returns false when scrollY is below half threshold and already minimized', () => {
      const result = shouldMinimizeOnScroll(40, 100, true);
      expect(result).toBe(false);
    });

    it('returns true when scrollY is above half threshold and already minimized', () => {
      const result = shouldMinimizeOnScroll(60, 100, true);
      expect(result).toBe(true);
    });

    it('returns false when at exact threshold and not minimized', () => {
      const result = shouldMinimizeOnScroll(100, 100, false);
      expect(result).toBe(false);
    });
  });

  describe('getMobileOptimizedConfig', () => {
    it('returns compact config for mobile', () => {
      const baseConfig = getFloatingSwitcherConfig('en');
      const mobileConfig = getMobileOptimizedConfig(baseConfig);
      expect(mobileConfig.compact).toBe(true);
      expect(mobileConfig.showNativeNames).toBe(false);
    });

    it('scales down offsets for mobile', () => {
      const baseConfig = getFloatingSwitcherConfig('en', { offsetX: 32, offsetY: 32 });
      const mobileConfig = getMobileOptimizedConfig(baseConfig);
      expect(mobileConfig.offsetX).toBe(16);
      expect(mobileConfig.offsetY).toBe(16);
    });

    it('enforces minimum offset of 8px', () => {
      const baseConfig = getFloatingSwitcherConfig('en', { offsetX: 10, offsetY: 10 });
      const mobileConfig = getMobileOptimizedConfig(baseConfig);
      expect(mobileConfig.offsetX).toBe(8);
      expect(mobileConfig.offsetY).toBe(8);
    });
  });

  describe('shouldShowOnMobile', () => {
    it('returns true when not mobile', () => {
      expect(shouldShowOnMobile(false, true)).toBe(true);
      expect(shouldShowOnMobile(false, false)).toBe(true);
    });

    it('returns true when mobile and mobileOptimized is true', () => {
      expect(shouldShowOnMobile(true, true)).toBe(true);
    });

    it('returns false when mobile and mobileOptimized is false', () => {
      expect(shouldShowOnMobile(true, false)).toBe(false);
    });
  });

  describe('getAccessibilityAttributes', () => {
    it('returns correct aria attributes when expanded', () => {
      const labels = getSwitcherLabels('en');
      const attrs = getAccessibilityAttributes(labels, true);
      expect(attrs.role).toBe('button');
      expect(attrs['aria-label']).toBe('Minimize');
      expect(attrs['aria-expanded']).toBe('true');
      expect(attrs.tabindex).toBe('0');
    });

    it('returns correct aria attributes when collapsed', () => {
      const labels = getSwitcherLabels('en');
      const attrs = getAccessibilityAttributes(labels, false);
      expect(attrs['aria-label']).toBe('Expand');
      expect(attrs['aria-expanded']).toBe('false');
    });

    it('returns correct aria attributes for Arabic labels', () => {
      const labels = getSwitcherLabels('ar');
      const attrs = getAccessibilityAttributes(labels, true);
      expect(attrs['aria-label']).toBe('تصغير');
    });
  });

  describe('getBestPositionForLocale', () => {
    it('returns same position for LTR locale', () => {
      expect(getBestPositionForLocale('bottom-right', 'en')).toBe('bottom-right');
      expect(getBestPositionForLocale('top-left', 'en')).toBe('top-left');
    });

    it('flips horizontal position for Arabic RTL locale', () => {
      expect(getBestPositionForLocale('bottom-right', 'ar')).toBe('bottom-left');
      expect(getBestPositionForLocale('bottom-left', 'ar')).toBe('bottom-right');
    });

    it('flips horizontal position for Hebrew RTL locale', () => {
      expect(getBestPositionForLocale('top-right', 'he')).toBe('top-left');
      expect(getBestPositionForLocale('top-left', 'he')).toBe('top-right');
    });

    it('keeps center positions unchanged for RTL', () => {
      expect(getBestPositionForLocale('bottom-center', 'ar')).toBe('bottom-center');
      expect(getBestPositionForLocale('top-center', 'he')).toBe('top-center');
    });

    it('handles Persian RTL locale', () => {
      expect(getBestPositionForLocale('bottom-right', 'fa')).toBe('bottom-left');
    });
  });

  describe('buildFloatingSwitcherStyles', () => {
    it('returns correct styles for LTR locale', () => {
      const config = getFloatingSwitcherConfig('en');
      const styles = buildFloatingSwitcherStyles(config, 'en');
      expect(styles.position).toBe('fixed');
      expect(styles.zIndex).toBe(9999);
      expect(styles.direction).toBeUndefined();
    });

    it('returns RTL styles for Arabic locale', () => {
      const config = getFloatingSwitcherConfig('ar');
      const styles = buildFloatingSwitcherStyles(config, 'ar');
      expect(styles.direction).toBe('rtl');
      expect(styles.textAlign).toBe('right');
    });

    it('returns minimized styles when minimized', () => {
      const config = getFloatingSwitcherConfig('en');
      const styles = buildFloatingSwitcherStyles(config, 'en', true);
      expect(styles.width).toBe('48px');
      expect(styles.height).toBe('48px');
      expect(styles.overflow).toBe('hidden');
    });

    it('returns non-minimized styles when not minimized', () => {
      const config = getFloatingSwitcherConfig('en');
      const styles = buildFloatingSwitcherStyles(config, 'en', false);
      expect(styles.width).toBeUndefined();
      expect(styles.height).toBeUndefined();
    });

    it('applies correct position styles for bottom-right', () => {
      const config = getFloatingSwitcherConfig('en', { position: 'bottom-right' });
      const styles = buildFloatingSwitcherStyles(config, 'en');
      expect(styles.bottom).toBe('16px');
      expect(styles.right).toBe('16px');
    });

    it('applies RTL adjustments correctly for Hebrew', () => {
      const config = getFloatingSwitcherConfig('he', { position: 'bottom-right' });
      const styles = buildFloatingSwitcherStyles(config, 'he');
      expect(styles.direction).toBe('rtl');
      expect(styles.textAlign).toBe('right');
    });
  });
});
