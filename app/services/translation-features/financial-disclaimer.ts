/**
 * Financial Disclaimer Service
 * Provides financial disclaimers, investment risk warnings, and regulatory notices
 * Supports Arabic (ar), Hebrew (he), and English (en) locales
 */

/**
 * Supported locales for financial disclaimers
 */
export type SupportedLocale = 'ar' | 'he' | 'en';

/**
 * Types of financial disclaimers
 */
export type DisclaimerType =
  | 'general'
  | 'investment'
  | 'trading'
  | 'crypto'
  | 'forex'
  | 'securities'
  | 'advisory'
  | 'past-performance'
  | 'tax'
  | 'not-advice';

/**
 * Risk levels for investment warnings
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

/**
 * Financial claim types for content validation
 */
export type ClaimType =
  | 'guaranteed-returns'
  | 'risk-free'
  | 'get-rich-quick'
  | 'expert-recommendation'
  | 'future-performance'
  | 'insider-info'
  | 'unregistered-security';

/**
 * General financial disclaimer templates
 */
export const GENERAL_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'المحتوى المقدم لأغراض إعلامية فقط ولا يشكل نصيحة مالية. يجب استشارة مستشار مالي مرخص قبل اتخاذ أي قرار استثماري.',
  he: 'התוכן מסופק למטרות מידע בלבד ואינו מהווה ייעוץ פיננסי. יש להתייעץ עם יועץ פיננסי מורשה לפני קבלת החלטות השקעה.',
  en: 'The content provided is for informational purposes only and does not constitute financial advice. Consult a licensed financial advisor before making any investment decisions.',
};

/**
 * Investment risk disclaimers
 */
export const INVESTMENT_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'الاستثمار ينطوي على مخاطر، بما في ذلك خسارة رأس المال. الأداء السابق لا يضمن النتائج المستقبلية. قد تختلف عوائد الاستثمار.',
  he: 'השקעה כרוכה בסיכונים, לרבות אובדן הון. ביצועים קודמים אינם מבטיחים תוצאות עתידיות. תשואות השקעה עשויות להשתנות.',
  en: 'Investing involves risks, including loss of capital. Past performance does not guarantee future results. Investment returns may vary.',
};

/**
 * Trading risk disclaimers
 */
export const TRADING_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'التداول ينطوي على مخاطر كبيرة وقد لا يكون مناسباً لجميع المستثمرين. قد تخسر أكثر من استثمارك الأولي عند استخدام الرافعة المالية.',
  he: 'מסחר כרוך בסיכונים משמעותיים ואינו מתאים לכל המשקיעים. אתה עלול להפסיד יותר מההשקעה ההתחלתית שלך בעת שימוש במינוף.',
  en: 'Trading involves significant risks and may not be suitable for all investors. You may lose more than your initial investment when using leverage.',
};

/**
 * Cryptocurrency disclaimers
 */
export const CRYPTO_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'العملات الرقمية متقلبة للغاية وغير منظمة في العديد من الولايات القضائية. قد تفقد كامل استثمارك. ليست منتجات مالية تقليدية.',
  he: 'מטבעות קריפטוגרפיים הם תנודתיים מאוד ולא מוסדרים במדינות רבות. אתה עלול לאבד את כל ההשקעה שלך. אינם מוצרים פיננסיים מסורתיים.',
  en: 'Cryptocurrencies are highly volatile and unregulated in many jurisdictions. You may lose your entire investment. Not traditional financial products.',
};

/**
 * Forex trading disclaimers
 */
export const FOREX_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'تداول العملات الأجنبية يحمل مخاطر عالية. أسعار الصرف متقلبة ويمكن أن تتغير بسرعة. قد تخسر أكثر من رأس المال المستثمر.',
  he: 'מסחר במט"ח כרוך בסיכון גבוה. שערי החליפין תנודתיים ועשויים להשתנות במהירות. אתה עלול להפסיד יותר מההון שהושקע.',
  en: 'Foreign exchange trading carries high risk. Exchange rates are volatile and can change rapidly. You may lose more than invested capital.',
};

/**
 * Securities disclaimers
 */
