/**
 * Subscription Integration Service
 * T0206 - Recharge Subscriptions Translation
 * T0207 - Bold Subscriptions Translation
 */

export interface SubscriptionContent {
  id: string;
  platform: 'recharge' | 'bold';
  name: string;
  description: string;
  frequency: string;
  locale: string;
}

export interface TranslatedSubscription extends SubscriptionContent {
  translatedName: string;
  translatedDescription: string;
  translatedFrequency: string;
}

export const FREQUENCY_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' },
  ar: { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', yearly: 'سنوي' },
  he: { daily: 'יומי', weekly: 'שבועי', monthly: 'חודשי', yearly: 'שנתי' },
};

export function getFrequencyTranslation(frequency: string, locale: string): string {
  const translations = FREQUENCY_TRANSLATIONS[locale] ?? FREQUENCY_TRANSLATIONS.en;
  return translations[frequency.toLowerCase()] ?? frequency;
}

export function getSubscriptionTranslatableFields(): string[] {
  return ['name', 'description', 'frequency', 'benefits', 'cancellation_policy'];
}

export function getRechargeFields(): string[] {
  return [...getSubscriptionTranslatableFields(), 'subscription_widget_title', 'delivery_schedule'];
}

export function getBoldFields(): string[] {
  return [...getSubscriptionTranslatableFields(), 'group_name', 'discount_text'];
}

export function validateSubscriptionContent(content: SubscriptionContent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!content.name) errors.push('Subscription name is required');
  if (!content.description) errors.push('Subscription description is required');
  if (!content.frequency) errors.push('Frequency is required');
  if (!['recharge', 'bold'].includes(content.platform)) errors.push('Platform must be recharge or bold');
  return { valid: errors.length === 0, errors };
}
