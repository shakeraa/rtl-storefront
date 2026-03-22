import { describe, it, expect } from 'vitest';
import {
  KEYBOARD_SHORTCUTS, NAVIGATION_INSTRUCTIONS, FOCUS_MANAGEMENT_LABELS, KEYBOARD_HELP_SECTIONS,
  getKeyboardShortcutLabel, getKeyboardShortcut, getAllKeyboardShortcuts, getShortcutsByCategory,
  getNavigationInstructions, getNavigationInstructionById, getFocusManagementLabels, getFocusManagementLabel,
  getKeyboardHelpText, getKeyboardHelpSection, formatShortcutKeys, getKeySymbol, getRTLArrowInstructions,
  matchesShortcut, getAccessibleShortcutLabel, getSupportedLocales, normalizeLocale, isRTL,
  type KeyboardShortcut, type ShortcutCategory,
} from '../../app/services/translation-features/keyboard-navigation';

describe('Keyboard Navigation Service - T0347', () => {
  describe('Keyboard Shortcuts Data', () => {
    it('should have shortcuts defined for ar locale', () => {
      expect(KEYBOARD_SHORTCUTS.ar).toBeDefined();
      expect(KEYBOARD_SHORTCUTS.ar['nav-next']).toBeDefined();
      expect(KEYBOARD_SHORTCUTS.ar['action-select']).toBeDefined();
    });
    it('should have shortcuts defined for he locale', () => {
      expect(KEYBOARD_SHORTCUTS.he).toBeDefined();
      expect(KEYBOARD_SHORTCUTS.he['nav-next']).toBeDefined();
      expect(KEYBOARD_SHORTCUTS.he['edit-undo']).toBeDefined();
    });
    it('should have shortcuts defined for en locale', () => {
      expect(KEYBOARD_SHORTCUTS.en).toBeDefined();
      expect(KEYBOARD_SHORTCUTS.en['nav-next']).toBeDefined();
      expect(KEYBOARD_SHORTCUTS.en['help-shortcuts']).toBeDefined();
    });
    it('should have Arabic shortcut actions in Arabic language', () => {
      expect(KEYBOARD_SHORTCUTS.ar['nav-next'].action).toBe('الانتقال للعنصر التالي');
    });
    it('should have Hebrew shortcut actions in Hebrew language', () => {
      expect(KEYBOARD_SHORTCUTS.he['nav-next'].action).toBe('מעבר לפריט הבא');
    });
    it('should have consistent shortcut IDs across all locales', () => {
      expect(Object.keys(KEYBOARD_SHORTCUTS.ar).sort()).toEqual(Object.keys(KEYBOARD_SHORTCUTS.he).sort());
      expect(Object.keys(KEYBOARD_SHORTCUTS.he).sort()).toEqual(Object.keys(KEYBOARD_SHORTCUTS.en).sort());
    });
    it('should include RTL-specific arrow key descriptions', () => {
      expect(KEYBOARD_SHORTCUTS.ar['nav-left'].description).toContain('RTL');
      expect(KEYBOARD_SHORTCUTS.he['nav-left'].description).toContain('RTL');
      expect(KEYBOARD_SHORTCUTS.en['nav-left'].description).toContain('RTL');
    });
  });

  describe('getKeyboardShortcutLabel', () => {
    it('should return formatted label for shortcut by ID', () => {
      const label = getKeyboardShortcutLabel('nav-next', 'en');
      expect(label).toContain('Tab');
      expect(label).toContain('Next Item');
    });
    it('should return formatted label for Arabic locale', () => {
      const label = getKeyboardShortcutLabel('nav-next', 'ar');
      expect(label).toContain('Tab');
      expect(label).toContain('الانتقال للعنصر التالي');
    });
    it('should return formatted label for Hebrew locale', () => {
      const label = getKeyboardShortcutLabel('nav-next', 'he');
      expect(label).toContain('Tab');
      expect(label).toContain('מעבר לפריט הבא');
    });
    it('should handle shortcut object as input', () => {
      const shortcut: KeyboardShortcut = { id: 'test', keys: ['Ctrl', 'S'], action: 'Save', category: 'action' };
      expect(getKeyboardShortcutLabel(shortcut, 'en')).toBe('Ctrl + S: Save');
    });
    it('should return original string if shortcut ID not found', () => {
      expect(getKeyboardShortcutLabel('non-existent', 'en')).toBe('non-existent');
    });
  });

  describe('getKeyboardShortcut', () => {
    it('should return full shortcut object by ID', () => {
      const shortcut = getKeyboardShortcut('nav-next', 'en');
      expect(shortcut).not.toBeNull();
      expect(shortcut?.id).toBe('nav-next');
      expect(shortcut?.keys).toContain('Tab');
    });
    it('should return null for non-existent shortcut', () => {
      expect(getKeyboardShortcut('does-not-exist', 'en')).toBeNull();
    });
    it('should return Arabic shortcut for ar locale', () => {
      expect(getKeyboardShortcut('action-select', 'ar')?.action).toBe('تحديد');
    });
    it('should handle locale case insensitively', () => {
      expect(getKeyboardShortcut('nav-next', 'EN')).not.toBeNull();
    });
  });

  describe('getAllKeyboardShortcuts', () => {
    it('should return all shortcuts for English locale', () => {
      const shortcuts = getAllKeyboardShortcuts('en');
      expect(shortcuts.length).toBeGreaterThan(10);
      expect(shortcuts.some(s => s.id === 'nav-next')).toBe(true);
      expect(shortcuts.some(s => s.id === 'edit-copy')).toBe(true);
    });
    it('should return all shortcuts for Arabic locale', () => {
      expect(getAllKeyboardShortcuts('ar').length).toBeGreaterThan(10);
    });
    it('should return shortcuts with proper categories', () => {
      const categories = new Set(getAllKeyboardShortcuts('en').map(s => s.category));
      expect(categories.has('navigation')).toBe(true);
      expect(categories.has('action')).toBe(true);
      expect(categories.has('editing')).toBe(true);
    });
  });

  describe('getShortcutsByCategory', () => {
    it('should return only navigation shortcuts', () => {
      const shortcuts = getShortcutsByCategory('navigation', 'en');
      expect(shortcuts.every(s => s.category === 'navigation')).toBe(true);
      expect(shortcuts.length).toBeGreaterThan(5);
    });
    it('should return only editing shortcuts', () => {
      const shortcuts = getShortcutsByCategory('editing', 'en');
      expect(shortcuts.every(s => s.category === 'editing')).toBe(true);
      expect(shortcuts.length).toBeGreaterThanOrEqual(4);
    });
    it('should return empty array for unknown category', () => {
      expect(getShortcutsByCategory('unknown' as ShortcutCategory, 'en')).toEqual([]);
    });
    it('should work for Arabic locale', () => {
      const shortcuts = getShortcutsByCategory('action', 'ar');
      expect(shortcuts.every(s => s.category === 'action')).toBe(true);
      expect(shortcuts[0].action).toContain('تحديد');
    });
  });

  describe('getNavigationInstructions', () => {
    it('should return all instructions for English locale', () => {
      expect(getNavigationInstructions('en').length).toBeGreaterThanOrEqual(5);
    });
    it('should return sorted instructions by order', () => {
      const instructions = getNavigationInstructions('en');
      for (let i = 1; i < instructions.length; i++) {
        expect(instructions[i].order).toBeGreaterThanOrEqual(instructions[i - 1].order);
      }
    });
    it('should filter instructions by context', () => {
      expect(getNavigationInstructions('en', 'basic').every(i => i.context === 'basic')).toBe(true);
    });
    it('should return RTL-specific instructions', () => {
      const instructions = getNavigationInstructions('en', 'rtl');
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions[0].instruction).toContain('RTL');
    });
    it('should return Arabic instructions for ar locale', () => {
      expect(getNavigationInstructions('ar')[0].instruction).toContain('يمكنك');
    });
    it('should return Hebrew instructions for he locale', () => {
      expect(getNavigationInstructions('he')[0].instruction).toContain('ניתן');
    });
  });

  describe('getNavigationInstructionById', () => {
    it('should return specific instruction by ID', () => {
      const instruction = getNavigationInstructionById('tab-nav', 'en');
      expect(instruction).not.toBeNull();
      expect(instruction?.id).toBe('tab-nav');
    });
    it('should return null for non-existent instruction ID', () => {
      expect(getNavigationInstructionById('does-not-exist', 'en')).toBeNull();
    });
    it('should work across different locales', () => {
      expect(getNavigationInstructionById('intro', 'en')?.instruction).not.toBe(getNavigationInstructionById('intro', 'ar')?.instruction);
    });
  });

  describe('getFocusManagementLabels', () => {
    it('should return all focus labels for English locale', () => {
      const labels = getFocusManagementLabels('en');
      expect(Object.keys(labels).length).toBeGreaterThan(5);
      expect(labels['skip-link']).toBeDefined();
      expect(labels['focus-indicator']).toBeDefined();
    });
    it('should return Arabic labels for ar locale', () => {
      expect(getFocusManagementLabels('ar')['skip-link'].label).toContain('المحتوى');
    });
    it('should return Hebrew labels for he locale', () => {
      expect(getFocusManagementLabels('he')['skip-link'].label).toContain('תוכן');
    });
    it('should include aria labels for accessibility', () => {
      expect(getFocusManagementLabels('en')['skip-link'].ariaLabel).toBeDefined();
    });
    it('should include role attributes', () => {
      expect(getFocusManagementLabels('en')['skip-link'].role).toBeDefined();
    });
  });

  describe('getFocusManagementLabel', () => {
    it('should return specific label by ID', () => {
      const label = getFocusManagementLabel('skip-link', 'en');
      expect(label).not.toBeNull();
      expect(label?.id).toBe('skip-link');
    });
    it('should return null for non-existent label', () => {
      expect(getFocusManagementLabel('does-not-exist', 'en')).toBeNull();
    });
    it('should return localized label', () => {
      expect(getFocusManagementLabel('skip-link', 'en')?.label).toBe('Skip to Main Content');
      expect(getFocusManagementLabel('skip-link', 'ar')?.label).not.toBe('Skip to Main Content');
    });
  });

  describe('getKeyboardHelpText', () => {
    it('should return help sections for English locale', () => {
      expect(getKeyboardHelpText('en').length).toBeGreaterThanOrEqual(4);
      expect(getKeyboardHelpText('en').some(s => s.id === 'basics')).toBe(true);
    });
    it('should return help sections for Arabic locale', () => {
      expect(getKeyboardHelpText('ar')[0].title).toContain('أساسيات');
    });
    it('should return help sections for Hebrew locale', () => {
      expect(getKeyboardHelpText('he')[0].title).toContain('יסודות');
    });
    it('should include shortcuts in each section', () => {
      getKeyboardHelpText('en').forEach(section => expect(section.shortcuts.length).toBeGreaterThan(0));
    });
    it('should include section titles and descriptions', () => {
      getKeyboardHelpText('en').forEach(section => {
        expect(section.title).toBeDefined();
        expect(section.description).toBeDefined();
      });
    });
  });

  describe('getKeyboardHelpSection', () => {
    it('should return specific help section by ID', () => {
      const section = getKeyboardHelpSection('basics', 'en');
      expect(section).not.toBeNull();
      expect(section?.id).toBe('basics');
    });
    it('should return null for non-existent section', () => {
      expect(getKeyboardHelpSection('does-not-exist', 'en')).toBeNull();
    });
    it('should return localized section titles', () => {
      expect(getKeyboardHelpSection('basics', 'en')?.title).toBe('Navigation Basics');
      expect(getKeyboardHelpSection('basics', 'ar')?.title).not.toBe('Navigation Basics');
    });
  });

  describe('formatShortcutKeys', () => {
    it('should format keys with plus separator for LTR', () => {
      expect(formatShortcutKeys(['Ctrl', 'C'], 'en')).toBe('Ctrl + C');
    });
    it('should reverse key order for RTL locales', () => {
      expect(formatShortcutKeys(['Ctrl', 'Shift', 'A'], 'en')).not.toBe(formatShortcutKeys(['Ctrl', 'Shift', 'A'], 'ar'));
    });
    it('should work for Hebrew locale', () => {
      expect(formatShortcutKeys(['Ctrl', 'V'], 'he')).toContain('+');
    });
  });

  describe('getKeySymbol', () => {
    it('should return symbol for common keys', () => {
      expect(getKeySymbol('Enter')).toBe('↵');
      expect(getKeySymbol('Tab')).toBe('⇥');
      expect(getKeySymbol('Shift')).toBe('⇧/Shift');
    });
    it('should return original key if no symbol defined', () => {
      expect(getKeySymbol('CustomKey')).toBe('CustomKey');
    });
    it('should return command symbol for Ctrl', () => {
      expect(getKeySymbol('Ctrl')).toBe('⌘/Ctrl');
    });
  });

  describe('getRTLArrowInstructions', () => {
    it('should return English RTL instructions', () => {
      const instructions = getRTLArrowInstructions('en');
      expect(instructions).toContain('RTL');
      expect(instructions).toContain('Right arrow');
      expect(instructions).toContain('Left arrow');
    });
    it('should return Arabic RTL instructions', () => {
      expect(getRTLArrowInstructions('ar')).toContain('من اليمين لليسار');
    });
    it('should return Hebrew RTL instructions', () => {
      expect(getRTLArrowInstructions('he')).toContain('RTL');
    });
    it('should default to English for unknown locale', () => {
      expect(getRTLArrowInstructions('xx')).toContain('RTL');
    });
  });

  describe('matchesShortcut', () => {
    it('should match simple key press', () => {
      const event = { key: 'Tab', ctrlKey: false, shiftKey: false, altKey: false } as KeyboardEvent;
      expect(matchesShortcut(event, 'nav-next', 'en')).toBe(true);
    });
    it('should match key with modifiers', () => {
      const event = { key: 'z', ctrlKey: true, shiftKey: false, altKey: false } as KeyboardEvent;
      expect(matchesShortcut(event, 'edit-undo', 'en')).toBe(true);
    });
    it('should not match when modifiers differ', () => {
      const event = { key: 'z', ctrlKey: false, shiftKey: false, altKey: false } as KeyboardEvent;
      expect(matchesShortcut(event, 'edit-undo', 'en')).toBe(false);
    });
    it('should return false for non-existent shortcut', () => {
      const event = { key: 'Tab', ctrlKey: false, shiftKey: false, altKey: false } as KeyboardEvent;
      expect(matchesShortcut(event, 'does-not-exist', 'en')).toBe(false);
    });
    it('should handle uppercase keys', () => {
      const event = { key: 'Enter', ctrlKey: false, shiftKey: false, altKey: false } as KeyboardEvent;
      expect(matchesShortcut(event, 'action-select', 'en')).toBe(true);
    });
  });

  describe('getAccessibleShortcutLabel', () => {
    it('should return accessible label for screen readers', () => {
      const label = getAccessibleShortcutLabel('nav-next', 'en');
      expect(label).toContain('⇥');
      expect(label).toContain('next');
    });
    it('should include description in accessible label', () => {
      expect(getAccessibleShortcutLabel('nav-next', 'en')).toContain('Move');
    });
    it('should return empty string for non-existent shortcut', () => {
      expect(getAccessibleShortcutLabel('does-not-exist', 'en')).toBe('');
    });
  });

  describe('normalizeLocale', () => {
    it('should normalize locale to base code', () => {
      expect(normalizeLocale('en-US')).toBe('en');
      expect(normalizeLocale('ar-SA')).toBe('ar');
      expect(normalizeLocale('he-IL')).toBe('he');
    });
    it('should handle lowercase locales', () => {
      expect(normalizeLocale('en-us')).toBe('en');
    });
    it('should return en for unknown locale', () => {
      expect(normalizeLocale('xx')).toBe('en');
    });
  });

  describe('isRTL', () => {
    it('should return true for Arabic locale', () => {
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('ar-SA')).toBe(true);
    });
    it('should return true for Hebrew locale', () => {
      expect(isRTL('he')).toBe(true);
      expect(isRTL('he-IL')).toBe(true);
    });
    it('should return false for English locale', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('en-US')).toBe(false);
    });
    it('should return false for unknown locale', () => {
      expect(isRTL('xx')).toBe(false);
    });
  });

  describe('getSupportedLocales', () => {
    it('should return supported locales array', () => {
      const locales = getSupportedLocales();
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
      expect(locales.length).toBe(3);
    });
  });

  describe('Navigation Instructions Data', () => {
    it('should have consistent instruction IDs across locales', () => {
      expect(NAVIGATION_INSTRUCTIONS.ar.map(i => i.id).sort()).toEqual(NAVIGATION_INSTRUCTIONS.he.map(i => i.id).sort());
      expect(NAVIGATION_INSTRUCTIONS.he.map(i => i.id).sort()).toEqual(NAVIGATION_INSTRUCTIONS.en.map(i => i.id).sort());
    });
    it('should have RTL-specific instruction', () => {
      expect(NAVIGATION_INSTRUCTIONS.ar.find(i => i.id === 'rtl-note')?.context).toBe('rtl');
    });
  });

  describe('Focus Management Labels Data', () => {
    it('should have skip-link label in all locales', () => {
      expect(FOCUS_MANAGEMENT_LABELS.ar['skip-link']).toBeDefined();
      expect(FOCUS_MANAGEMENT_LABELS.he['skip-link']).toBeDefined();
      expect(FOCUS_MANAGEMENT_LABELS.en['skip-link']).toBeDefined();
    });
    it('should have proper ARIA labels', () => {
      Object.values(FOCUS_MANAGEMENT_LABELS.en).forEach(label => {
        expect(label.ariaLabel).toBeDefined();
        expect(label.ariaLabel?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Keyboard Help Sections Data', () => {
    it('should have consistent section IDs across locales', () => {
      expect(KEYBOARD_HELP_SECTIONS.ar.map(s => s.id).sort()).toEqual(KEYBOARD_HELP_SECTIONS.he.map(s => s.id).sort());
      expect(KEYBOARD_HELP_SECTIONS.he.map(s => s.id).sort()).toEqual(KEYBOARD_HELP_SECTIONS.en.map(s => s.id).sort());
    });
    it('should have all required sections', () => {
      const requiredSections = ['basics', 'navigation', 'editing', 'accessibility', 'view'];
      requiredSections.forEach(sectionId => {
        expect(KEYBOARD_HELP_SECTIONS.en.some(s => s.id === sectionId)).toBe(true);
      });
    });
  });
});
