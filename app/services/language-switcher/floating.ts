import type { LanguageOption } from "./types";

export type FloatingPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "top-center";

export type FloatingVisibility = "always" | "scroll" | "hover" | "minimize-on-scroll";

export interface FloatingSwitcherConfig {
  position: FloatingPosition;
  visibility: FloatingVisibility;
  offsetX: number;
  offsetY: number;
  zIndex: number;
  compact: boolean;
  showFlags: boolean;
  showNativeNames: boolean;
  scrollThreshold: number;
  minimizeDelay: number;
  expandOnHover: boolean;
  mobileOptimized: boolean;
  mobileBreakpoint: number;
  tabletBreakpoint: number;
}

export interface PositionStyles {
  position: "fixed";
  [key: string]: string | number;
}

export interface VisibilityRules {
  followScroll: boolean;
  minimizeOnScroll: boolean;
  expandOnHover: boolean;
  autoHide: boolean;
  hideDelay: number;
  showDelay: number;
}

export interface FloatingSwitcherLabels {
  selectLanguage: string;
  currentLanguage: string;
  switchTo: string;
  minimize: string;
  expand: string;
  close: string;
}

export interface RTLPositionAdjustments {
  flipHorizontal: boolean;
  mirrorOffsets: boolean;
  adjustTextAlign: boolean;
}

const DEFAULT_CONFIG: FloatingSwitcherConfig = {
  position: "bottom-right",
  visibility: "always",
  offsetX: 16,
  offsetY: 16,
  zIndex: 9999,
  compact: false,
  showFlags: true,
  showNativeNames: true,
  scrollThreshold: 100,
  minimizeDelay: 500,
  expandOnHover: true,
  mobileOptimized: true,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
};

const RTL_POSITIONS: Record<string, FloatingPosition> = {
  "bottom-right": "bottom-left",
  "bottom-left": "bottom-right",
  "top-right": "top-left",
  "top-left": "top-right",
  "bottom-center": "bottom-center",
  "top-center": "top-center",
};

const LABELS: Record<string, FloatingSwitcherLabels> = {
  en: {
    selectLanguage: "Select Language",
    currentLanguage: "Current Language",
    switchTo: "Switch to",
    minimize: "Minimize",
    expand: "Expand",
    close: "Close",
  },
  ar: {
    selectLanguage: "اختيار اللغة",
    currentLanguage: "اللغة الحالية",
    switchTo: "التبديل إلى",
    minimize: "تصغير",
    expand: "توسيع",
    close: "إغلاق",
  },
  he: {
    selectLanguage: "בחירת שפה",
    currentLanguage: "שפה נוכחית",
    switchTo: "עבור ל",
    minimize: "מזער",
    expand: "הרחב",
    close: "סגור",
  },
  fa: {
    selectLanguage: "انتخاب زبان",
    currentLanguage: "زبان فعلی",
    switchTo: "تغییر به",
    minimize: "کوچک کردن",
    expand: "بزرگ کردن",
    close: "بستن",
  },
  fr: {
    selectLanguage: "Choisir la langue",
    currentLanguage: "Langue actuelle",
    switchTo: "Passer à",
    minimize: "Réduire",
    expand: "Agrandir",
    close: "Fermer",
  },
  de: {
    selectLanguage: "Sprache auswählen",
    currentLanguage: "Aktuelle Sprache",
    switchTo: "Wechseln zu",
    minimize: "Minimieren",
    expand: "Erweitern",
    close: "Schließen",
  },
  es: {
    selectLanguage: "Seleccionar idioma",
    currentLanguage: "Idioma actual",
    switchTo: "Cambiar a",
    minimize: "Minimizar",
    expand: "Expandir",
    close: "Cerrar",
  },
};

/**
 * Check if a locale is RTL
 */
function isRTLLocale(locale: string): boolean {
  const rtlLocales = ["ar", "he", "fa", "ur"];
  const baseLocale = locale.split("-")[0].toLowerCase();
  return rtlLocales.includes(baseLocale);
}

