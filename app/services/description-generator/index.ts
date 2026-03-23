/**
 * AI Product Description Generator Service (T0386)
 * Generates localized product descriptions natively in Arabic/Hebrew.
 */

export type Tone = 'professional' | 'casual' | 'luxury' | 'playful';
export type Vertical = 'fashion' | 'electronics' | 'beauty' | 'food' | 'home_goods' | 'general';

export interface GenerationInput {
  title: string;
  category: string;
  attributes: Record<string, string>;
  targetLocale: string;
  dialect?: string;
  tone: Tone;
  vertical: Vertical;
  keywords?: string[];
}

export interface GeneratedDescription {
  shortDescription: string;     // 50-80 words
  longDescription: string;      // 150-300 words
  metaTitle: string;            // SEO meta title
  metaDescription: string;      // SEO meta description
  socialCaption: string;        // Instagram/TikTok ready
  confidenceScore: number;      // 0-1
  needsReview: boolean;
  locale: string;
  generatedAt: string;
}

export interface GenerationConfig {
  maxShortWords: number;
  maxLongWords: number;
  metaTitleMaxChars: number;
  metaDescriptionMaxChars: number;
  confidenceThreshold: number;  // below this -> needsReview=true
}

// Default configs
export const DEFAULT_CONFIG: GenerationConfig = {
  maxShortWords: 80,
  maxLongWords: 300,
  metaTitleMaxChars: 60,
  metaDescriptionMaxChars: 160,
  confidenceThreshold: 0.7,
};

// Tone descriptors for prompt building
export const TONE_DESCRIPTORS: Record<Tone, Record<string, string>> = {
  professional: { en: 'Professional and authoritative', ar: 'احترافي وموثوق', he: 'מקצועי וסמכותי' },
  casual: { en: 'Friendly and conversational', ar: 'ودي ومحادثاتي', he: 'ידידותי ושיחתי' },
  luxury: { en: 'Elegant and sophisticated', ar: 'أنيق وراقي', he: 'אלגנטי ומתוחכם' },
  playful: { en: 'Fun and energetic', ar: 'ممتع ونشيط', he: 'כיפי ואנרגטי' },
};

// Vertical-specific vocabulary hints
export const VERTICAL_VOCABULARY: Record<Vertical, { en: string[]; ar: string[]; he: string[] }> = {
  fashion: { en: ['stylish', 'trend', 'collection'], ar: ['أنيق', 'موضة', 'تشكيلة'], he: ['אופנתי', 'טרנד', 'קולקציה'] },
  electronics: { en: ['innovative', 'performance', 'technology'], ar: ['مبتكر', 'أداء', 'تقنية'], he: ['חדשני', 'ביצועים', 'טכנולוגיה'] },
  beauty: { en: ['radiant', 'nourishing', 'luxurious'], ar: ['مشرق', 'مغذي', 'فاخر'], he: ['זוהר', 'מזין', 'יוקרתי'] },
  food: { en: ['fresh', 'authentic', 'delicious'], ar: ['طازج', 'أصيل', 'لذيذ'], he: ['טרי', 'אותנטי', 'טעים'] },
  home_goods: { en: ['comfortable', 'premium', 'handcrafted'], ar: ['مريح', 'فاخر', 'مصنوع يدوياً'], he: ['נוח', 'פרימיום', 'עבודת יד'] },
  general: { en: ['quality', 'value', 'reliable'], ar: ['جودة', 'قيمة', 'موثوق'], he: ['איכות', 'ערך', 'אמין'] },
};

export function buildPrompt(input: GenerationInput): string {
  const toneDesc = TONE_DESCRIPTORS[input.tone]?.[input.targetLocale] ?? TONE_DESCRIPTORS[input.tone]?.en ?? '';
  const vocabHints = VERTICAL_VOCABULARY[input.vertical]?.[input.targetLocale] ?? VERTICAL_VOCABULARY[input.vertical]?.en ?? [];
  const attrs = Object.entries(input.attributes).map(([k, v]) => `${k}: ${v}`).join(', ');
  const keywords = input.keywords?.length ? `Target keywords: ${input.keywords.join(', ')}` : '';

  return [
    `Generate a product description in ${input.targetLocale} for: "${input.title}"`,
    `Category: ${input.category}`,
    attrs ? `Attributes: ${attrs}` : '',
    `Tone: ${toneDesc}`,
    `Vertical vocabulary hints: ${vocabHints.join(', ')}`,
    keywords,
    input.dialect ? `Dialect: ${input.dialect}` : '',
  ].filter(Boolean).join('\n');
}

export function validateInput(input: GenerationInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.title?.trim()) errors.push('Product title is required');
  if (!input.category?.trim()) errors.push('Category is required');
  if (!input.targetLocale?.trim()) errors.push('Target locale is required');
  if (!['professional', 'casual', 'luxury', 'playful'].includes(input.tone)) errors.push('Invalid tone');
  if (!['fashion', 'electronics', 'beauty', 'food', 'home_goods', 'general'].includes(input.vertical)) errors.push('Invalid vertical');
  return { valid: errors.length === 0, errors };
}

export function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function checkConfidence(description: GeneratedDescription, config: GenerationConfig = DEFAULT_CONFIG): boolean {
  return description.confidenceScore >= config.confidenceThreshold;
}

export function needsHumanReview(description: GeneratedDescription, config: GenerationConfig = DEFAULT_CONFIG): boolean {
  if (description.confidenceScore < config.confidenceThreshold) return true;
  if (estimateWordCount(description.shortDescription) > config.maxShortWords * 1.2) return true;
  if (description.metaTitle.length > config.metaTitleMaxChars) return true;
  return false;
}

export function getToneDescriptor(tone: Tone, locale: string): string {
  return TONE_DESCRIPTORS[tone]?.[locale] ?? TONE_DESCRIPTORS[tone]?.en ?? tone;
}

export function getVerticalVocabulary(vertical: Vertical, locale: string): string[] {
  return VERTICAL_VOCABULARY[vertical]?.[locale] ?? VERTICAL_VOCABULARY[vertical]?.en ?? [];
}

export function getAvailableTones(): Tone[] {
  return ['professional', 'casual', 'luxury', 'playful'];
}

export function getAvailableVerticals(): Vertical[] {
  return ['fashion', 'electronics', 'beauty', 'food', 'home_goods', 'general'];
}
