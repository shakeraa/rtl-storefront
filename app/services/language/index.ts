/**
 * Language Service
 * T0010: Language Switcher
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag?: string;
  isDefault?: boolean;
}

export interface LanguageSwitcherConfig {
  display: 'dropdown' | 'buttons' | 'flags';
  showNames: boolean;
  showFlags: boolean;
  position: 'header' | 'footer' | 'floating';
}

// Supported languages for RTL store
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', flag: '🇵🇰' },
];

// Get language by code
export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

// Get RTL languages
export function getRTLLanguages(): Language[] {
  return SUPPORTED_LANGUAGES.filter((l) => l.direction === 'rtl');
}

// Detect browser language
export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0];
  const supported = SUPPORTED_LANGUAGES.find((l) => l.code === browserLang);
  
  return supported?.code || 'en';
}

// Get language switcher options
export function getLanguageSwitcherOptions(): LanguageSwitcherConfig {
  return {
    display: 'dropdown',
    showNames: true,
    showFlags: true,
    position: 'header',
  };
}

// Store language preference
export function storeLanguagePreference(code: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('preferred_language', code);
}

// Get stored language preference
export function getStoredLanguagePreference(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('preferred_language');
}

// Export all
export * from './constants';