export const SECURITIES_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'الأوراق المالية تخضع لقوانين هيئة الأوراق المالية. تأكد من فهمك للمخاطر والتنظيمات قبل الاستثمار.',
  he: 'ניירות ערך כפופים לחוקי רשות ניירות ערך. ודא שאתה מבין את הסיכונים והתקנות לפני ההשקעה.',
  en: 'Securities are subject to securities authority regulations. Ensure you understand the risks and regulations before investing.',
};

/**
 * Advisory disclaimers
 */
export const ADVISORY_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'المحتوى لا يشكل توصية شخصية. يجب مراجعة ظروفك المالية الفردية مع مستشار مؤهل.',
  he: 'התוכן אינו מהווה המלצה אישית. יש לבחון את נסיבותך הפיננסיות האישיות מול יועץ מוסמך.',
  en: 'The content does not constitute personal recommendation. Individual financial circumstances should be reviewed with a qualified advisor.',
};

/**
 * Past performance disclaimers
 */
export const PAST_PERFORMANCE_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'الأداء السابق ليس مؤشراً على النتائج المستقبلية. البيانات التاريخية لا تضمن العوائد المستقبلية.',
  he: 'ביצועים עבר אינם מצביעים על תוצאות עתידיות. נתונים היסטוריים אינם מבטיחים תשואות עתידיות.',
  en: 'Past performance is not indicative of future results. Historical data does not guarantee future returns.',
};

/**
 * Tax disclaimers
 */
export const TAX_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: 'العوائد الاستثمارية خاضعة للضرائب. استشر مستشار ضريبي للحصول على معلومات محددة حول وضعك الضريبي.',
  he: 'תשואות השקעה חייבות במס. יש להתייעץ עם יועץ מס לקבלת מידע ספציפי על מצבך המס.',
  en: 'Investment returns are subject to taxes. Consult a tax advisor for specific information about your tax situation.',
};

/**
 * Not financial advice disclaimers (prominent)
 */
export const NOT_FINANCIAL_ADVICE_DISCLAIMERS: Record<SupportedLocale, string> = {
  ar: '⚠️ تنبيه مهم: هذا المحتوى ليس نصيحة مالية أو استثمارية. نحن لسنا مستشارين ماليين مرخصين. استشر خبيراً مالياً مؤهلاً قبل اتخاذ أي قرارات مالية.',
  he: '⚠️ אזהרה חשובה: תוכן זה אינו ייעוץ פיננסי או השקעתי. איננו יועצים פיננסיים מורשים. התייעץ עם מומחה פיננסי מוסמך לפני קבלת החלטות פיננסיות.',
  en: '⚠️ Important Notice: This content is not financial or investment advice. We are not licensed financial advisors. Consult a qualified financial expert before making any financial decisions.',
};

/**
 * All disclaimers organized by type
 */
export const DISCLAIMERS_BY_TYPE: Record<DisclaimerType, Record<SupportedLocale, string>> = {
  general: GENERAL_DISCLAIMERS,
  investment: INVESTMENT_DISCLAIMERS,
  trading: TRADING_DISCLAIMERS,
  crypto: CRYPTO_DISCLAIMERS,
  forex: FOREX_DISCLAIMERS,
  securities: SECURITIES_DISCLAIMERS,
  advisory: ADVISORY_DISCLAIMERS,
  'past-performance': PAST_PERFORMANCE_DISCLAIMERS,
  tax: TAX_DISCLAIMERS,
  'not-advice': NOT_FINANCIAL_ADVICE_DISCLAIMERS,
};

/**
 * Risk warning labels by level and locale
 */
export const RISK_WARNING_LABELS: Record<RiskLevel, Record<SupportedLocale, string>> = {
  low: {
    ar: 'مخاطر منخفضة',
    he: 'סיכון נמוך',
    en: 'Low Risk',
  },
  medium: {
    ar: 'مخاطر متوسطة',
    he: 'סיכון בינוני',
    en: 'Medium Risk',
  },
  high: {
    ar: 'مخاطر عالية',
    he: 'סיכון גבוה',
    en: 'High Risk',
  },
  extreme: {
    ar: 'مخاطر شديدة',
    he: 'סיכון קיצוני',
    en: 'Extreme Risk',
  },
};

/**
 * Risk descriptions by level and locale
 */
