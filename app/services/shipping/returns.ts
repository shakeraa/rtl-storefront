/**
 * T0290 - Local Return Addresses
 * MENA return center management with localized instructions and label generation.
 */

export interface ReturnAddress {
  id: string;
  shop: string;
  country: string;
  city: string;
  name: string;
  address1: string;
  address2?: string;
  postalCode: string;
  phone: string;
  email: string;
  isDefault: boolean;
  locale: string;
}

/**
 * Default return center addresses across MENA countries.
 */
export const MENA_RETURN_CENTERS: ReturnAddress[] = [
  {
    id: "rc-sa-riyadh",
    shop: "",
    country: "SA",
    city: "Riyadh",
    name: "Riyadh Return Center",
    address1: "Al Sulay District, Industrial Area",
    postalCode: "11564",
    phone: "+966112345678",
    email: "returns-riyadh@example.com",
    isDefault: true,
    locale: "ar-SA",
  },
  {
    id: "rc-sa-jeddah",
    shop: "",
    country: "SA",
    city: "Jeddah",
    name: "Jeddah Return Center",
    address1: "Al Khumra District, Logistics Zone",
    postalCode: "23719",
    phone: "+966122345678",
    email: "returns-jeddah@example.com",
    isDefault: false,
    locale: "ar-SA",
  },
  {
    id: "rc-ae-dubai",
    shop: "",
    country: "AE",
    city: "Dubai",
    name: "Dubai Return Center",
    address1: "Dubai South, Logistics District",
    postalCode: "00000",
    phone: "+97142345678",
    email: "returns-dubai@example.com",
    isDefault: true,
    locale: "ar-AE",
  },
  {
    id: "rc-ae-abudhabi",
    shop: "",
    country: "AE",
    city: "Abu Dhabi",
    name: "Abu Dhabi Return Center",
    address1: "Musaffah Industrial Area, M-17",
    postalCode: "00000",
    phone: "+97122345678",
    email: "returns-abudhabi@example.com",
    isDefault: false,
    locale: "ar-AE",
  },
  {
    id: "rc-kw-kuwait",
    shop: "",
    country: "KW",
    city: "Kuwait City",
    name: "Kuwait City Return Center",
    address1: "Shuwaikh Industrial Area, Block 1",
    postalCode: "70001",
    phone: "+96522345678",
    email: "returns-kuwait@example.com",
    isDefault: true,
    locale: "ar-KW",
  },
  {
    id: "rc-bh-manama",
    shop: "",
    country: "BH",
    city: "Manama",
    name: "Manama Return Center",
    address1: "Bahrain Logistics Zone, Hidd",
    postalCode: "10001",
    phone: "+97312345678",
    email: "returns-manama@example.com",
    isDefault: true,
    locale: "ar-BH",
  },
];

/**
 * Get the default return address for a given shop and country.
 * Falls back to the default center for the country if no shop-specific address exists.
 */
export function getReturnAddress(shop: string, country: string): ReturnAddress | null {
  const upperCountry = country.toUpperCase();

  // Look for a shop-specific address first
  const shopAddress = MENA_RETURN_CENTERS.find(
    (addr) => addr.shop === shop && addr.country === upperCountry && addr.isDefault,
  );
  if (shopAddress) return shopAddress;

  // Fall back to default center for the country
  const defaultAddress = MENA_RETURN_CENTERS.find(
    (addr) => addr.country === upperCountry && addr.isDefault,
  );
  return defaultAddress ?? null;
}

/**
 * Get localized return instructions for a country.
 */
