/**
 * Native Script Display Service
 * T0043: Language Switcher - Native Script Display
 */

export interface LanguageDisplay {
  code: string;
  name: string;
  nativeName: string;
  script: 'latin' | 'arabic' | 'hebrew' | 'cyrillic' | 'cjk' | 'other';
  direction: 'ltr' | 'rtl';
  flag?: string;
}

// Languages with native script names
export const LANGUAGES_WITH_NATIVE_SCRIPT: LanguageDisplay[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'latin', direction: 'ltr', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', script: 'arabic', direction: 'rtl', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', script: 'hebrew', direction: 'rtl', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', script: 'arabic', direction: 'rtl', flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'arabic', direction: 'rtl', flag: '🇵🇰' },
  { code: 'fr', name: 'French', nativeName: 'Français', script: 'latin', direction: 'ltr', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', script: 'latin', direction: 'ltr', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', script: 'latin', direction: 'ltr', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', script: 'latin', direction: 'ltr', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', script: 'latin', direction: 'ltr', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', script: 'cyrillic', direction: 'ltr', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', script: 'cjk', direction: 'ltr', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', script: 'cjk', direction: 'ltr', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', script: 'cjk', direction: 'ltr', flag: '🇰🇷' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', script: 'latin', direction: 'ltr', flag: '🇹🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'other', direction: 'ltr', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', script: 'other', direction: 'ltr', flag: '🇹🇭' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', script: 'other', direction: 'ltr', flag: '🇬🇷' },
];

export type DisplayMode = 'native' | 'english' | 'both';

/**
 * Get language display config
 */
export function getLanguageDisplay(code: string): LanguageDisplay | undefined {
  return LANGUAGES_WITH_NATIVE_SCRIPT.find((l) => l.code === code);
}

/**
 * Get language name for display
 */
export function getLanguageName(
  code: string,
  mode: DisplayMode = 'native',
  displayLocale: string = 'en'
): string {
  const lang = getLanguageDisplay(code);
  if (!lang) return code;

  switch (mode) {
    case 'native':
      return lang.nativeName;
    case 'english':
      return lang.name;
    case 'both':
      if (displayLocale === 'ar') {
        return `${lang.nativeName} (${lang.name})`;
      }
      return `${lang.name} (${lang.nativeName})`;
    default:
      return lang.nativeName;
  }
}

/**
 * Get all languages for display
 */
export function getLanguagesForDisplay(
  mode: DisplayMode = 'native',
  filter?: { direction?: 'ltr' | 'rtl'; script?: string }
): Array<{ code: string; name: string; flag?: string }> {
  let languages = [...LANGUAGES_WITH_NATIVE_SCRIPT];

  if (filter?.direction) {
    languages = languages.filter((l) => l.direction === filter.direction);
  }

  if (filter?.script) {
    languages = languages.filter((l) => l.script === filter.script);
  }

  return languages.map((l) => ({
    code: l.code,
    name: getLanguageName(l.code, mode),
    flag: l.flag,
  }));
}

/**
 * Get RTL languages
 */
export function getRTLLanguagesNative(): LanguageDisplay[] {
  return LANGUAGES_WITH_NATIVE_SCRIPT.filter((l) => l.direction === 'rtl');
}

/**
 * Get LTR languages
 */
export function getLTRLanguagesNative(): LanguageDisplay[] {
  return LANGUAGES_WITH_NATIVE_SCRIPT.filter((l) => l.direction === 'ltr');
}

/**
 * Check if language uses native script
 */
export function usesNativeScript(code: string): boolean {
  const lang = getLanguageDisplay(code);
  if (!lang) return false;
  return lang.script !== 'latin' || lang.nativeName !== lang.name;
}

/**
 * Get script type for language
 */
export function getScriptType(code: string): string {
  return getLanguageDisplay(code)?.script || 'latin';
}

/**
 * Format language selector item
 */
export function formatLanguageSelectorItem(
  code: string,
  mode: DisplayMode = 'native',
  showFlag: boolean = true
): string {
  const lang = getLanguageDisplay(code);
  if (!lang) return code;

  const parts: string[] = [];
  
  if (showFlag && lang.flag) {
    parts.push(lang.flag);
  }
  
  parts.push(getLanguageName(code, mode));
  
  return parts.join(' ');
}

/**
 * Get language direction
 */
export function getLanguageDirection(code: string): 'ltr' | 'rtl' {
  return getLanguageDisplay(code)?.direction || 'ltr';
}

/**
 * Sort languages by native name
 */
export function sortLanguagesByNativeName(
  codes: string[],
  sortLocale: string = 'en'
): string[] {
  return [...codes].sort((a, b) => {
    const nameA = getLanguageName(a, 'native');
    const nameB = getLanguageName(b, 'native');
    return nameA.localeCompare(nameB, sortLocale);
  });
}

/**
 * Group languages by script
 */
export function groupLanguagesByScript(): Record<string, LanguageDisplay[]> {
  const groups: Record<string, LanguageDisplay[]> = {};
  
  LANGUAGES_WITH_NATIVE_SCRIPT.forEach((lang) => {
    if (!groups[lang.script]) {
      groups[lang.script] = [];
    }
    groups[lang.script].push(lang);
  });
  
  return groups;
}