/**
 * Get base locale for label lookup
 */
function getBaseLocale(locale: string): string {
  return locale.split("-")[0].toLowerCase();
}

/**
 * Get floating switcher configuration for a specific locale
 * Adjusts position for RTL contexts
 */
export function getFloatingSwitcherConfig(
  locale: string,
  overrides?: Partial<FloatingSwitcherConfig>,
): FloatingSwitcherConfig {
  const isRTL = isRTLLocale(locale);
  let config = { ...DEFAULT_CONFIG };

  // Adjust position for RTL
  if (isRTL) {
    config.position = RTL_POSITIONS[config.position];
  }

  // Apply overrides
  if (overrides) {
    config = { ...config, ...overrides };

    // If position was overridden, also adjust for RTL if needed
    if (overrides.position && isRTL) {
      config.position = RTL_POSITIONS[overrides.position] || overrides.position;
    }
  }

  return config;
}

/**
 * Get CSS position styles for a given position
 * Returns styles for desktop, mobile, and tablet breakpoints
 */
export function getPositionStyles(
  position: FloatingPosition,
  offsetX?: number,
  offsetY?: number,
): {
  desktop: PositionStyles;
  mobile: PositionStyles;
  tablet: PositionStyles;
} {
  const x = offsetX ?? 16;
  const y = offsetY ?? 16;

  const baseStyles: PositionStyles = {
    position: "fixed",
    zIndex: 9999,
  };

  const getPositionStyles = (pos: FloatingPosition, isMobile = false): PositionStyles => {
    const scale = isMobile ? 0.5 : 1;
    const adjustedX = x * scale;
    const adjustedY = y * scale;

    switch (pos) {
      case "bottom-right":
        return {
          ...baseStyles,
          bottom: `${adjustedY}px`,
          right: `${adjustedX}px`,
          left: "auto",
          top: "auto",
        };
      case "bottom-left":
        return {
          ...baseStyles,
          bottom: `${adjustedY}px`,
          left: `${adjustedX}px`,
          right: "auto",
          top: "auto",
        };
      case "top-right":
        return {
          ...baseStyles,
          top: `${adjustedY}px`,
          right: `${adjustedX}px`,
          left: "auto",
          bottom: "auto",
        };
      case "top-left":
        return {
          ...baseStyles,
          top: `${adjustedY}px`,
          left: `${adjustedX}px`,
          right: "auto",
          bottom: "auto",
        };
      case "bottom-center":
        return {
          ...baseStyles,
          bottom: `${adjustedY}px`,
          left: "50%",
          right: "auto",
          top: "auto",
          transform: "translateX(-50%)",
        };
      case "top-center":
        return {
          ...baseStyles,
          top: `${adjustedY}px`,
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translateX(-50%)",
        };
      default:
        return {
          ...baseStyles,
          bottom: `${adjustedY}px`,
          right: `${adjustedX}px`,
          left: "auto",
          top: "auto",
        };
    }
  };

  return {
    desktop: getPositionStyles(position, false),
    mobile: getPositionStyles(position, true),
    tablet: getPositionStyles(position, false),
  };
}

/**
 * Get visibility rules based on visibility mode
 */
export function getVisibilityRules(visibility: FloatingVisibility): VisibilityRules {
  const rules: Record<FloatingVisibility, VisibilityRules> = {
    always: {
      followScroll: false,
      minimizeOnScroll: false,
      expandOnHover: false,
      autoHide: false,
      hideDelay: 0,
      showDelay: 0,
    },
    scroll: {
      followScroll: true,
      minimizeOnScroll: false,
      expandOnHover: false,
      autoHide: false,
      hideDelay: 0,
      showDelay: 0,
    },
    hover: {
      followScroll: false,
      minimizeOnScroll: false,
      expandOnHover: true,
      autoHide: true,
      hideDelay: 300,
      showDelay: 100,
    },
    "minimize-on-scroll": {
      followScroll: true,
      minimizeOnScroll: true,
      expandOnHover: true,
      autoHide: false,
      hideDelay: 0,
      showDelay: 200,
    },
  };

  return rules[visibility];
}