export function getReturnInstructions(country: string, locale: string): string {
  const isArabic = locale.startsWith("ar");
  const upperCountry = country.toUpperCase();

  const instructionsEn: Record<string, string> = {
    SA: "To return your order, please pack the items in their original packaging and drop off at the nearest SMSA or Aramex collection point. Returns are accepted within 14 days of delivery. A prepaid return label is included below.",
    AE: "To return your order, please pack the items securely and schedule a pickup through our returns portal or drop off at any Aramex or Fetchr location. Returns are accepted within 14 days of delivery.",
    KW: "To return your order, please repack the items and visit the nearest return center or contact our customer service to arrange a pickup. Returns are accepted within 10 days of delivery.",
    BH: "To return your order, please pack the items in their original packaging and drop off at the Manama return center. Returns are accepted within 14 days of delivery.",
  };

  const instructionsAr: Record<string, string> = {
    SA: "\u0644\u0625\u0631\u062c\u0627\u0639 \u0637\u0644\u0628\u0643\u060c \u064a\u0631\u062c\u0649 \u062a\u063a\u0644\u064a\u0641 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0641\u064a \u0639\u0628\u0648\u0627\u062a\u0647\u0627 \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0648\u062a\u0633\u0644\u064a\u0645\u0647\u0627 \u0625\u0644\u0649 \u0623\u0642\u0631\u0628 \u0646\u0642\u0637\u0629 \u062a\u062c\u0645\u064a\u0639 SMSA \u0623\u0648 \u0623\u0631\u0627\u0645\u0643\u0633. \u064a\u062a\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u062e\u0644\u0627\u0644 14 \u064a\u0648\u0645\u0627\u064b \u0645\u0646 \u0627\u0644\u062a\u0633\u0644\u064a\u0645. \u0645\u0644\u0635\u0642 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u0627\u0644\u0645\u062f\u0641\u0648\u0639 \u0645\u0633\u0628\u0642\u0627\u064b \u0645\u0631\u0641\u0642 \u0623\u062f\u0646\u0627\u0647.",
    AE: "\u0644\u0625\u0631\u062c\u0627\u0639 \u0637\u0644\u0628\u0643\u060c \u064a\u0631\u062c\u0649 \u062a\u063a\u0644\u064a\u0641 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0628\u0634\u0643\u0644 \u0622\u0645\u0646 \u0648\u062c\u062f\u0648\u0644\u0629 \u0627\u0633\u062a\u0644\u0627\u0645 \u0639\u0628\u0631 \u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u0623\u0648 \u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u0641\u064a \u0623\u064a \u0645\u0648\u0642\u0639 \u0623\u0631\u0627\u0645\u0643\u0633 \u0623\u0648 Fetchr. \u064a\u062a\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u062e\u0644\u0627\u0644 14 \u064a\u0648\u0645\u0627\u064b \u0645\u0646 \u0627\u0644\u062a\u0633\u0644\u064a\u0645.",
    KW: "\u0644\u0625\u0631\u062c\u0627\u0639 \u0637\u0644\u0628\u0643\u060c \u064a\u0631\u062c\u0649 \u0625\u0639\u0627\u062f\u0629 \u062a\u063a\u0644\u064a\u0641 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0648\u0632\u064a\u0627\u0631\u0629 \u0623\u0642\u0631\u0628 \u0645\u0631\u0643\u0632 \u0625\u0631\u062c\u0627\u0639 \u0623\u0648 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u062e\u062f\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u062a\u0631\u062a\u064a\u0628 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645. \u064a\u062a\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u062e\u0644\u0627\u0644 10 \u0623\u064a\u0627\u0645 \u0645\u0646 \u0627\u0644\u062a\u0633\u0644\u064a\u0645.",
    BH: "\u0644\u0625\u0631\u062c\u0627\u0639 \u0637\u0644\u0628\u0643\u060c \u064a\u0631\u062c\u0649 \u062a\u063a\u0644\u064a\u0641 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0641\u064a \u0639\u0628\u0648\u0627\u062a\u0647\u0627 \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0648\u062a\u0633\u0644\u064a\u0645\u0647\u0627 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u0641\u064a \u0627\u0644\u0645\u0646\u0627\u0645\u0629. \u064a\u062a\u0645 \u0642\u0628\u0648\u0644 \u0627\u0644\u0625\u0631\u062c\u0627\u0639 \u062e\u0644\u0627\u0644 14 \u064a\u0648\u0645\u0627\u064b \u0645\u0646 \u0627\u0644\u062a\u0633\u0644\u064a\u0645.",
  };

  const map = isArabic ? instructionsAr : instructionsEn;
  const fallback = isArabic
    ? "\u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u062e\u062f\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u0625\u0631\u062c\u0627\u0639."
    : "Please contact customer service for return instructions.";

  return map[upperCountry] ?? fallback;
}

/**
 * Generate a printable return label as HTML with a tracking number.
 */