export const RISK_DESCRIPTIONS: Record<RiskLevel, Record<SupportedLocale, string>> = {
  low: {
    ar: 'هذا الاستثمار يحمل مخاطر منخفضة نسبياً، ولكنه غير خالٍ من المخاطر.',
    he: 'השקעה זו כרוכה בסיכון נמוך יחסית, אך אינה נטולת סיכון.',
    en: 'This investment carries relatively low risk, but is not risk-free.',
  },
  medium: {
    ar: 'هذا الاستثمار يحمل مخاطر متوسطة. يمكن أن تتقلب قيمته.',
    he: 'השקעה זו כרוכה בסיכון בינוני. הערך שלה עשוי להתנדנד.',
    en: 'This investment carries medium risk. Its value may fluctuate.',
  },
  high: {
    ar: 'هذا الاستثمار يحمل مخاطر عالية. يمكن أن تخسر جزءاً كبيراً من رأس المال.',
    he: 'השקעה זו כרוכה בסיכון גבוה. אתה עלול לאבד חלק ניכר מההון.',
    en: 'This investment carries high risk. You may lose a significant portion of capital.',
  },
  extreme: {
    ar: 'هذا الاستثمار يحمل مخاطر شديدة. يمكن أن تخسر كامل رأس المال.',
    he: 'השקעה זו כרוכה בסיכון קיצוני. אתה עלול לאבד את כל ההון.',
    en: 'This investment carries extreme risk. You may lose your entire capital.',
  },
};

/**
 * Financial claims patterns by claim type for content validation
 */
export const FINANCIAL_CLAIM_PATTERNS: Record<
  ClaimType,
  { en: RegExp[]; ar: RegExp[]; he: RegExp[] }
> = {
  'guaranteed-returns': {
    en: [
      /guaranteed\s+(?:return|profit|income|returns)/i,
      /(?:\d+%|\d+\s+percent)\s+(?:guaranteed|fixed|promised)/i,
      /guaranteed\s+(?:\d+%|\d+\s+percent)/i,
      /risk[\s-]?free\s+(?:return|profit)/i,
    ],
    ar: [
      /عائد\s+مضمون/i,
      /ربح\s+مضمون/i,
      /عائد\s+ثابت/i,
      /مضمون\s+\d+%/i,
      /مضموناً/i,
    ],
    he: [
      /תשואה\s+מובטחת/i,
      /רווח\s+מובטח/i,
      /תשואה\s+קבועה/i,
      /מובטח\s+\d+%/i,
    ],
  },
  'risk-free': {
    en: [
      /risk[\s-]?free/i,
      /no\s+risk/i,
      /safe\s+investment/i,
      /can't\s+lose/i,
      /cannot\s+lose/i,
    ],
    ar: [
      /خالٍ\s+من\s+المخاطر/i,
      /بلا\s+مخاطر/i,
      /استثمار\s+آمن/i,
      /لا\s+يمكن\s+الخسارة/i,
    ],
    he: [
      /ללא\s+סיכון/i,
      /נטול\s+סיכון/i,
      /השקעה\s+בטוחה/i,
      /לא\s+ניתן\s+להפסיד/i,
    ],
  },
  'get-rich-quick': {
    en: [
      /get\s+rich\s+(?:quick|fast)/i,
      /quick\s+(?:profit|money|cash)/i,
      /fast\s+(?:profit|money|cash)/i,
      /easy\s+money/i,
      /make\s+money\s+fast/i,
    ],
    ar: [
      /الثراء\s+السريع/i,
      /غني\s+بسرعة/i,
      /ربح\s+سريع/i,
      /مال\s+سهل/i,
      /كن\s+مليونير/i,
    ],
    he: [
      /להתעשר\s+במהירות/i,
      /עשיר\s+מהר/i,
      /רווח\s+מהיר/i,
      /כסף\s+קל/i,
      /להיות\s+מיליונר/i,
    ],
  },
  'expert-recommendation': {
    en: [
      /expert\s+(?:recommendation|pick|tip)/i,
      /insider\s+(?:tip|pick)/i,
      /hot\s+(?:stock|tip)/i,
      /sure\s+(?:thing|bet)/i,
      /can't\s+miss/i,
    ],
    ar: [
      /توصية\s+الخبراء/i,
      /نصيحة\s+خاصة/i,
      /سهم\s+ساخن/i,
      /فرصة\s+مؤكدة/i,
      /لا\s+تفوت/i,
    ],
    he: [
      /המלצת\s+מומחים/i,
      /טיפ\s+בלעדי/i,
      /מניה\s+חמה/i,
      /דבר\s+בטוח/i,
      /אל\s+תפספס/i,
    ],
  },
  'future-performance': {
    en: [
      /will\s+(?:double|triple|increase)/i,
      /going\s+to\s+(?:skyrocket|moon)/i,
      /predicted\s+to\s+(?:rise|gain)/i,
      /expected\s+return\s+of/i,
    ],
    ar: [
      /سيتضاعف/i,
      /سيرتفع/i,
      /متوقع\s+أن\s+يرتفع/i,
      /عائد\s+متوقع/i,
    ],
    he: [
      /יוכפל/i,
      /יעלה/i,
      /צפוי\s+לעלות/i,
      /תשואה\s+צפויה/i,
    ],
  },
  'insider-info': {
    en: [
      /insider\s+(?:information|trading)/i,
      /confidential\s+tip/i,
      /secret\s+information/i,
      /not\s+yet\s+public/i,
    ],
    ar: [
      /معلومات\s+داخلية/i,
      /تداول\s+من\s+داخل/i,
      /معلومات\s+سرية/i,
      /غير\s+منشورة/i,
    ],
    he: [
      /מידע\s+פנימי/i,
      /מסחר\s+פנימי/i,
      /טיפ\s+סודי/i,
      /עדיין\s+לא\s+פורסם/i,
    ],
  },
  'unregistered-security': {
    en: [
      /unregistered\s+(?:security|investment)/i,
      /private\s+(?:placement|opportunity)/i,
      /exclusive\s+investment/i,
      /not\s+registered\s+with/i,
    ],
    ar: [
      /استثمار\s+غير\s+مسجل/i,
      /فرصة\s+خاصة/i,
      /استثمار\s+حصري/i,
    ],
    he: [
      /השקעה\s+לא\s+רשומה/i,
      /הזדמנות\s+פרטית/i,
      /השקעה\s+בלעדית/i,
    ],
  },
};

