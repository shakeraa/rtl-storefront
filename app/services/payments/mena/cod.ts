/**
 * T0291 - Cash on Delivery
 * COD payment method support for MENA markets with configurable surcharges.
 */

export interface CODConfig {
  enabled: boolean;
  maxAmount: number;
  currency: string;
  countries: string[];
  surcharge?: number;
  surchargeType?: "fixed" | "percent";
}

/**
 * Check whether COD is available for a given order.
 */
export function isCODAvailable(
  config: CODConfig,
  country: string,
  amount: number,
  currency: string,
): boolean {
  if (!config.enabled) return false;
  if (currency !== config.currency) return false;
  if (amount > config.maxAmount) return false;
  if (!config.countries.includes(country.toUpperCase())) return false;
  return true;
}

/**
 * Calculate the COD surcharge for a given order amount.
 */
export function calculateCODSurcharge(
  config: CODConfig,
  amount: number,
): { surcharge: number; total: number } {
  if (!config.surcharge || config.surcharge <= 0) {
    return { surcharge: 0, total: amount };
  }

  let surcharge: number;
  if (config.surchargeType === "percent") {
    surcharge = Math.round(amount * (config.surcharge / 100) * 100) / 100;
  } else {
    surcharge = config.surcharge;
  }

  return {
    surcharge,
    total: Math.round((amount + surcharge) * 100) / 100,
  };
}

/**
 * Get the localized label for Cash on Delivery.
 */
export function getCODLabel(locale: string): string {
  if (locale.startsWith("ar")) {
    return "\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645";
  }
  return "Cash on Delivery";
}

/**
 * Get the localized COD terms and conditions.
 */
export function getCODTerms(locale: string): string {
  if (locale.startsWith("ar")) {
    return [
      "\u0634\u0631\u0648\u0637 \u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645:",
      "\u2022 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0643\u0648\u0646 \u0627\u0644\u0645\u0628\u0644\u063a \u0627\u0644\u0643\u0627\u0645\u0644 \u062c\u0627\u0647\u0632\u0627\u064b \u0639\u0646\u062f \u0627\u0644\u062a\u0633\u0644\u064a\u0645.",
      "\u2022 \u064a\u0642\u0628\u0644 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0646\u0642\u062f\u064a \u0641\u0642\u0637.",
      "\u2022 \u064a\u0631\u062c\u0649 \u0641\u062d\u0635 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0642\u0628\u0644 \u0627\u0644\u062f\u0641\u0639.",
      "\u2022 \u0644\u0627 \u064a\u0645\u0643\u0646 \u0625\u0631\u062c\u0627\u0639 \u0627\u0644\u0645\u0628\u0627\u0644\u063a \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0629 \u0646\u0642\u062f\u0627\u064b \u0625\u0644\u0627 \u0639\u0628\u0631 \u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a.",
    ].join("\n");
  }

  return [
    "Cash on Delivery Terms:",
    "\u2022 Full payment must be ready at the time of delivery.",
    "\u2022 Cash payments only are accepted.",
    "\u2022 Please inspect your items before making payment.",
    "\u2022 COD refunds will be processed via bank transfer only.",
  ].join("\n");
}

/**
 * Get a sensible default COD configuration for MENA markets.
 * Max 5000 SAR, enabled for SA, AE, and KW with no surcharge.
 */
export function getDefaultCODConfig(): CODConfig {
  return {
    enabled: true,
    maxAmount: 5000,
    currency: "SAR",
    countries: ["SA", "AE", "KW"],
    surcharge: 0,
    surchargeType: "fixed",
  };
}
