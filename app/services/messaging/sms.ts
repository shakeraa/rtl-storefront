/**
 * T0288 - SMS Notifications Arabic
 * SMS messaging service with MENA phone number support and bilingual templates.
 */

export interface SMSConfig {
  provider: "twilio" | "unifonic" | "taqnyat";
  apiKey: string;
  senderId: string;
  defaultLocale: string;
}

export interface SMSTemplate {
  id: string;
  nameEn: string;
  nameAr: string;
  bodyEn: string;
  bodyAr: string;
  variables: string[];
}

/** MENA country phone metadata */
const MENA_PHONE_MAP: Record<string, { code: string; lengths: number[] }> = {
  SA: { code: "+966", lengths: [9] },
  AE: { code: "+971", lengths: [9] },
  KW: { code: "+965", lengths: [8] },
  BH: { code: "+973", lengths: [8] },
  QA: { code: "+974", lengths: [8] },
  OM: { code: "+968", lengths: [8] },
  EG: { code: "+20", lengths: [10, 11] },
};

const COUNTRY_CODE_REGEX: Record<string, RegExp> = {
  "+966": /^\+966/,
  "+971": /^\+971/,
  "+965": /^\+965/,
  "+973": /^\+973/,
  "+974": /^\+974/,
  "+968": /^\+968/,
  "+20": /^\+20/,
};

export const ORDER_SMS_TEMPLATES: SMSTemplate[] = [
  {
    id: "order_confirmation",
    nameEn: "Order Confirmation",
    nameAr: "\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628",
    bodyEn:
      "Your order {{orderNumber}} has been confirmed! Total: {{total}}. Thank you for shopping with {{shopName}}.",
    bodyAr:
      "\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0637\u0644\u0628\u0643 \u0631\u0642\u0645 {{orderNumber}}! \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a: {{total}}. \u0634\u0643\u0631\u0627\u064b \u0644\u062a\u0633\u0648\u0642\u0643 \u0645\u0639 {{shopName}}.",
    variables: ["orderNumber", "total", "shopName"],
  },
  {
    id: "shipping_update",
    nameEn: "Shipping Update",
    nameAr: "\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0634\u062d\u0646",
    bodyEn:
      "Your order {{orderNumber}} has been shipped! Tracking: {{trackingNumber}}. Estimated delivery: {{estimatedDate}}.",
    bodyAr:
      "\u062a\u0645 \u0634\u062d\u0646 \u0637\u0644\u0628\u0643 \u0631\u0642\u0645 {{orderNumber}}! \u0631\u0642\u0645 \u0627\u0644\u062a\u062a\u0628\u0639: {{trackingNumber}}. \u0645\u0648\u0639\u062f \u0627\u0644\u062a\u0633\u0644\u064a\u0645 \u0627\u0644\u0645\u062a\u0648\u0642\u0639: {{estimatedDate}}.",
    variables: ["orderNumber", "trackingNumber", "estimatedDate"],
  },
  {
    id: "delivery_complete",
    nameEn: "Delivery Complete",
    nameAr: "\u0627\u0643\u062a\u0645\u0627\u0644 \u0627\u0644\u062a\u0648\u0635\u064a\u0644",
    bodyEn:
      "Your order {{orderNumber}} has been delivered! We hope you enjoy your purchase from {{shopName}}.",
    bodyAr:
      "\u062a\u0645 \u062a\u0648\u0635\u064a\u0644 \u0637\u0644\u0628\u0643 \u0631\u0642\u0645 {{orderNumber}}! \u0646\u062a\u0645\u0646\u0649 \u0623\u0646 \u062a\u0633\u062a\u0645\u062a\u0639 \u0628\u0645\u0634\u062a\u0631\u064a\u0627\u062a\u0643 \u0645\u0646 {{shopName}}.",
    variables: ["orderNumber", "shopName"],
  },
  {
    id: "return_initiated",
    nameEn: "Return Initiated",
    nameAr: "\u0628\u062f\u0621 \u0627\u0644\u0625\u0631\u062c\u0627\u0639",
    bodyEn:
      "Your return for order {{orderNumber}} has been initiated. Return ID: {{returnId}}. We'll notify you once it's processed.",
    bodyAr:
      "\u062a\u0645 \u0628\u062f\u0621 \u0625\u0631\u062c\u0627\u0639 \u0627\u0644\u0637\u0644\u0628 \u0631\u0642\u0645 {{orderNumber}}. \u0631\u0642\u0645 \u0627\u0644\u0625\u0631\u062c\u0627\u0639: {{returnId}}. \u0633\u0646\u0639\u0644\u0645\u0643 \u0628\u0645\u062c\u0631\u062f \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629.",
    variables: ["orderNumber", "returnId"],
  },
];

/**
 * Build an SMS message from a template, substituting variables and selecting locale.
 */
export function buildSMS(
  template: SMSTemplate,
  variables: Record<string, string>,
  locale: string,
): { to: string; body: string; senderId: string } {
  const isArabic = locale.startsWith("ar");
  let body = isArabic ? template.bodyAr : template.bodyEn;

  for (const key of template.variables) {
    const value = variables[key] ?? "";
    body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }

  return {
    to: variables.phone ?? "",
    body,
    senderId: variables.senderId ?? "",
  };
}

/**
 * Normalize a phone number to international MENA format.
 * Strips leading zeros and prepends the appropriate country dialing code.
 */
export function formatPhoneForMENA(phone: string, countryCode: string): string {
  const country = MENA_PHONE_MAP[countryCode.toUpperCase()];
  if (!country) {
    return phone;
  }

  // Strip all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // If already in international format with the correct prefix, return as-is
  if (cleaned.startsWith(country.code)) {
    return cleaned;
  }

  // Strip leading + if present (wrong country code)
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // Strip leading 00 (international dialing prefix)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  // Strip the country code digits if they appear at the start without +
  const codeDigits = country.code.slice(1); // e.g. "966"
  if (cleaned.startsWith(codeDigits)) {
    cleaned = cleaned.slice(codeDigits.length);
  }

  // Strip leading zero (local format)
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  return `${country.code}${cleaned}`;
}

/**
 * Validate whether a phone number belongs to a supported MENA country.
 * Returns validity and detected country code.
 */
export function validateMENAPhone(phone: string): { valid: boolean; country?: string } {
  const cleaned = phone.replace(/[^\d+]/g, "");

  for (const [countryCode, meta] of Object.entries(MENA_PHONE_MAP)) {
    const regex = COUNTRY_CODE_REGEX[meta.code];
    if (regex && regex.test(cleaned)) {
      const localPart = cleaned.slice(meta.code.length);
      if (meta.lengths.includes(localPart.length)) {
        return { valid: true, country: countryCode };
      }
    }
  }

  return { valid: false };
}