/**
 * Required disclaimers for specific content types
 */
export const REQUIRED_DISCLAIMERS: Record<string, DisclaimerType[]> = {
  'investment-product': ['general', 'investment', 'not-advice'],
  'trading-platform': ['general', 'trading', 'not-advice'],
  'crypto-product': ['general', 'crypto', 'not-advice'],
  'forex-service': ['general', 'forex', 'not-advice'],
  'financial-advice': ['general', 'advisory', 'not-advice'],
  'past-performance-shown': ['past-performance', 'not-advice'],
  'taxable-investment': ['general', 'tax', 'not-advice'],
};

/**
 * Get a financial disclaimer for a specific locale and type
 * @param locale - Locale code ('ar', 'he', 'en')
 * @param type - Type of disclaimer
 * @returns Localized disclaimer text
 */
export function getFinancialDisclaimer(locale: string, type: DisclaimerType): string {
  const normalizedLocale = normalizeLocale(locale);
  const disclaimerSet = DISCLAIMERS_BY_TYPE[type];

  if (!disclaimerSet) {
    return getFinancialDisclaimer(locale, 'general');
  }

  return disclaimerSet[normalizedLocale] || disclaimerSet.en;
}

/**
 * Get all disclaimers for a specific locale
 * @param locale - Locale code
 * @returns Object with all disclaimer types
 */
export function getAllDisclaimers(locale: string): Record<DisclaimerType, string> {
  const normalizedLocale = normalizeLocale(locale);

  return {
    general: DISCLAIMERS_BY_TYPE.general[normalizedLocale],
    investment: DISCLAIMERS_BY_TYPE.investment[normalizedLocale],
    trading: DISCLAIMERS_BY_TYPE.trading[normalizedLocale],
    crypto: DISCLAIMERS_BY_TYPE.crypto[normalizedLocale],
    forex: DISCLAIMERS_BY_TYPE.forex[normalizedLocale],
    securities: DISCLAIMERS_BY_TYPE.securities[normalizedLocale],
    advisory: DISCLAIMERS_BY_TYPE.advisory[normalizedLocale],
    'past-performance': DISCLAIMERS_BY_TYPE['past-performance'][normalizedLocale],
    tax: DISCLAIMERS_BY_TYPE.tax[normalizedLocale],
    'not-advice': DISCLAIMERS_BY_TYPE['not-advice'][normalizedLocale],
  };
}