export function generateReturnLabel(
  address: ReturnAddress,
  orderId: string,
): { labelHtml: string; trackingNumber: string } {
  const trackingNumber = `RTN-${address.country}-${orderId}-${Date.now().toString(36).toUpperCase()}`;

  const labelHtml = `<!DOCTYPE html>
<html dir="auto">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .label { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
    .label-header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
    .label-header h2 { margin: 0; font-size: 18px; }
    .tracking { font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; margin: 10px 0; }
    .address-block { margin: 10px 0; }
    .address-block .label-title { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #666; }
    .address-block p { margin: 2px 0; font-size: 14px; }
    .barcode { text-align: center; font-family: monospace; font-size: 24px; letter-spacing: 4px; margin: 15px 0; }
    .order-ref { text-align: center; font-size: 12px; color: #666; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="label">
    <div class="label-header">
      <h2>RETURN LABEL</h2>
    </div>
    <div class="tracking">${trackingNumber}</div>
    <div class="barcode">||||||||||||||||||||</div>
    <div class="address-block">
      <div class="label-title">Ship To:</div>
      <p><strong>${address.name}</strong></p>
      <p>${address.address1}</p>
      ${address.address2 ? `<p>${address.address2}</p>` : ""}
      <p>${address.city}, ${address.country} ${address.postalCode}</p>
      <p>Tel: ${address.phone}</p>
    </div>
    <div class="order-ref">Order Reference: ${orderId}</div>
  </div>
</body>
</html>`;

  return { labelHtml, trackingNumber };
}

/** Shipping rate estimates between MENA countries (per kg, in USD) */
const SHIPPING_RATES: Record<string, Record<string, { ratePerKg: number; baseDays: number }>> = {
  SA: {
    SA: { ratePerKg: 3, baseDays: 3 },
    AE: { ratePerKg: 8, baseDays: 5 },
    KW: { ratePerKg: 10, baseDays: 5 },
    BH: { ratePerKg: 9, baseDays: 5 },
    QA: { ratePerKg: 9, baseDays: 5 },
    OM: { ratePerKg: 10, baseDays: 6 },
    EG: { ratePerKg: 15, baseDays: 7 },
  },
  AE: {
    AE: { ratePerKg: 3, baseDays: 3 },
    SA: { ratePerKg: 8, baseDays: 5 },
    KW: { ratePerKg: 10, baseDays: 6 },
    BH: { ratePerKg: 9, baseDays: 5 },
    QA: { ratePerKg: 8, baseDays: 4 },
    OM: { ratePerKg: 7, baseDays: 4 },
    EG: { ratePerKg: 14, baseDays: 7 },
  },
  KW: {
    KW: { ratePerKg: 3, baseDays: 2 },
    SA: { ratePerKg: 10, baseDays: 5 },
    AE: { ratePerKg: 10, baseDays: 6 },
    BH: { ratePerKg: 8, baseDays: 4 },
    QA: { ratePerKg: 9, baseDays: 5 },
    OM: { ratePerKg: 12, baseDays: 6 },
    EG: { ratePerKg: 16, baseDays: 8 },
  },
  BH: {
    BH: { ratePerKg: 3, baseDays: 2 },
    SA: { ratePerKg: 9, baseDays: 5 },
    AE: { ratePerKg: 9, baseDays: 5 },
    KW: { ratePerKg: 8, baseDays: 4 },
    QA: { ratePerKg: 8, baseDays: 4 },
    OM: { ratePerKg: 11, baseDays: 6 },
    EG: { ratePerKg: 15, baseDays: 7 },
  },
};

/**
 * Estimate return shipping cost and transit time between MENA countries.
 */
export function estimateReturnShipping(
  fromCountry: string,
  toCountry: string,
  weight: number,
): { cost: number; currency: string; estimatedDays: number } {
  const from = fromCountry.toUpperCase();
  const to = toCountry.toUpperCase();

  const rate = SHIPPING_RATES[from]?.[to] ?? SHIPPING_RATES[to]?.[from];

  if (!rate) {
    // Default fallback for unsupported routes
    return {
      cost: Math.round(weight * 15 * 100) / 100,
      currency: "USD",
      estimatedDays: 10,
    };
  }

  const cost = Math.round(weight * rate.ratePerKg * 100) / 100;

  return {
    cost,
    currency: "USD",
    estimatedDays: rate.baseDays,
  };
}
