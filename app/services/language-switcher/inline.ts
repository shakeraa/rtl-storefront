import type { LanguageOption } from "./types";
import { SUPPORTED_LANGUAGES } from "./options";

/**
 * Position options for the inline switcher dropdown
 */
export type DropdownPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

/**
 * Display style for language options
 */
export type DisplayStyle = "flag-only" | "text-only" | "flag-text" | "text-flag";

/**
 * Configuration for the inline language switcher
 */
export interface InlineSwitcherConfig {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Current placement (header or footer) */
  placement: "header" | "footer";
  /** Dropdown positioning relative to trigger */
  position: DropdownPosition;
  /** Display style for options */
  displayStyle: DisplayStyle;
  /** Show flags in the switcher */
  showFlags: boolean;
  /** Show native language names */
  showNativeNames: boolean;
  /** Use compact design */
  compact: boolean;
  /** Maximum height of dropdown in pixels */
  maxDropdownHeight: number;
  /** Enable keyboard navigation */
  keyboardNavigation: boolean;
  /** Auto-close on selection */
  autoClose: boolean;
  /** Auto-close on outside click */
  closeOnOutsideClick: boolean;
}

/**
 * Display options for rendering the switcher
 */
export interface DisplayOptions {
  /** CSS class for the container */
  containerClass: string;
  /** CSS class for the trigger button */
  triggerClass: string;
  /** CSS class for the dropdown */
  dropdownClass: string;
  /** CSS class for dropdown items */
  itemClass: string;
  /** CSS class for active item */
  activeItemClass: string;
  /** Inline styles for dropdown positioning */
  dropdownStyles: Record<string, string>;
  /** Whether to render in RTL mode */
  isRtl: boolean;
  /** ARIA attributes for accessibility */
  ariaAttributes: {
    trigger: Record<string, string>;
    dropdown: Record<string, string>;
    items: Record<string, string>;
  };
}

/**
 * Labels for dropdown UI elements
 */
export interface DropdownLabels {
  /** Label for the switcher trigger */
  triggerLabel: string;
  /** ARIA label for the dropdown */
  dropdownAriaLabel: string;
  /** Label for current language indicator */
  currentLanguageLabel: string;
  /** Label for "more languages" if truncated */
  moreLanguagesLabel: string;
  /** Close button label */
  closeLabel: string;
  /** Toggle button label */
  toggleLabel: string;
}

/**
 * Formatted language option for display
 */
export interface FormattedLanguageOption {
  /** Locale code */
  locale: string;
  /** Display label */
  label: string;
  /** Flag emoji or icon */
  flag: string;
  /** Whether this is the current language */
  isActive: boolean;
  /** Text direction */
  direction: "rtl" | "ltr";
  /** HTML class for styling */
  className: string;
  /** Data attributes for the element */
  dataAttributes: Record<string, string>;
}

/**
 * Get default inline switcher configuration for a locale
 */
export function getInlineSwitcherConfig(locale: string): InlineSwitcherConfig {
  const isRtl = isRtlLocale(locale);
  
  return {
    isOpen: false,
    placement: "header",
    position: isRtl ? "bottom-right" : "bottom-left",
    displayStyle: "flag-text",
    showFlags: true,
    showNativeNames: true,
    compact: false,
    maxDropdownHeight: 300,
    keyboardNavigation: true,
    autoClose: true,
    closeOnOutsideClick: true,
  };
}

/**
 * Get display options for rendering the switcher
 */
export function getDisplayOptions(
  config: Partial<InlineSwitcherConfig> = {},
  currentLocale: string = "en"
): DisplayOptions {
  const isRtl = isRtlLocale(currentLocale);
  const placement = config.placement ?? "header";
  const compact = config.compact ?? false;
  const isOpen = config.isOpen ?? false;

  const baseClasses = {
    container: [
      "language-switcher",
      `language-switcher--${placement}`,
      compact ? "language-switcher--compact" : "",
      isRtl ? "language-switcher--rtl" : "language-switcher--ltr",
    ].filter(Boolean).join(" "),
    trigger: [
      "language-switcher__trigger",
      isOpen ? "language-switcher__trigger--open" : "",
    ].filter(Boolean).join(" "),
    dropdown: [
      "language-switcher__dropdown",
      `language-switcher__dropdown--${config.position ?? "bottom-left"}`,
      isOpen ? "language-switcher__dropdown--visible" : "",
    ].filter(Boolean).join(" "),
    item: "language-switcher__item",
    activeItem: "language-switcher__item language-switcher__item--active",
  };

  const dropdownStyles = getDropdownPositionStyles(
    config.position ?? "bottom-left",
    config.maxDropdownHeight ?? 300
  );

  return {
    containerClass: baseClasses.container,
    triggerClass: baseClasses.trigger,
    dropdownClass: baseClasses.dropdown,
    itemClass: baseClasses.item,
    activeItemClass: baseClasses.activeItem,
    dropdownStyles,
    isRtl,
    ariaAttributes: {
      trigger: {
        "aria-haspopup": "listbox",
        "aria-expanded": String(isOpen),
        "aria-label": "Select language",
      },
      dropdown: {
        role: "listbox",
        "aria-label": "Available languages",
      },
      items: {
        role: "option",
      },
    },
  };
}