/**
 * Get risk warning labels for a specific locale
 * @param locale - Locale code
 * @returns Object with risk levels and labels
 */
export function getRiskWarningLabels(locale: string): {
  labels: Record<RiskLevel, string>;
  descriptions: Record<RiskLevel, string>;
} {
  const normalizedLocale = normalizeLocale(locale);

  return {
    labels: {
      low: RISK_WARNING_LABELS.low[normalizedLocale],
      medium: RISK_WARNING_LABELS.medium[normalizedLocale],
      high: RISK_WARNING_LABELS.high[normalizedLocale],
      extreme: RISK_WARNING_LABELS.extreme[normalizedLocale],
    },
    descriptions: {
      low: RISK_DESCRIPTIONS.low[normalizedLocale],
      medium: RISK_DESCRIPTIONS.medium[normalizedLocale],
      high: RISK_DESCRIPTIONS.high[normalizedLocale],
      extreme: RISK_DESCRIPTIONS.extreme[normalizedLocale],
    },
  };
}

/**
 * Get risk warning for a specific level and locale
 * @param level - Risk level
 * @param locale - Locale code
 * @returns Risk warning label and description
 */
export function getRiskWarning(
  level: RiskLevel,
  locale: string
): { label: string; description: string } {
  const normalizedLocale = normalizeLocale(locale);

  return {
    label: RISK_WARNING_LABELS[level][normalizedLocale],
    description: RISK_DESCRIPTIONS[level][normalizedLocale],
  };
}

/**
 * Check financial content for prohibited claims
 * @param content - Content to validate
 * @param locale - Locale code for language-specific patterns
 * @returns Validation result with findings
 */
export function checkFinancialClaims(
  content: string,
  locale: string
): {
  isValid: boolean;
  violations: Array<{
    type: ClaimType;
    matches: string[];
    severity: 'warning' | 'critical';
  }>;
  recommendations: string[];
} {
  const normalizedLocale = normalizeLocale(locale);
  const violations: Array<{
    type: ClaimType;
    matches: string[];
    severity: 'warning' | 'critical';
  }> = [];

  // Check each claim type
  for (const [claimType, patterns] of Object.entries(FINANCIAL_CLAIM_PATTERNS)) {
    const localePatterns = patterns[normalizedLocale as SupportedLocale] || patterns.en;
    const matches: string[] = [];

    for (const pattern of localePatterns) {
      const found = content.match(pattern);
      if (found) {
        matches.push(found[0]);
      }
    }

    if (matches.length > 0) {
      const severity =
        claimType === 'guaranteed-returns' || claimType === 'insider-info' ? 'critical' : 'warning';
      violations.push({
        type: claimType as ClaimType,
        matches: [...new Set(matches)], // Remove duplicates
        severity,
      });
    }
  }

  // Generate recommendations
  const recommendations = generateRecommendations(violations, normalizedLocale);

  return {
    isValid: violations.length === 0,
    violations,
    recommendations,
  };
}

/**
 * Validate financial content comprehensively
 * @param content - Content to validate
 * @param locale - Locale code
 * @returns Validation result
 */
