export interface LanguageOption {
  locale: string;
  name: string;
  nativeName: string;
  direction: "rtl" | "ltr";
  flag?: string;
  isActive: boolean;
}

export interface SwitcherConfig {
  placement: "header" | "footer" | "both";
  style: "dropdown" | "inline" | "floating";
  showFlags: boolean;
  showNativeNames: boolean;
  compact: boolean;
}

export interface SwitcherState {
  currentLocale: string;
  availableLocales: LanguageOption[];
  config: SwitcherConfig;
}