/**
 * Get localized labels for the floating switcher
 */
export function getSwitcherLabels(locale: string): FloatingSwitcherLabels {
  const baseLocale = getBaseLocale(locale);
  return LABELS[baseLocale] ?? LABELS.en;
}

/**
 * Get RTL-specific position adjustments
 */
export function getRTLPositionAdjustments(isRTL: boolean): RTLPositionAdjustments {
  return {
    flipHorizontal: isRTL,
    mirrorOffsets: isRTL,
    adjustTextAlign: isRTL,
  };
}

/**
 * Calculate responsive offsets based on viewport width
 */
export function getResponsiveOffsets(
  viewportWidth: number,
  baseOffsetX: number,
  baseOffsetY: number,
): { offsetX: number; offsetY: number } {
  // Mobile (< 768px)
  if (viewportWidth < 768) {
    return {
      offsetX: Math.max(8, baseOffsetX * 0.5),
      offsetY: Math.max(8, baseOffsetY * 0.5),
    };
  }

  // Tablet (768px - 1024px)
  if (viewportWidth < 1024) {
    return {
      offsetX: baseOffsetX * 0.75,
      offsetY: baseOffsetY * 0.75,
    };
  }

  // Desktop (>= 1024px)
  return {
    offsetX: baseOffsetX,
    offsetY: baseOffsetY,
  };
}

/**
 * Determine if the switcher should be minimized based on scroll position
 */
export function shouldMinimizeOnScroll(
  scrollY: number,
  threshold: number,
  isMinimized: boolean,
): boolean {
  if (isMinimized && scrollY < threshold * 0.5) {
    return false; // Expand when scrolled back to top
  }
  if (!isMinimized && scrollY > threshold) {
    return true; // Minimize when scrolled past threshold
  }
  return isMinimized;
}

/**
 * Get mobile-optimized configuration
 */
export function getMobileOptimizedConfig(
  baseConfig: FloatingSwitcherConfig,
): FloatingSwitcherConfig {
  return {
    ...baseConfig,
    compact: true,
    offsetX: Math.max(8, baseConfig.offsetX * 0.5),
    offsetY: Math.max(8, baseConfig.offsetY * 0.5),
    showNativeNames: false,
  };
}

/**
 * Check if the switcher should be visible on mobile
 */
export function shouldShowOnMobile(
  isMobile: boolean,
  mobileOptimized: boolean,
): boolean {
  if (!isMobile) return true;
  return mobileOptimized;
}

/**
 * Get aria attributes for accessibility
 */
export function getAccessibilityAttributes(
  labels: FloatingSwitcherLabels,
  isExpanded: boolean,
): Record<string, string> {
  return {
    role: "button",
    "aria-label": isExpanded ? labels.minimize : labels.expand,
    "aria-expanded": String(isExpanded),
    tabindex: "0",
  };
}

/**
 * Get the best position for a given locale considering RTL
 */
export function getBestPositionForLocale(
  preferredPosition: FloatingPosition,
  locale: string,
): FloatingPosition {
  const isRTL = isRTLLocale(locale);
  if (isRTL) {
    return RTL_POSITIONS[preferredPosition] || preferredPosition;
  }
  return preferredPosition;
}

/**
 * Build style object for floating switcher with RTL support
 */
export function buildFloatingSwitcherStyles(
  config: FloatingSwitcherConfig,
  locale: string,
  isMinimized = false,
): Record<string, string | number> {
  const isRTL = isRTLLocale(locale);
  const { desktop } = getPositionStyles(config.position, config.offsetX, config.offsetY);
  
  const styles: Record<string, string | number> = {
    ...desktop,
    zIndex: config.zIndex,
  };

  if (isMinimized) {
    styles.width = "48px";
    styles.height = "48px";
    styles.overflow = "hidden";
  }

  if (isRTL) {
    styles.direction = "rtl";
    styles.textAlign = "right";
  }

  return styles;
}