export function validateFinancialContent(
  content: string,
  locale: string
): {
  isValid: boolean;
  hasRequiredDisclaimers: boolean;
  missingDisclaimers: DisclaimerType[];
  claimViolations: ReturnType<typeof checkFinancialClaims>['violations'];
  suggestions: string[];
} {
  const normalizedLocale = normalizeLocale(locale);

  // Check for financial claims
  const claimCheck = checkFinancialClaims(content, locale);

  // Detect content type based on keywords
  const contentType = detectContentType(content);

  // Check for required disclaimers
  const requiredDisclaimers = contentType ? REQUIRED_DISCLAIMERS[contentType] || [] : [];
  const missingDisclaimers: DisclaimerType[] = [];

  for (const disclaimerType of requiredDisclaimers) {
    const disclaimerText = getFinancialDisclaimer(normalizedLocale, disclaimerType);
    // Simple check if disclaimer keywords are present
    if (!containsDisclaimerKeywords(content, disclaimerType, normalizedLocale)) {
      missingDisclaimers.push(disclaimerType);
    }
  }

  // Generate suggestions
  const suggestions: string[] = [];
  if (missingDisclaimers.length > 0) {
    suggestions.push(
      getSuggestionText('missing-disclaimers', normalizedLocale, missingDisclaimers)
    );
  }
  if (claimCheck.violations.length > 0) {
    suggestions.push(getSuggestionText('review-claims', normalizedLocale));
  }

  return {
    isValid: claimCheck.isValid && missingDisclaimers.length === 0,
    hasRequiredDisclaimers: missingDisclaimers.length === 0,
    missingDisclaimers,
    claimViolations: claimCheck.violations,
    suggestions,
  };
}

/**
 * Get disclaimer text for display with optional formatting
 * @param locale - Locale code
 * @param types - Types of disclaimers to include
 * @param options - Formatting options
 * @returns Formatted disclaimer text
 */
export function getFormattedDisclaimer(
  locale: string,
  types: DisclaimerType[],
  options: {
    separator?: string;
    prefix?: string;
    suffix?: string;
    includeHeader?: boolean;
  } = {}
): string {
  const normalizedLocale = normalizeLocale(locale);
  const {
    separator = '\n\n',
    prefix = '',
    suffix = '',
    includeHeader = false,
  } = options;

  const headerText = includeHeader
    ? getHeaderText(normalizedLocale) + separator
    : '';

  const disclaimers = types.map((type) => getFinancialDisclaimer(normalizedLocale, type));

  return prefix + headerText + disclaimers.join(separator) + suffix;
}

/**
 * Check if a locale is RTL (Right-to-Left)
 * @param locale - Locale code
 * @returns true if RTL locale
 */
export function isRTLLocale(locale: string): boolean {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const baseLocale = locale.toLowerCase().split('-')[0];
  return rtlLocales.includes(baseLocale);
}

/**
 * Get supported locales
 * @returns Array of supported locale codes
 */
export function getSupportedLocales(): SupportedLocale[] {
  return ['ar', 'he', 'en'];
}

/**
 * Get disclaimer types
 * @returns Array of available disclaimer types
 */
export function getDisclaimerTypes(): DisclaimerType[] {
  return [
    'general',
    'investment',
    'trading',
    'crypto',
    'forex',
    'securities',
    'advisory',
    'past-performance',
    'tax',
    'not-advice',
  ];
}

/**
 * Normalize locale code to supported locale
 * @param locale - Locale code
 * @returns Normalized locale
 */
function normalizeLocale(locale: string): SupportedLocale {
  const baseLocale = locale.toLowerCase().split('-')[0];
  if (['ar', 'he', 'en'].includes(baseLocale)) {
    return baseLocale as SupportedLocale;
  }
  return 'en';
}

/**
 * Detect content type based on keywords
 * @param content - Content to analyze
 * @returns Detected content type or null
 */
function detectContentType(content: string): string | null {
  const lowerContent = content.toLowerCase();

  const keywords: Record<string, string[]> = {
    'crypto-product': ['crypto', 'bitcoin', 'blockchain', 'token', 'coin', 'wallet'],
    'forex-service': ['forex', 'fx', 'currency pair', 'exchange rate', 'pips'],
    'trading-platform': ['trading', 'trade', 'broker', 'platform', 'order'],
    'investment-product': ['invest', 'fund', 'portfolio', 'asset', 'return'],
    'financial-advice': ['advice', 'advisor', 'recommend', 'suggest', 'should buy'],
    'past-performance-shown': ['past performance', 'historical', 'previous return'],
    'taxable-investment': ['tax', 'taxable', 'capital gain', 'dividend'],
  };

  for (const [type, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerContent.includes(word))) {
      return type;
    }
  }

  return null;
}

