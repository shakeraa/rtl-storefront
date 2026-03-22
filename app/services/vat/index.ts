import { getTextDirection } from "../../utils/rtl";

export interface VATConfig {
  countryCode: string;
  rate: number;
  name: string;
  nameAr: string;
  inclusive: boolean;
}

export interface VATCalculation {
  subtotal: number;
  vatAmount: number;
  total: number;
  vatRate: number;
  vatLabel: string;
  currency: string;
  inclusive: boolean;
  formatted: {
    subtotal: string;
    vatAmount: string;
    total: string;
    vatLabel: string;
  };
}

export interface VATInvoiceData {
  invoiceNumber: string;
  issueDate: string;
  sellerName: string;
  sellerVatNumber: string;
  buyerName?: string;
  buyerVatNumber?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    total: number;
  }>;
  subtotal: number;
  totalVat: number;
  grandTotal: number;
  currency: string;
  locale: string;
}

const GCC_VAT_RATES: Record<string, VATConfig> = {
  SA: { countryCode: "SA", rate: 0.15, name: "VAT", nameAr: "ضريبة القيمة المضافة", inclusive: true },
  AE: { countryCode: "AE", rate: 0.05, name: "VAT", nameAr: "ضريبة القيمة المضافة", inclusive: true },
  BH: { countryCode: "BH", rate: 0.10, name: "VAT", nameAr: "ضريبة القيمة المضافة", inclusive: true },
  OM: { countryCode: "OM", rate: 0.05, name: "VAT", nameAr: "ضريبة القيمة المضافة", inclusive: true },
  KW: { countryCode: "KW", rate: 0, name: "VAT", nameAr: "ضريبة القيمة المضافة", inclusive: false },
  QA: { countryCode: "QA", rate: 0, name: "VAT", nameAr: "ضريبة القيمة المضافة", inclusive: false },
};

export function getVATConfig(countryCode: string): VATConfig | null {
  return GCC_VAT_RATES[countryCode.toUpperCase()] ?? null;
}

export function calculateVAT(
  subtotal: number,
  countryCode: string,
  currency: string,
  locale: string = "en",
): VATCalculation {
  const config = getVATConfig(countryCode);
  const rate = config?.rate ?? 0;
  const inclusive = config?.inclusive ?? false;

  let vatAmount: number;
  let actualSubtotal: number;
  let total: number;

  if (inclusive && rate > 0) {
    vatAmount = subtotal - subtotal / (1 + rate);
    actualSubtotal = subtotal - vatAmount;
    total = subtotal;
  } else {
    vatAmount = subtotal * rate;
    actualSubtotal = subtotal;
    total = subtotal + vatAmount;
  }

  vatAmount = Math.round(vatAmount * 100) / 100;
  actualSubtotal = Math.round(actualSubtotal * 100) / 100;
  total = Math.round(total * 100) / 100;

  const baseLocale = locale.split("-")[0]?.toLowerCase() ?? "en";
  const vatLabel = baseLocale === "ar" ? config?.nameAr ?? "ضريبة القيمة المضافة" : `VAT (${(rate * 100).toFixed(0)}%)`;

  const fmt = (n: number) => formatCurrency(n, currency, locale);

  return {
    subtotal: actualSubtotal,
    vatAmount,
    total,
    vatRate: rate,
    vatLabel,
    currency,
    inclusive,
    formatted: {
      subtotal: fmt(actualSubtotal),
      vatAmount: fmt(vatAmount),
      total: fmt(total),
      vatLabel,
    },
  };
}

export function isGCCCountry(countryCode: string): boolean {
  return countryCode.toUpperCase() in GCC_VAT_RATES;
}

export function getGCCCountries(): string[] {
  return Object.keys(GCC_VAT_RATES);
}

export function validateVATNumber(vatNumber: string, countryCode: string): boolean {
  const cleaned = vatNumber.replace(/\s/g, "");
  const patterns: Record<string, RegExp> = {
    SA: /^3\d{13}3$/, // Saudi TRN: starts and ends with 3, 15 digits
    AE: /^\d{15}$/, // UAE TRN: 15 digits
    BH: /^\d{8,15}$/, // Bahrain: 8-15 digits
    OM: /^\d{8,12}$/, // Oman: 8-12 digits
  };
  const pattern = patterns[countryCode.toUpperCase()];
  return pattern ? pattern.test(cleaned) : cleaned.length >= 5;
}

export function generateInvoiceNumber(shop: string): string {
  const date = new Date();
  const prefix = shop.replace(/\.myshopify\.com$/, "").slice(0, 4).toUpperCase();
  const timestamp = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
