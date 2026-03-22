export interface CheckoutExtensionConfig {
  shop: string;
  locale: string;
  direction: "rtl" | "ltr";
  enableLanguageSwitcher: boolean;
  enableCurrencySwitcher: boolean;
  enableMenaPayments: boolean;
  availableLocales: Array<{ code: string; name: string; nativeName: string }>;
  availableCurrencies: Array<{ code: string; symbol: string; name: string }>;
  menaPaymentMethods: Array<{ id: string; name: string; icon: string; enabled: boolean }>;
}

export interface CheckoutBranding {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  direction: "rtl" | "ltr";
}

export interface CheckoutTranslation {
  locale: string;
  labels: Record<string, string>;
}