/**
 * Check if content contains disclaimer keywords
 * @param content - Content to check
 * @param disclaimerType - Type of disclaimer
 * @param locale - Locale code
 * @returns true if disclaimer keywords found
 */
function containsDisclaimerKeywords(
  content: string,
  disclaimerType: DisclaimerType,
  locale: SupportedLocale
): boolean {
  const lowerContent = content.toLowerCase();

  const keywords: Record<SupportedLocale, Record<DisclaimerType, string[]>> = {
    en: {
      general: ['informational', 'not financial advice', 'consult'],
      investment: ['risk', 'loss of capital', 'past performance'],
      trading: ['trading risk', 'leverage', 'lose more'],
      crypto: ['volatile', 'unregulated', 'lose entire'],
      forex: ['exchange rate', 'volatile', 'high risk'],
      securities: ['regulated', 'securities authority'],
      advisory: ['not personal', 'qualified advisor'],
      'past-performance': ['past performance', 'not indicative', 'future'],
      tax: ['tax', 'tax advisor', 'subject to tax'],
      'not-advice': ['not financial advice', 'not investment advice', 'licensed advisor'],
    },
    ar: {
      general: ['إعلامية', 'ليس نصيحة', 'استشارة'],
      investment: ['مخاطر', 'خسارة رأس المال', 'الأداء السابق'],
      trading: ['مخاطر التداول', 'الرافعة المالية', 'تخسر أكثر'],
      crypto: ['متقلبة', 'غير منظمة', 'تفقد كامل'],
      forex: ['سعر الصرف', 'متقلبة', 'مخاطر عالية'],
      securities: ['منظمة', 'هيئة الأوراق المالية'],
      advisory: ['ليس شخصيا', 'مستشار مؤهل'],
      'past-performance': ['الأداء السابق', 'لا يضمن', 'المستقبل'],
      tax: ['ضريبة', 'مستشار ضريبي', 'خاضعة للضريبة'],
      'not-advice': ['ليس نصيحة مالية', 'ليس نصيحة استثمارية', 'مستشار مرخص'],
    },
    he: {
      general: ['מידע', 'לא ייעוץ', 'התייעצות'],
      investment: ['סיכון', 'אובדן הון', 'ביצועים קודמים'],
      trading: ['סיכון מסחר', 'מינוף', 'להפסיד יותר'],
      crypto: ['תנודתי', 'לא מוסדר', 'לאבד הכל'],
      forex: ['שער חליפין', 'תנודתי', 'סיכון גבוה'],
      securities: ['מוסדר', 'רשות ניירות ערך'],
      advisory: ['לא אישי', 'יועץ מוסמך'],
      'past-performance': ['ביצועים עבר', 'לא מצביע', 'עתיד'],
      tax: ['מס', 'יועץ מס', 'חייב במס'],
      'not-advice': ['לא ייעוץ פיננסי', 'לא ייעוץ השקעות', 'יועץ מורשה'],
    },
  };

  const disclaimerKeywords = keywords[locale][disclaimerType] || [];
  return disclaimerKeywords.some((keyword) => lowerContent.includes(keyword));
}

/**
 * Generate recommendations based on violations
 * @param violations - Array of violations
 * @param locale - Locale code
 * @returns Array of recommendation strings
 */
function generateRecommendations(
  violations: Array<{ type: ClaimType; severity: string }>,
  locale: SupportedLocale
): string[] {
  const recommendations: Record<SupportedLocale, string[]> = {
    en: [
      'Add appropriate risk disclaimers to your content.',
      'Consult with a compliance officer before publishing.',
      'Review regulatory requirements for your jurisdiction.',
    ],
    ar: [
      'أضف إخلاءات المسؤولية المناسبة إلى المحتوى الخاص بك.',
      'استشر مسؤول الامتثال قبل النشر.',
      'راجع متطلبات الهيئة التنظيمية لولايتك القضائية.',
    ],
    he: [
      'הוסף כתבי ויתור מתאימים לתוכן שלך.',
      'התייעץ עם קצין תאימות לפני הפרסום.',
      'בדוק את דרישות הרגולטור עבור תחומי השיפוט שלך.',
    ],
  };

  const baseRecommendations = [...recommendations[locale]];

  // Add specific recommendations based on violations
  for (const violation of violations) {
    if (violation.type === 'guaranteed-returns') {
      baseRecommendations.push(
        locale === 'ar'
          ? 'أزل أي ذكر للعوائد المضمونة.'
          : locale === 'he'
          ? 'הסר כל אזכור של תשואות מובטחות.'
          : 'Remove any mention of guaranteed returns.'
      );
    }
    if (violation.type === 'risk-free') {
      baseRecommendations.push(
        locale === 'ar'
          ? 'أزل مصطلح "خالٍ من المخاطر" من المحتوى.'
          : locale === 'he'
          ? 'הסר את המונח "ללא סיכון" מהתוכן.'
          : 'Remove the term "risk-free" from content.'
      );
    }
  }

  return baseRecommendations;
}