/**
 * Get localized labels for dropdown UI elements
 */
export function getDropdownLabels(locale: string): DropdownLabels {
  const labels: Record<string, DropdownLabels> = {
    en: {
      triggerLabel: "Select language",
      dropdownAriaLabel: "Available languages",
      currentLanguageLabel: "Current language",
      moreLanguagesLabel: "More languages",
      closeLabel: "Close language selector",
      toggleLabel: "Toggle language menu",
    },
    ar: {
      triggerLabel: "اختيار اللغة",
      dropdownAriaLabel: "اللغات المتاحة",
      currentLanguageLabel: "اللغة الحالية",
      moreLanguagesLabel: "المزيد من اللغات",
      closeLabel: "إغلاق محدد اللغة",
      toggleLabel: "تبديل قائمة اللغات",
    },
    he: {
      triggerLabel: "בחירת שפה",
      dropdownAriaLabel: "שפות זמינות",
      currentLanguageLabel: "השפה הנוכחית",
      moreLanguagesLabel: "שפות נוספות",
      closeLabel: "סגור בורר שפה",
      toggleLabel: "החלף תפריט שפה",
    },
    fa: {
      triggerLabel: "انتخاب زبان",
      dropdownAriaLabel: "زبان‌های موجود",
      currentLanguageLabel: "زبان فعلی",
      moreLanguagesLabel: "زبان‌های بیشتر",
      closeLabel: "بستن انتخاب‌گر زبان",
      toggleLabel: "تغییر منوی زبان",
    },
    fr: {
      triggerLabel: "Choisir la langue",
      dropdownAriaLabel: "Langues disponibles",
      currentLanguageLabel: "Langue actuelle",
      moreLanguagesLabel: "Plus de langues",
      closeLabel: "Fermer le sélecteur de langue",
      toggleLabel: "Basculer le menu des langues",
    },
    de: {
      triggerLabel: "Sprache wählen",
      dropdownAriaLabel: "Verfügbare Sprachen",
      currentLanguageLabel: "Aktuelle Sprache",
      moreLanguagesLabel: "Weitere Sprachen",
      closeLabel: "Sprachauswahl schließen",
      toggleLabel: "Sprachmenü umschalten",
    },
    es: {
      triggerLabel: "Seleccionar idioma",
      dropdownAriaLabel: "Idiomas disponibles",
      currentLanguageLabel: "Idioma actual",
      moreLanguagesLabel: "Más idiomas",
      closeLabel: "Cerrar selector de idioma",
      toggleLabel: "Alternar menú de idioma",
    },
    default: {
      triggerLabel: "Select language",
      dropdownAriaLabel: "Available languages",
      currentLanguageLabel: "Current language",
      moreLanguagesLabel: "More languages",
      closeLabel: "Close language selector",
      toggleLabel: "Toggle language menu",
    },
  };

  return labels[locale] ?? labels.default;
}

/**
 * Format a language option for display
 */
export function formatLanguageOption(
  lang: LanguageOption,
  locale: string
): FormattedLanguageOption {
  const isRtl = isRtlLocale(locale);
  const isActive = lang.isActive;

  // Determine display label based on options
  const label = lang.nativeName || lang.name;

  // Generate appropriate CSS class
  const className = [
    "language-option",
    `language-option--${lang.locale}`,
    isActive ? "language-option--active" : "",
    `language-option--${lang.direction}`,
  ].filter(Boolean).join(" ");

  // Data attributes for the element
  const dataAttributes: Record<string, string> = {
    "data-locale": lang.locale,
    "data-direction": lang.direction,
    "data-active": String(isActive),
  };

  return {
    locale: lang.locale,
    label,
    flag: lang.flag ?? "",
    isActive,
    direction: lang.direction,
    className,
    dataAttributes,
  };
}

/**
 * Toggle dropdown open/closed state
 */
export function toggleDropdown(config: InlineSwitcherConfig): InlineSwitcherConfig {
  return {
    ...config,
    isOpen: !config.isOpen,
  };
}

/**
 * Close dropdown
 */
export function closeDropdown(config: InlineSwitcherConfig): InlineSwitcherConfig {
  return {
    ...config,
    isOpen: false,
  };
}

/**
 * Open dropdown
 */
export function openDropdown(config: InlineSwitcherConfig): InlineSwitcherConfig {
  return {
    ...config,
    isOpen: true,
  };
}

/**
 * Get optimal dropdown position based on viewport and placement
 */
