import { getTextDirection } from "../../utils/rtl";
import { getAccountLabels, getOrderStatusLabel as getStatusLabel } from "./labels";
import type {
  AccountLabels,
  AccountTranslationConfig,
  TranslatedAccountPage,
} from "./types";

/**
 * Translates customer account page labels for the target locale.
 * Optionally merges custom label overrides on top of the defaults.
 */
export function translateAccountPage(
  config: AccountTranslationConfig,
  customLabels?: Partial<Record<keyof AccountLabels, Partial<Record<string, string>>>>,
): TranslatedAccountPage {
  const labels = getAccountLabels(config.targetLocale);
  const direction = getTextDirection(config.targetLocale);

  // Apply custom label overrides if provided
  const mergedLabels = customLabels
    ? mergeAccountLabels(labels, customLabels)
    : labels;

  return {
    labels: mergedLabels,
    direction,
    locale: config.targetLocale,
  };
}

/**
 * Translates a single order status string for the given locale.
 */
export function translateOrderStatus(status: string, locale: string): string {
  return getStatusLabel(locale, status);
}

/**
 * Deep-merges custom label overrides into the default AccountLabels.
 * Only keys that exist in the defaults are applied.
 */
function mergeAccountLabels(
  defaults: AccountLabels,
  overrides: Partial<Record<keyof AccountLabels, Partial<Record<string, string>>>>,
): AccountLabels {
  const result = { ...defaults };

  for (const section of Object.keys(overrides) as Array<keyof AccountLabels>) {
    if (section in defaults && overrides[section]) {
      const sectionDefaults = defaults[section];
      const sectionOverrides = overrides[section]!;
      const merged = { ...sectionDefaults } as Record<string, string>;

      for (const key of Object.keys(sectionDefaults)) {
        if (key in sectionOverrides && sectionOverrides[key]) {
          merged[key] = sectionOverrides[key];
        }
      }

      (result as Record<string, unknown>)[section] = merged;
    }
  }

  return result;
}