/**
 * Get suggestion text based on suggestion type
 * @param type - Suggestion type
 * @param locale - Locale code
 * @param data - Additional data
 * @returns Suggestion text
 */
function getSuggestionText(
  type: string,
  locale: SupportedLocale,
  data?: DisclaimerType[]
): string {
  const suggestions: Record<string, Record<SupportedLocale, string>> = {
    'missing-disclaimers': {
      en: `Consider adding the following disclaimers: ${data?.join(', ') || ''}`,
      ar: `فكر في إضافة إخلاءات المسؤولية التالية: ${data?.join('، ') || ''}`,
      he: `שקול להוסיף את כתבי הוויתור הבאים: ${data?.join(', ') || ''}`,
    },
    'review-claims': {
      en: 'Review and revise potentially misleading claims in your content.',
      ar: 'راجع وعدّل الادعاءات المحتملة المضللة في محتواك.',
      he: 'בדוק ותקן טענות מטעות אפשריות בתוכן שלך.',
    },
  };

  return suggestions[type]?.[locale] || suggestions[type]?.en || '';
}

/**
 * Get header text for disclaimers
 * @param locale - Locale code
 * @returns Header text
 */
function getHeaderText(locale: SupportedLocale): string {
  const headers: Record<SupportedLocale, string> = {
    ar: 'إخلاء مسؤولية مالي',
    he: 'כתב ויתור פיננסי',
    en: 'Financial Disclaimer',
  };

  return headers[locale];
}

/**
 * Check if content requires financial disclaimers
 * @param content - Content to check
 * @returns true if disclaimers likely required
 */
export function requiresFinancialDisclaimers(content: string): boolean {
  const financialKeywords = [
    'invest',
    'investment',
    'stock',
    'bond',
    'fund',
    'portfolio',
    'return',
    'profit',
    'trading',
    'crypto',
    'bitcoin',
    'forex',
    'currency',
    'financial',
    'advice',
    'recommend',
  ];

  const lowerContent = content.toLowerCase();
  return financialKeywords.some((keyword) => lowerContent.includes(keyword));
}

/**
 * Get compliance checklist for content
 * @param content - Content to check
 * @param locale - Locale code
 * @returns Compliance checklist
 */
export function getComplianceChecklist(
  content: string,
  locale: string
): {
  items: Array<{ check: string; passed: boolean; required: boolean }>;
  overall: 'pass' | 'warning' | 'fail';
} {
  const normalizedLocale = normalizeLocale(locale);
  const validation = validateFinancialContent(content, locale);

  const items = [
    {
      check: 'No prohibited claims',
      passed: validation.claimViolations.length === 0,
      required: true,
    },
    {
      check: 'Required disclaimers present',
      passed: validation.hasRequiredDisclaimers,
      required: true,
    },
    {
      check: 'Not financial advice disclaimer',
      passed: containsDisclaimerKeywords(content, 'not-advice', normalizedLocale),
      required: requiresFinancialDisclaimers(content),
    },
    {
      check: 'Risk disclosure present',
      passed:
        containsDisclaimerKeywords(content, 'investment', normalizedLocale) ||
        containsDisclaimerKeywords(content, 'trading', normalizedLocale),
      required: requiresFinancialDisclaimers(content),
    },
  ];

  const failedRequired = items.filter((item) => item.required && !item.passed);
  const overall = failedRequired.length > 0 ? 'fail' : validation.claimViolations.length > 0 ? 'warning' : 'pass';

  return { items, overall };
}