export function getOptimalDropdownPosition(
  placement: "header" | "footer",
  isRtl: boolean,
  viewportWidth: number = 1024,
  triggerRect?: { x: number; y: number; width: number; height: number }
): DropdownPosition {
  // For header: dropdown opens below
  // For footer: dropdown opens above
  const vertical = placement === "header" ? "bottom" : "top";
  
  // For RTL: align to right, for LTR: align to left
  // If near edge, flip to other side
  const horizontal = isRtl ? "right" : "left";
  
  if (triggerRect && viewportWidth > 0) {
    const triggerRight = triggerRect.x + triggerRect.width;
    const spaceOnRight = viewportWidth - triggerRight;
    const spaceOnLeft = triggerRect.x;
    
    // Flip horizontal if not enough space
    if (!isRtl && spaceOnRight < 150) {
      return `${vertical}-right` as DropdownPosition;
    }
    if (isRtl && spaceOnLeft < 150) {
      return `${vertical}-left` as DropdownPosition;
    }
  }
  
  return `${vertical}-${horizontal}` as DropdownPosition;
}

/**
 * Get display format for the trigger button
 */
export function getTriggerDisplay(
  currentLanguage: LanguageOption,
  displayStyle: DisplayStyle,
  showNativeName: boolean = true
): { content: string; title: string } {
  const flag = currentLanguage.flag ?? "";
  const name = showNativeName ? currentLanguage.nativeName : currentLanguage.name;

  switch (displayStyle) {
    case "flag-only":
      return { content: flag, title: name };
    case "text-only":
      return { content: name, title: name };
    case "flag-text":
      return { content: `${flag} ${name}`, title: name };
    case "text-flag":
      return { content: `${name} ${flag}`, title: name };
    default:
      return { content: `${flag} ${name}`, title: name };
  }
}

/**
 * Sort language options with active first, then alphabetically
 */
export function sortLanguageOptions(options: LanguageOption[]): LanguageOption[] {
  return [...options].sort((a, b) => {
    // Active language always first
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    // Then sort by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter language options by search query
 */
export function filterLanguageOptions(
  options: LanguageOption[],
  query: string
): LanguageOption[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return options;
  
  return options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(normalizedQuery) ||
      opt.nativeName.toLowerCase().includes(normalizedQuery) ||
      opt.locale.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Get keyboard navigation handlers
 */
export function getKeyboardNavigation(
  options: LanguageOption[],
  currentIndex: number
): {
  nextIndex: number;
  prevIndex: number;
  firstIndex: number;
  lastIndex: number;
} {
  const total = options.length;
  return {
    nextIndex: (currentIndex + 1) % total,
    prevIndex: (currentIndex - 1 + total) % total,
    firstIndex: 0,
    lastIndex: total - 1,
  };
}

/**
 * Check if should use compact mode based on available languages count
 */
export function shouldUseCompactMode(
  languageCount: number,
  maxForFull: number = 5
): boolean {
  return languageCount > maxForFull;
}

/**
 * Get CSS variables for theming
 */
export function getThemeVariables(
  isDark: boolean = false,
  primaryColor?: string
): Record<string, string> {
  const colors = isDark
    ? {
        "--switcher-bg": "#1a1a1a",
        "--switcher-text": "#ffffff",
        "--switcher-border": "#333333",
        "--switcher-hover-bg": "#2a2a2a",
        "--switcher-active-bg": "#333333",
        "--switcher-dropdown-bg": "#1a1a1a",
        "--switcher-dropdown-shadow": "0 4px 12px rgba(0,0,0,0.5)",
      }
    : {
        "--switcher-bg": "#ffffff",
        "--switcher-text": "#333333",
        "--switcher-border": "#e0e0e0",
        "--switcher-hover-bg": "#f5f5f5",
        "--switcher-active-bg": "#e8e8e8",
        "--switcher-dropdown-bg": "#ffffff",
        "--switcher-dropdown-shadow": "0 4px 12px rgba(0,0,0,0.15)",
      };

  if (primaryColor) {
    colors["--switcher-primary"] = primaryColor;
  }

  return colors;
}

// Helper functions

/**
 * Check if a locale is RTL
 */
function isRtlLocale(locale: string): boolean {
  const rtlLocales = ["ar", "he", "fa", "ur", "dv", "ps", "yi"];
  const baseLocale = locale.split("-")[0].toLowerCase();
  return rtlLocales.includes(baseLocale);
}

/**
 * Get CSS styles for dropdown positioning
 */
function getDropdownPositionStyles(
  position: DropdownPosition,
  maxHeight: number
): Record<string, string> {
  const baseStyles: Record<string, string> = {
    position: "absolute",
    "z-index": "1000",
    "max-height": `${maxHeight}px`,
    "overflow-y": "auto",
  };

  switch (position) {
    case "bottom-left":
      return { ...baseStyles, top: "100%", left: "0", right: "auto" };
    case "bottom-right":
      return { ...baseStyles, top: "100%", right: "0", left: "auto" };
    case "top-left":
      return { ...baseStyles, bottom: "100%", left: "0", right: "auto" };
    case "top-right":
      return { ...baseStyles, bottom: "100%", right: "0", left: "auto" };
    default:
      return baseStyles;
  }
}
