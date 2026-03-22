import { describe, it, expect } from 'vitest';
import {
  getInlineSwitcherConfig,
  getDisplayOptions,
  getDropdownLabels,
  formatLanguageOption,
  toggleDropdown,
  closeDropdown,
  openDropdown,
  getOptimalDropdownPosition,
  getTriggerDisplay,
  sortLanguageOptions,
  filterLanguageOptions,
  getKeyboardNavigation,
  shouldUseCompactMode,
  getThemeVariables,
  type InlineSwitcherConfig,
  type LanguageOption,
  type DisplayStyle,
} from '../../app/services/language-switcher/inline';

describe('Inline Language Switcher', () => {
  describe('getInlineSwitcherConfig', () => {
    it('returns default config with isOpen set to false', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.isOpen).toBe(false);
    });

    it('returns header placement by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.placement).toBe('header');
    });

    it('returns bottom-left position for LTR locales', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.position).toBe('bottom-left');
    });

    it('returns bottom-right position for RTL locales', () => {
      const config = getInlineSwitcherConfig('ar');
      expect(config.position).toBe('bottom-right');
    });

    it('returns flag-text display style by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.displayStyle).toBe('flag-text');
    });

    it('has showFlags enabled by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.showFlags).toBe(true);
    });

    it('has showNativeNames enabled by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.showNativeNames).toBe(true);
    });

    it('has compact mode disabled by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.compact).toBe(false);
    });

    it('returns correct maxDropdownHeight of 300px', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.maxDropdownHeight).toBe(300);
    });

    it('has keyboard navigation enabled by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.keyboardNavigation).toBe(true);
    });

    it('has autoClose enabled by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.autoClose).toBe(true);
    });

    it('has closeOnOutsideClick enabled by default', () => {
      const config = getInlineSwitcherConfig('en');
      expect(config.closeOnOutsideClick).toBe(true);
    });
  });

  describe('getDisplayOptions', () => {
    it('returns container class with placement modifier', () => {
      const options = getDisplayOptions({ placement: 'footer' }, 'en');
      expect(options.containerClass).toContain('language-switcher--footer');
    });

    it('returns container class with compact modifier when compact is true', () => {
      const options = getDisplayOptions({ compact: true }, 'en');
      expect(options.containerClass).toContain('language-switcher--compact');
    });

    it('returns RTL class for RTL locales', () => {
      const options = getDisplayOptions({}, 'ar');
      expect(options.containerClass).toContain('language-switcher--rtl');
    });

    it('returns LTR class for LTR locales', () => {
      const options = getDisplayOptions({}, 'en');
      expect(options.containerClass).toContain('language-switcher--ltr');
    });

    it('returns trigger class with open modifier when isOpen is true', () => {
      const options = getDisplayOptions({ isOpen: true }, 'en');
      expect(options.triggerClass).toContain('language-switcher__trigger--open');
    });

    it('returns dropdown class with position modifier', () => {
      const options = getDisplayOptions({ position: 'top-right' }, 'en');
      expect(options.dropdownClass).toContain('language-switcher__dropdown--top-right');
    });

    it('returns dropdown class with visible modifier when isOpen is true', () => {
      const options = getDisplayOptions({ isOpen: true }, 'en');
      expect(options.dropdownClass).toContain('language-switcher__dropdown--visible');
    });

    it('returns correct dropdown styles for bottom-left position', () => {
      const options = getDisplayOptions({ position: 'bottom-left', maxDropdownHeight: 250 }, 'en');
      expect(options.dropdownStyles.top).toBe('100%');
      expect(options.dropdownStyles.left).toBe('0');
      expect(options.dropdownStyles['max-height']).toBe('250px');
    });

    it('returns correct dropdown styles for top-right position', () => {
      const options = getDisplayOptions({ position: 'top-right', maxDropdownHeight: 200 }, 'en');
      expect(options.dropdownStyles.bottom).toBe('100%');
      expect(options.dropdownStyles.right).toBe('0');
    });

    it('returns isRtl true for RTL locales', () => {
      const options = getDisplayOptions({}, 'he');
      expect(options.isRtl).toBe(true);
    });

    it('returns isRtl false for LTR locales', () => {
      const options = getDisplayOptions({}, 'fr');
      expect(options.isRtl).toBe(false);
    });

    it('includes aria-haspopup attribute in trigger aria attributes', () => {
      const options = getDisplayOptions({}, 'en');
      expect(options.ariaAttributes.trigger['aria-haspopup']).toBe('listbox');
    });

    it('includes correct aria-expanded attribute based on isOpen state', () => {
      const openOptions = getDisplayOptions({ isOpen: true }, 'en');
      const closedOptions = getDisplayOptions({ isOpen: false }, 'en');
      expect(openOptions.ariaAttributes.trigger['aria-expanded']).toBe('true');
      expect(closedOptions.ariaAttributes.trigger['aria-expanded']).toBe('false');
    });

    it('includes listbox role in dropdown aria attributes', () => {
      const options = getDisplayOptions({}, 'en');
      expect(options.ariaAttributes.dropdown.role).toBe('listbox');
    });

    it('includes option role in items aria attributes', () => {
      const options = getDisplayOptions({}, 'en');
      expect(options.ariaAttributes.items.role).toBe('option');
    });
  });

  describe('getDropdownLabels', () => {
    it('returns English labels for en locale', () => {
      const labels = getDropdownLabels('en');
      expect(labels.triggerLabel).toBe('Select language');
      expect(labels.dropdownAriaLabel).toBe('Available languages');
      expect(labels.currentLanguageLabel).toBe('Current language');
    });

    it('returns Arabic labels for ar locale', () => {
      const labels = getDropdownLabels('ar');
      expect(labels.triggerLabel).toBe('اختيار اللغة');
      expect(labels.dropdownAriaLabel).toBe('اللغات المتاحة');
      expect(labels.currentLanguageLabel).toBe('اللغة الحالية');
    });

    it('returns Hebrew labels for he locale', () => {
      const labels = getDropdownLabels('he');
      expect(labels.triggerLabel).toBe('בחירת שפה');
      expect(labels.dropdownAriaLabel).toBe('שפות זמינות');
    });

    it('returns Persian labels for fa locale', () => {
      const labels = getDropdownLabels('fa');
      expect(labels.triggerLabel).toBe('انتخاب زبان');
      expect(labels.dropdownAriaLabel).toBe('زبان‌های موجود');
    });

    it('returns French labels for fr locale', () => {
      const labels = getDropdownLabels('fr');
      expect(labels.triggerLabel).toBe('Choisir la langue');
      expect(labels.dropdownAriaLabel).toBe('Langues disponibles');
    });

    it('returns German labels for de locale', () => {
      const labels = getDropdownLabels('de');
      expect(labels.triggerLabel).toBe('Sprache wählen');
    });

    it('returns Spanish labels for es locale', () => {
      const labels = getDropdownLabels('es');
      expect(labels.triggerLabel).toBe('Seleccionar idioma');
    });

    it('returns default labels for unknown locale', () => {
      const labels = getDropdownLabels('xx');
      expect(labels.triggerLabel).toBe('Select language');
      expect(labels.dropdownAriaLabel).toBe('Available languages');
    });

    it('includes closeLabel in all label sets', () => {
      const enLabels = getDropdownLabels('en');
      const arLabels = getDropdownLabels('ar');
      expect(enLabels.closeLabel).toBeTruthy();
      expect(arLabels.closeLabel).toBeTruthy();
    });

    it('includes toggleLabel in all label sets', () => {
      const enLabels = getDropdownLabels('en');
      const arLabels = getDropdownLabels('ar');
      expect(enLabels.toggleLabel).toBeTruthy();
      expect(arLabels.toggleLabel).toBeTruthy();
    });
  });

  describe('formatLanguageOption', () => {
    const mockLanguage: LanguageOption = {
      locale: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      flag: '🇸🇦',
      isActive: true,
    };

    it('returns correct locale in formatted option', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.locale).toBe('ar');
    });

    it('returns nativeName as label', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.label).toBe('العربية');
    });

    it('returns correct flag', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.flag).toBe('🇸🇦');
    });

    it('returns isActive status', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.isActive).toBe(true);
    });

    it('returns correct direction', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.direction).toBe('rtl');
    });

    it('includes locale in className', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.className).toContain('language-option--ar');
    });

    it('includes active modifier in className when isActive is true', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.className).toContain('language-option--active');
    });

    it('includes direction in className', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.className).toContain('language-option--rtl');
    });

    it('returns data-locale data attribute', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.dataAttributes['data-locale']).toBe('ar');
    });

    it('returns data-direction data attribute', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.dataAttributes['data-direction']).toBe('rtl');
    });

    it('returns data-active data attribute as string', () => {
      const formatted = formatLanguageOption(mockLanguage, 'en');
      expect(formatted.dataAttributes['data-active']).toBe('true');
    });

    it('handles inactive language correctly', () => {
      const inactiveLang = { ...mockLanguage, isActive: false };
      const formatted = formatLanguageOption(inactiveLang, 'en');
      expect(formatted.isActive).toBe(false);
      expect(formatted.dataAttributes['data-active']).toBe('false');
      expect(formatted.className).not.toContain('language-option--active');
    });

    it('handles empty flag gracefully', () => {
      const noFlagLang = { ...mockLanguage, flag: undefined };
      const formatted = formatLanguageOption(noFlagLang, 'en');
      expect(formatted.flag).toBe('');
    });
  });

  describe('toggleDropdown', () => {
    it('toggles closed dropdown to open', () => {
      const config: InlineSwitcherConfig = { ...getInlineSwitcherConfig('en'), isOpen: false };
      const toggled = toggleDropdown(config);
      expect(toggled.isOpen).toBe(true);
    });

    it('toggles open dropdown to closed', () => {
      const config: InlineSwitcherConfig = { ...getInlineSwitcherConfig('en'), isOpen: true };
      const toggled = toggleDropdown(config);
      expect(toggled.isOpen).toBe(false);
    });

    it('preserves other config properties when toggling', () => {
      const config: InlineSwitcherConfig = { 
        ...getInlineSwitcherConfig('en'), 
        isOpen: false,
        placement: 'footer',
        compact: true 
      };
      const toggled = toggleDropdown(config);
      expect(toggled.placement).toBe('footer');
      expect(toggled.compact).toBe(true);
    });
  });

  describe('closeDropdown', () => {
    it('sets isOpen to false', () => {
      const config: InlineSwitcherConfig = { ...getInlineSwitcherConfig('en'), isOpen: true };
      const closed = closeDropdown(config);
      expect(closed.isOpen).toBe(false);
    });

    it('keeps isOpen false when already closed', () => {
      const config: InlineSwitcherConfig = { ...getInlineSwitcherConfig('en'), isOpen: false };
      const closed = closeDropdown(config);
      expect(closed.isOpen).toBe(false);
    });
  });

  describe('openDropdown', () => {
    it('sets isOpen to true', () => {
      const config: InlineSwitcherConfig = { ...getInlineSwitcherConfig('en'), isOpen: false };
      const opened = openDropdown(config);
      expect(opened.isOpen).toBe(true);
    });

    it('keeps isOpen true when already open', () => {
      const config: InlineSwitcherConfig = { ...getInlineSwitcherConfig('en'), isOpen: true };
      const opened = openDropdown(config);
      expect(opened.isOpen).toBe(true);
    });
  });

  describe('getOptimalDropdownPosition', () => {
    it('returns bottom-left for header placement with LTR', () => {
      const position = getOptimalDropdownPosition('header', false);
      expect(position).toBe('bottom-left');
    });

    it('returns bottom-right for header placement with RTL', () => {
      const position = getOptimalDropdownPosition('header', true);
      expect(position).toBe('bottom-right');
    });

    it('returns top-left for footer placement with LTR', () => {
      const position = getOptimalDropdownPosition('footer', false);
      expect(position).toBe('top-left');
    });

    it('returns top-right for footer placement with RTL', () => {
      const position = getOptimalDropdownPosition('footer', true);
      expect(position).toBe('top-right');
    });

    it('flips to right when LTR trigger is near right edge', () => {
      const triggerRect = { x: 900, y: 100, width: 100, height: 40 };
      const position = getOptimalDropdownPosition('header', false, 1024, triggerRect);
      expect(position).toBe('bottom-right');
    });

    it('flips to left when RTL trigger is near left edge', () => {
      const triggerRect = { x: 10, y: 100, width: 100, height: 40 };
      const position = getOptimalDropdownPosition('header', true, 1024, triggerRect);
      expect(position).toBe('bottom-left');
    });

    it('maintains LTR position when sufficient space on right', () => {
      const triggerRect = { x: 100, y: 100, width: 100, height: 40 };
      const position = getOptimalDropdownPosition('header', false, 1024, triggerRect);
      expect(position).toBe('bottom-left');
    });

    it('maintains RTL position when sufficient space on left', () => {
      const triggerRect = { x: 500, y: 100, width: 100, height: 40 };
      const position = getOptimalDropdownPosition('header', true, 1024, triggerRect);
      expect(position).toBe('bottom-right');
    });
  });

  describe('getTriggerDisplay', () => {
    const mockLanguage: LanguageOption = {
      locale: 'ar',
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      flag: '🇸🇦',
      isActive: true,
    };

    it('returns flag only for flag-only style', () => {
      const display = getTriggerDisplay(mockLanguage, 'flag-only');
      expect(display.content).toBe('🇸🇦');
      expect(display.title).toBe('العربية');
    });

    it('returns text only for text-only style', () => {
      const display = getTriggerDisplay(mockLanguage, 'text-only');
      expect(display.content).toBe('العربية');
      expect(display.title).toBe('العربية');
    });

    it('returns flag then text for flag-text style', () => {
      const display = getTriggerDisplay(mockLanguage, 'flag-text');
      expect(display.content).toBe('🇸🇦 العربية');
    });

    it('returns text then flag for text-flag style', () => {
      const display = getTriggerDisplay(mockLanguage, 'text-flag');
      expect(display.content).toBe('العربية 🇸🇦');
    });

    it('returns English name when showNativeName is false', () => {
      const display = getTriggerDisplay(mockLanguage, 'text-only', false);
      expect(display.content).toBe('Arabic');
    });

    it('handles missing flag gracefully', () => {
      const noFlagLang = { ...mockLanguage, flag: undefined };
      const display = getTriggerDisplay(noFlagLang, 'flag-text');
      expect(display.content).toBe(' العربية');
    });
  });

  describe('sortLanguageOptions', () => {
    const options: LanguageOption[] = [
      { locale: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', isActive: false },
      { locale: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isActive: true },
      { locale: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isActive: false },
    ];

    it('places active language first', () => {
      const sorted = sortLanguageOptions(options);
      expect(sorted[0].locale).toBe('ar');
      expect(sorted[0].isActive).toBe(true);
    });

    it('sorts inactive languages alphabetically by name', () => {
      const sorted = sortLanguageOptions(options);
      expect(sorted[1].locale).toBe('en');
      expect(sorted[2].locale).toBe('fr');
    });

    it('does not modify original array', () => {
      const original = [...options];
      sortLanguageOptions(options);
      expect(options).toEqual(original);
    });

    it('handles all inactive languages', () => {
      const allInactive = options.map(o => ({ ...o, isActive: false }));
      const sorted = sortLanguageOptions(allInactive);
      expect(sorted[0].locale).toBe('ar');
      expect(sorted[1].locale).toBe('en');
      expect(sorted[2].locale).toBe('fr');
    });
  });

  describe('filterLanguageOptions', () => {
    const options: LanguageOption[] = [
      { locale: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', isActive: false },
      { locale: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isActive: false },
      { locale: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isActive: false },
    ];

    it('filters by English name', () => {
      const filtered = filterLanguageOptions(options, 'french');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].locale).toBe('fr');
    });

    it('filters by native name', () => {
      const filtered = filterLanguageOptions(options, 'العربية');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].locale).toBe('ar');
    });

    it('filters by locale code', () => {
      const filtered = filterLanguageOptions(options, 'ar');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].locale).toBe('ar');
    });

    it('returns all options when query is empty', () => {
      const filtered = filterLanguageOptions(options, '');
      expect(filtered).toHaveLength(3);
    });

    it('returns empty array when no matches', () => {
      const filtered = filterLanguageOptions(options, 'german');
      expect(filtered).toHaveLength(0);
    });

    it('is case insensitive', () => {
      const filtered = filterLanguageOptions(options, 'FRENCH');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].locale).toBe('fr');
    });

    it('trims whitespace from query', () => {
      const filtered = filterLanguageOptions(options, '  french  ');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].locale).toBe('fr');
    });

    it('returns partial matches', () => {
      const filtered = filterLanguageOptions(options, 'engl');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].locale).toBe('en');
    });
  });

  describe('getKeyboardNavigation', () => {
    const options: LanguageOption[] = [
      { locale: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isActive: false },
      { locale: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isActive: false },
      { locale: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', isActive: false },
    ];

    it('returns next index correctly', () => {
      const nav = getKeyboardNavigation(options, 0);
      expect(nav.nextIndex).toBe(1);
    });

    it('wraps to first index when at last', () => {
      const nav = getKeyboardNavigation(options, 2);
      expect(nav.nextIndex).toBe(0);
    });

    it('returns previous index correctly', () => {
      const nav = getKeyboardNavigation(options, 1);
      expect(nav.prevIndex).toBe(0);
    });

    it('wraps to last index when at first', () => {
      const nav = getKeyboardNavigation(options, 0);
      expect(nav.prevIndex).toBe(2);
    });

    it('returns first index as 0', () => {
      const nav = getKeyboardNavigation(options, 1);
      expect(nav.firstIndex).toBe(0);
    });

    it('returns last index correctly', () => {
      const nav = getKeyboardNavigation(options, 0);
      expect(nav.lastIndex).toBe(2);
    });

    it('handles single item array', () => {
      const singleOption = [options[0]];
      const nav = getKeyboardNavigation(singleOption, 0);
      expect(nav.nextIndex).toBe(0);
      expect(nav.prevIndex).toBe(0);
      expect(nav.firstIndex).toBe(0);
      expect(nav.lastIndex).toBe(0);
    });
  });

  describe('shouldUseCompactMode', () => {
    it('returns false when language count is below threshold', () => {
      expect(shouldUseCompactMode(3, 5)).toBe(false);
      expect(shouldUseCompactMode(5, 5)).toBe(false);
    });

    it('returns true when language count exceeds threshold', () => {
      expect(shouldUseCompactMode(6, 5)).toBe(true);
      expect(shouldUseCompactMode(10, 5)).toBe(true);
    });

    it('uses default threshold of 5 when not specified', () => {
      expect(shouldUseCompactMode(5)).toBe(false);
      expect(shouldUseCompactMode(6)).toBe(true);
    });
  });

  describe('getThemeVariables', () => {
    it('returns light theme by default', () => {
      const vars = getThemeVariables();
      expect(vars['--switcher-bg']).toBe('#ffffff');
      expect(vars['--switcher-text']).toBe('#333333');
    });

    it('returns dark theme when isDark is true', () => {
      const vars = getThemeVariables(true);
      expect(vars['--switcher-bg']).toBe('#1a1a1a');
      expect(vars['--switcher-text']).toBe('#ffffff');
    });

    it('includes light theme border color', () => {
      const vars = getThemeVariables(false);
      expect(vars['--switcher-border']).toBe('#e0e0e0');
    });

    it('includes dark theme border color', () => {
      const vars = getThemeVariables(true);
      expect(vars['--switcher-border']).toBe('#333333');
    });

    it('includes hover background for light theme', () => {
      const vars = getThemeVariables(false);
      expect(vars['--switcher-hover-bg']).toBe('#f5f5f5');
    });

    it('includes hover background for dark theme', () => {
      const vars = getThemeVariables(true);
      expect(vars['--switcher-hover-bg']).toBe('#2a2a2a');
    });

    it('includes dropdown shadow for light theme', () => {
      const vars = getThemeVariables(false);
      expect(vars['--switcher-dropdown-shadow']).toContain('rgba(0,0,0,0.15)');
    });

    it('includes dropdown shadow for dark theme', () => {
      const vars = getThemeVariables(true);
      expect(vars['--switcher-dropdown-shadow']).toContain('rgba(0,0,0,0.5)');
    });

    it('includes primary color when specified', () => {
      const vars = getThemeVariables(false, '#ff0000');
      expect(vars['--switcher-primary']).toBe('#ff0000');
    });

    it('does not include primary color when not specified', () => {
      const vars = getThemeVariables(false);
      expect(vars['--switcher-primary']).toBeUndefined();
    });
  });

  describe('RTL locale detection', () => {
    it('detects ar as RTL', () => {
      const config = getInlineSwitcherConfig('ar');
      expect(config.position).toBe('bottom-right');
    });

    it('detects he as RTL', () => {
      const config = getInlineSwitcherConfig('he');
      expect(config.position).toBe('bottom-right');
    });

    it('detects fa as RTL', () => {
      const config = getInlineSwitcherConfig('fa');
      expect(config.position).toBe('bottom-right');
    });

    it('detects ur as RTL', () => {
      const config = getInlineSwitcherConfig('ur');
      expect(config.position).toBe('bottom-right');
    });

    it('handles locale with region subtag for RTL', () => {
      const config = getInlineSwitcherConfig('ar-SA');
      expect(config.position).toBe('bottom-right');
    });

    it('handles locale with region subtag for LTR', () => {
      const config = getInlineSwitcherConfig('en-US');
      expect(config.position).toBe('bottom-left');
    });
  });
});
