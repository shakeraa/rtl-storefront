/**
 * Cultural Review Service
 * Provides cultural sensitivity checking, inappropriate content detection,
 * and religious/cultural holiday awareness for translations
 * 
 * Supports: Arabic (ar), Hebrew (he), English (en) locales
 * 
 * @module translation-features/cultural-review
 */

export type Locale = 'ar' | 'he' | 'en' | string;
export type SensitivityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ContentCategory = 'religious' | 'cultural' | 'dietary' | 'social' | 'political' | 'holiday';

export interface SensitivityFlag {
  type: ContentCategory;
  level: SensitivityLevel;
  message: string;
  suggestion?: string;
}

export interface CulturalReviewResult {
  isSensitive: boolean;
  flags: SensitivityFlag[];
  score: number;
  recommendations: string[];
}

export interface InappropriateContentResult {
  hasInappropriateContent: boolean;
  severity: SensitivityLevel;
  issues: Array<{
    type: string;
    text: string;
    reason: string;
  }>;
}

export interface CulturalGuideline {
  topic: string;
  description: string;
  dos: string[];
  donts: string[];
  examples: {
    good: string[];
    bad: string[];
  };
}

export interface HolidayInfo {
  name: string;
  nameAr?: string;
  nameHe?: string;
  date: string;
  duration: number;
  type: 'religious' | 'national' | 'cultural';
  description: string;
  businessImpact: 'closed' | 'reduced' | 'normal';
  greetings?: {
    en?: string;
    ar?: string;
    he?: string;
  };
}

const CULTURAL_TABOOS: Record<string, Record<ContentCategory, string[]>> = {
  ar: {
    religious: ['allah', 'god', 'prophet', 'muhammad', 'jesus', 'christ', 'bible', 'quran', 'koran', 'mosque', 'church', 'temple', 'synagogue', 'prayer', 'worship', 'blessed', 'holy', 'sacred', 'divine'],
    cultural: ['pork', 'bacon', 'ham', 'alcohol', 'wine', 'beer', 'liquor', 'whiskey', 'vodka', 'nude', 'naked', 'sex', 'sexual', 'intimate', 'kissing', 'hugging', 'dating', 'boyfriend', 'girlfriend', 'extramarital', 'adultery'],
    dietary: ['pork', 'bacon', 'ham', 'sausage', 'pepperoni', 'prosciutto', 'lard', 'gelatin', 'alcohol', 'wine', 'beer', 'liquor', 'whiskey', 'vodka', 'rum', 'champagne', 'non-halal', 'non halal', 'haram'],
    social: ['left hand', 'left-handed', 'shoes', 'feet', 'pointing', 'thumbs down', 'dog', 'dogs', 'canine', 'pet dog'],
    political: ['israel', 'palestine', 'conflict', 'occupation', 'settlement', 'zionist', 'zionism', 'terrorist', 'terrorism', 'jihad', 'crusade', 'imperialism', 'colonialism'],
    holiday: ['christmas', 'easter', 'halloween', 'valentine', 'valentine\'s day', 'new year', 'new year\'s eve', 'thanksgiving'],
  },
  he: {
    religious: ['allah', 'muhammad', 'islam', 'mosque', 'church', 'cross', 'jesus', 'christ', 'trinity', 'pagan', 'idol', 'idolatry', 'false god', 'graven image', 'yahweh', 'jehovah', 'tetragrammaton', 'hashem'],
    cultural: ['pork', 'bacon', 'ham', 'shellfish', 'crab', 'lobster', 'shrimp', 'prawn', 'mixing meat and dairy', 'cheeseburger', 'meat dairy', 'traif', 'treif', 'tattoo', 'tattoos', 'body piercing', 'body modification'],
    dietary: ['pork', 'bacon', 'ham', 'sausage', 'shellfish', 'crab', 'lobster', 'shrimp', 'oyster', 'clam', 'scallop', 'non-kosher', 'non kosher', 'traif', 'treif', 'mixing meat and dairy', 'cheeseburger', 'meat with milk'],
    social: ['working on sabbath', 'sabbath work', 'shabbat work', 'driving on shabbat', 'electricity on shabbat', 'phone on shabbat', 'handshake opposite gender'],
    political: ['holocaust denial', 'anti-semitic', 'antisemitic', 'anti-semitism', 'antisemitism', 'nazi', 'nazism', 'hitler', 'final solution', 'palestine', 'palestinian', 'intifada', 'terrorist', 'terrorism'],
    holiday: ['christmas', 'easter', 'halloween', 'valentine', 'valentine\'s day', 'new year', 'new year\'s eve', 'thanksgiving', 'xmas', 'santa'],
  },
  en: {
    religious: ['allah', 'muhammad', 'quran', 'koran', 'infidel', 'kafir', 'heathen', 'yahweh', 'talmud', 'protocols', 'elders of zion'],
    cultural: ['racial slur', 'ethnic slur', 'stereotype', 'discrimination'],
    dietary: ['exotic meat', 'bushmeat', 'dog meat', 'cat meat', 'horse meat'],
    social: ['racial profiling', 'hate speech', 'bullying', 'harassment'],
    political: ['terrorist', 'terrorism', 'extremist', 'radical', 'militant', 'occupation', 'apartheid', 'genocide', 'ethnic cleansing'],
    holiday: ['controversial holiday', 'political holiday'],
  },
};

const INAPPROPRIATE_PATTERNS: Record<string, RegExp[]> = {
  ar: [
    /(?:خنزير|خنازير|لحم خنزير|بطن خنزير)/gi,
    /(?:خمر|نبيذ|بيرة|كحول|مسكر|سكران)/gi,
    /(?:عاري|عارية|جنس|جنسي|تحرش|تقبيل|معانقة)/gi,
    /(?:يسار|اليد اليسرى)/gi,
  ],
  he: [
    /(?:חזיר|חזירים|בשר חזיר|נקניקיית חזיר)/gi,
    /(?:שרימפס|סרטן|לובסטר|צדפות|מאכלי ים)/gi,
    /(?:חלב ובשר|בשר וחלב|צ'יזבורגר|טראיף)/gi,
    /(?:קעקוע|פירסינג|שבת|חילול שבת)/gi,
  ],
  en: [
    /\b(pork|bacon|ham)\s+(?:in|with|for)\s+(?:arabic|muslim|islamic|saudi|emirati|qatar)/gi,
    /\b(alcohol|wine|beer|liquor)\s+(?:in|with|for)\s+(?:saudi|iran|iranian|arabic|muslim)/gi,
    /\b(racial slur|racist|discrimination|hate speech)\b/gi,
  ],
};

const CULTURAL_HOLIDAYS: Record<string, HolidayInfo[]> = {
  ar: [
    { name: 'Ramadan', nameAr: 'رمضان', date: '9th month of Islamic calendar', duration: 29, type: 'religious', description: 'Holy month of fasting from dawn to sunset', businessImpact: 'reduced', greetings: { en: 'Ramadan Kareem', ar: 'رمضان كريم' } },
    { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '1 Shawwal', duration: 3, type: 'religious', description: 'Festival marking the end of Ramadan', businessImpact: 'closed', greetings: { en: 'Eid Mubarak', ar: 'عيد مبارك' } },
    { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '10-13 Dhu al-Hijjah', duration: 4, type: 'religious', description: 'Festival of Sacrifice commemorating Ibrahim\'s devotion', businessImpact: 'closed', greetings: { en: 'Eid Mubarak', ar: 'عيد مبارك' } },
    { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '1 Muharram', duration: 1, type: 'religious', description: 'Beginning of the Islamic lunar calendar year', businessImpact: 'reduced' },
    { name: 'Mawlid al-Nabi', nameAr: 'المولد النبوي', date: '12 Rabi\' al-awwal', duration: 1, type: 'religious', description: 'Birthday of Prophet Muhammad', businessImpact: 'reduced' },
    { name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: 'September 23', duration: 1, type: 'national', description: 'Celebration of the unification of Saudi Arabia', businessImpact: 'closed' },
    { name: 'UAE National Day', nameAr: 'اليوم الوطني الإماراتي', date: 'December 2', duration: 2, type: 'national', description: 'Celebration of the formation of the UAE', businessImpact: 'closed' },
  ],
  he: [
    { name: 'Rosh Hashanah', nameHe: 'ראש השנה', date: '1-2 Tishrei', duration: 2, type: 'religious', description: 'Jewish New Year', businessImpact: 'closed', greetings: { en: 'Shanah Tovah', he: 'שנה טובה' } },
    { name: 'Yom Kippur', nameHe: 'יום כיפור', date: '10 Tishrei', duration: 1, type: 'religious', description: 'Day of Atonement - holiest day in Judaism', businessImpact: 'closed', greetings: { en: 'Gmar Chatimah Tovah', he: 'גמר חתימה טובה' } },
    { name: 'Sukkot', nameHe: 'סוכות', date: '15-21 Tishrei', duration: 7, type: 'religious', description: 'Feast of Tabernacles', businessImpact: 'closed', greetings: { en: 'Chag Sameach', he: 'חג שמח' } },
    { name: 'Passover', nameHe: 'פסח', date: '15-22 Nisan', duration: 7, type: 'religious', description: 'Festival commemorating the Exodus from Egypt', businessImpact: 'closed', greetings: { en: 'Chag Pesach Sameach', he: 'חג פסח שמח' } },
    { name: 'Shavuot', nameHe: 'שבועות', date: '6-7 Sivan', duration: 2, type: 'religious', description: 'Festival of Weeks commemorating the giving of the Torah', businessImpact: 'closed', greetings: { en: 'Chag Sameach', he: 'חג שמח' } },
    { name: 'Hanukkah', nameHe: 'חנוכה', date: '25 Kislev - 2 Tevet', duration: 8, type: 'religious', description: 'Festival of Lights commemorating the rededication of the Temple', businessImpact: 'normal', greetings: { en: 'Happy Hanukkah', he: 'חנוכה שמח' } },
    { name: 'Purim', nameHe: 'פורים', date: '14 Adar', duration: 1, type: 'religious', description: 'Festival commemorating the salvation of the Jewish people in Persia', businessImpact: 'normal', greetings: { en: 'Happy Purim', he: 'פורים שמח' } },
    { name: 'Yom Haatzmaut', nameHe: 'יום העצמאות', date: '5 Iyar', duration: 1, type: 'national', description: 'Israeli Independence Day', businessImpact: 'closed', greetings: { en: 'Happy Independence Day', he: 'יום עצמאות שמח' } },
    { name: 'Yom Hazikaron', nameHe: 'יום הזיכרון', date: '4 Iyar', duration: 1, type: 'national', description: 'Israeli Memorial Day for fallen soldiers', businessImpact: 'closed' },
    { name: 'Shabbat', nameHe: 'שבת', date: 'Weekly - Friday sunset to Saturday sunset', duration: 1, type: 'religious', description: 'Weekly day of rest', businessImpact: 'closed', greetings: { en: 'Shabbat Shalom', he: 'שבת שלום' } },
  ],
  en: [
    { name: 'Christmas', date: 'December 25', duration: 1, type: 'religious', description: 'Christian celebration of the birth of Jesus', businessImpact: 'closed', greetings: { en: 'Merry Christmas' } },
    { name: 'Easter', date: 'Variable (March/April)', duration: 1, type: 'religious', description: 'Christian celebration of the resurrection of Jesus', businessImpact: 'normal', greetings: { en: 'Happy Easter' } },
    { name: 'New Year\'s Day', date: 'January 1', duration: 1, type: 'cultural', description: 'First day of the Gregorian calendar year', businessImpact: 'closed', greetings: { en: 'Happy New Year' } },
    { name: 'Thanksgiving', date: 'Fourth Thursday of November', duration: 1, type: 'cultural', description: 'American harvest festival', businessImpact: 'closed', greetings: { en: 'Happy Thanksgiving' } },
  ],
};

const CULTURAL_GUIDELINES: Record<string, CulturalGuideline[]> = {
  ar: [
    { topic: 'Religious References', description: 'Be respectful and cautious with religious terminology', dos: ['Use proper honorifics when mentioning religious figures', 'Capitalize religious terms appropriately', 'Verify accuracy of religious dates and practices'], donts: ['Make jokes about religious practices', 'Compare religions unfavorably', 'Use religious symbols inappropriately'], examples: { good: ['Ramadan Kareem', 'Eid Mubarak', 'Peace be upon him'], bad: ['Ramadan party', 'Crazy fasting rules', 'Just a prophet'] } },
    { topic: 'Dietary Restrictions', description: 'Respect Islamic dietary laws (halal)', dos: ['Clearly label halal products', 'Offer halal alternatives', 'Separate halal and non-halal items'], donts: ['Promote pork products', 'Mix halal and non-halal without clear labeling', 'Mock dietary restrictions'], examples: { good: ['Halal certified beef', 'Alcohol-free beverages'], bad: ['Try our delicious pork bacon', 'Wine pairing with every meal'] } },
    { topic: 'Gender and Modesty', description: 'Respect conservative values regarding modesty', dos: ['Use modest imagery', 'Offer modest fashion options', 'Respect privacy preferences'], donts: ['Show revealing clothing', 'Use suggestive imagery', 'Assume Western norms apply'], examples: { good: ['Elegant modest dress', 'Full coverage swimwear'], bad: ['Sexy revealing outfit', 'Beach bikini collection'] } },
    { topic: 'Body Language and Gestures', description: 'Avoid culturally inappropriate gestures', dos: ['Use open palm gestures', 'Show respect with right hand', 'Maintain appropriate eye contact'], donts: ['Show soles of feet or shoes', 'Point with left hand', 'Use thumbs down gesture'], examples: { good: ['Right hand for giving/receiving', 'Respectful posture'], bad: ['Pointing with foot', 'Thumbs down to indicate dislike'] } },
    { topic: 'Alcohol References', description: 'Many Arabic-speaking regions prohibit or restrict alcohol', dos: ['Offer non-alcoholic alternatives', 'Clearly label alcohol content', 'Respect local laws and customs'], donts: ['Promote alcohol consumption', 'Associate celebrations with alcohol', 'Ignore local prohibitions'], examples: { good: ['Premium mocktails', 'Alcohol-free champagne'], bad: ['Happy hour drink specials', 'Wine tasting event'] } },
  ],
  he: [
    { topic: 'Kosher Dietary Laws', description: 'Respect Jewish dietary laws (kashrut)', dos: ['Clearly label kosher products', 'Separate meat and dairy', 'Offer kosher alternatives'], donts: ['Mix meat and dairy in same dish', 'Promote pork or shellfish', 'Ignore kosher certification importance'], examples: { good: ['Kosher certified meals', 'Pareve desserts'], bad: ['Cheeseburger special', 'Shrimp cocktail appetizer'] } },
    { topic: 'Sabbath Observance', description: 'Friday evening to Saturday evening is the Jewish Sabbath', dos: ['Plan around Shabbat times', 'Respect business closure', 'Acknowledge Shabbat greetings'], donts: ['Schedule mandatory events on Shabbat', 'Expect business as usual', 'Disrespect observant customers'], examples: { good: ['Order before Friday sunset', 'Shabbat Shalom greeting'], bad: ['Mandatory Saturday meeting', 'Why are you closed Friday night?'] } },
    { topic: 'Religious Sensitivity', description: 'Be aware of Jewish religious practices and terminology', dos: ['Use respectful language', 'Acknowledge Jewish holidays', 'Understand religious obligations'], donts: ['Make light of religious practices', 'Use sacred names casually', 'Compare religions negatively'], examples: { good: ['Observing kosher laws', 'Respecting Shabbat traditions'], bad: ['Why can\'t you just...', 'That\'s old-fashioned'] } },
    { topic: 'Holocaust Sensitivity', description: 'Extreme sensitivity around Holocaust references', dos: ['Use appropriate terminology', 'Show respect for survivors', 'Acknowledge historical significance'], donts: ['Make Holocaust jokes', 'Use Nazi comparisons', 'Minimize or deny the Holocaust'], examples: { good: ['Holocaust Remembrance Day observance'], bad: ['Like the Holocaust but worse', 'Nazi-like policies'] } },
    { topic: 'Modesty and Dress', description: 'Orthodox Jewish communities observe modest dress codes', dos: ['Offer modest fashion options', 'Respect dress code requirements', 'Be inclusive in imagery'], donts: ['Assume everyone dresses the same', 'Show revealing clothing only', 'Mock traditional dress'], examples: { good: ['Modest fashion collection', 'Kosher swimwear options'], bad: ['Revealing outfits for everyone', 'Traditional dress is oppressive'] } },
  ],
  en: [
    { topic: 'Inclusive Language', description: 'Use language that includes all people', dos: ['Use gender-neutral terms when possible', 'Respect preferred pronouns', 'Include diverse representations'], donts: ['Use gendered language unnecessarily', 'Make assumptions about identity', 'Exclude minority groups'], examples: { good: ['They/them pronouns respected', 'Diverse representation'], bad: ['Assuming gender roles', 'Excluding certain groups'] } },
    { topic: 'Cultural Appropriation', description: 'Avoid appropriating cultural elements without understanding', dos: ['Research cultural significance', 'Collaborate with cultural members', 'Give credit and context'], donts: ['Use sacred symbols casually', 'Stereotype cultures', 'Profit from others\' culture without acknowledgment'], examples: { good: ['Cultural collaboration', 'Educational context provided'], bad: ['Trendy appropriation', 'Stereotypical representations'] } },
    { topic: 'Holiday Sensitivity', description: 'Be inclusive of various cultural and religious holidays', dos: ['Acknowledge diverse celebrations', 'Use inclusive greetings', 'Respect holiday observances'], donts: ['Assume everyone celebrates Christmas', 'Ignore non-Christian holidays', 'Force participation in celebrations'], examples: { good: ['Happy Holidays', 'Season\'s Greetings'], bad: ['Merry Christmas to all', 'Ignoring other celebrations'] } },
  ],
};

export function checkCulturalSensitivity(text: string, locale: Locale): CulturalReviewResult {
  const normalizedText = text.toLowerCase().trim();
  const flags: SensitivityFlag[] = [];
  const taboos = CULTURAL_TABOOS[locale] || CULTURAL_TABOOS.en;

  for (const term of taboos.religious) {
    const regex = new RegExp(`\\b${term.replace(/'/g, "'\\?")}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      flags.push({ type: 'religious', level: 'high', message: `Religious term detected: "${term}"`, suggestion: 'Use respectful language and verify appropriate usage' });
    }
  }

  for (const term of taboos.cultural) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      flags.push({ type: 'cultural', level: locale === 'ar' || locale === 'he' ? 'critical' : 'medium', message: `Culturally sensitive term detected: "${term}"`, suggestion: 'Consider cultural context and appropriateness' });
    }
  }

  for (const term of taboos.dietary) {
    const regex = new RegExp(`\\b${term.replace(/'/g, "'\\?")}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      flags.push({ type: 'dietary', level: locale === 'ar' || locale === 'he' ? 'critical' : 'medium', message: `Dietary restriction term detected: "${term}"`, suggestion: 'Ensure proper labeling and alternatives are available' });
    }
  }

  for (const term of taboos.social) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      flags.push({ type: 'social', level: 'medium', message: `Social norm consideration: "${term}"`, suggestion: 'Review for cultural appropriateness' });
    }
  }

  for (const term of taboos.political) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      flags.push({ type: 'political', level: 'high', message: `Politically sensitive term detected: "${term}"`, suggestion: 'Avoid politically charged language in commercial content' });
    }
  }

  for (const term of taboos.holiday) {
    const regex = new RegExp(`\\b${term.replace(/'/g, "'\\?")}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      flags.push({ type: 'holiday', level: 'low', message: `Holiday reference detected: "${term}"`, suggestion: 'Ensure appropriate cultural context' });
    }
  }

  const baseScore = 100;
  const deductions: Record<SensitivityLevel, number> = { critical: 25, high: 15, medium: 8, low: 3 };
  let score = baseScore;
  for (const flag of flags) { score -= deductions[flag.level]; }
  score = Math.max(0, Math.min(100, score));

  const recommendations: string[] = [];
  if (flags.some(f => f.type === 'religious')) recommendations.push('Review religious references for appropriateness and respect');
  if (flags.some(f => f.type === 'dietary')) recommendations.push('Ensure dietary restrictions are properly handled');
  if (flags.some(f => f.type === 'cultural')) recommendations.push('Verify cultural content with native speakers');
  if (flags.some(f => f.type === 'political')) recommendations.push('Avoid politically charged language in commercial contexts');
  if (flags.length === 0) recommendations.push('Content appears culturally appropriate');

  return { isSensitive: flags.length > 0, flags, score, recommendations };
}

export function detectInappropriateContent(text: string, locale: Locale): InappropriateContentResult {
  const normalizedText = text.toLowerCase().trim();
  const patterns = INAPPROPRIATE_PATTERNS[locale] || INAPPROPRIATE_PATTERNS.en;
  const issues: Array<{ type: string; text: string; reason: string }> = [];
  let maxSeverity: SensitivityLevel = 'low';

  for (const pattern of patterns) {
    const matches = normalizedText.match(pattern);
    if (matches) {
      for (const match of matches) {
        let type = 'general';
        let reason = 'Potentially inappropriate content';

        if (locale === 'ar') {
          if (/خنزير|خنازير|لحم خنزير/.test(match)) { type = 'dietary_violation'; reason = 'Pork reference in culturally sensitive context'; maxSeverity = 'critical'; }
          else if (/خمر|نبيذ|بيرة|كحول/.test(match)) { type = 'alcohol_reference'; reason = 'Alcohol reference in restricted context'; maxSeverity = 'critical'; }
          else if (/عاري|عارية|جنس|جنسي|تحرش/.test(match)) { type = 'sexual_content'; reason = 'Sexual or inappropriate content'; maxSeverity = 'high'; }
          else if (/يسار|اليد اليسرى/.test(match)) { type = 'cultural_norm'; reason = 'Reference to culturally inappropriate gesture'; maxSeverity = 'medium'; }
        } else if (locale === 'he') {
          if (/חזיר|חזירים|בשר חזיר/.test(match)) { type = 'dietary_violation'; reason = 'Pork reference in culturally sensitive context'; maxSeverity = 'critical'; }
          else if (/שרימפס|סרטן|לובסטר|צדפות|מאכלי ים/.test(match)) { type = 'dietary_violation'; reason = 'Non-kosher food reference'; maxSeverity = 'high'; }
          else if (/חלב ובשר|בשר וחלב|צ'יזבורגר/.test(match)) { type = 'dietary_violation'; reason = 'Mixing meat and dairy (non-kosher)'; maxSeverity = 'high'; }
          else if (/קעקוע|פירסינג/.test(match)) { type = 'cultural_norm'; reason = 'Body modification reference'; maxSeverity = 'medium'; }
          else if (/שבת|חילול שבת/.test(match)) { type = 'religious_norm'; reason = 'Sabbath-related content requiring sensitivity'; maxSeverity = 'medium'; }
        } else {
          if (/pork|bacon|ham/.test(match) && /arabic|muslim|islamic|saudi/.test(match)) { type = 'dietary_violation'; reason = 'Inappropriate pork reference for Muslim context'; maxSeverity = 'high'; }
          else if (/alcohol|wine|beer/.test(match) && /saudi|iran|muslim|arabic/.test(match)) { type = 'alcohol_reference'; reason = 'Inappropriate alcohol reference for Muslim context'; maxSeverity = 'high'; }
          else if (/racial slur|racist|discrimination|hate speech/.test(match)) { type = 'hate_speech'; reason = 'Discriminatory or hateful content'; maxSeverity = 'critical'; }
        }
        issues.push({ type, text: match, reason });
      }
    }
  }

  if (locale === 'ar' && /\b(ramadan|eid|islam)\b.*\b(sale|discount|offer|promo)\b/gi.test(normalizedText)) {
    issues.push({ type: 'commercial_religious_mix', text: 'Religious term with commercial promotion', reason: 'Mixing religious observances with commercial promotions may be inappropriate' });
    maxSeverity = maxSeverity === 'critical' ? 'critical' : 'high';
  }

  if (locale === 'he' && /\b(shabbat|sabbath)\b.*\b(shopping|sale|store|buy)\b/gi.test(normalizedText)) {
    issues.push({ type: 'shabbat_commercialization', text: 'Shabbat with commercial activity', reason: 'Promoting commercial activity during Shabbat may offend observant Jews' });
    maxSeverity = maxSeverity === 'critical' ? 'critical' : 'high';
  }

  return { hasInappropriateContent: issues.length > 0, severity: maxSeverity, issues };
}

export function getCulturalGuidelines(locale: Locale): CulturalGuideline[] {
  return CULTURAL_GUIDELINES[locale] || CULTURAL_GUIDELINES.en;
}

export function getHolidays(locale: Locale): HolidayInfo[] {
  return CULTURAL_HOLIDAYS[locale] || CULTURAL_HOLIDAYS.en;
}

export function getUpcomingHolidays(locale: Locale, referenceDate: Date = new Date(), daysWindow: number = 90): HolidayInfo[] {
  const holidays = getHolidays(locale);
  return holidays.filter(h => h.businessImpact !== 'normal');
}

export function validateCulturalCompliance(content: { title?: string; description?: string; body?: string }, locale: Locale): { passed: boolean; sensitivityResult: CulturalReviewResult; inappropriateResult: InappropriateContentResult; overallScore: number; summary: string } {
  const texts: string[] = [];
  if (content.title) texts.push(content.title);
  if (content.description) texts.push(content.description);
  if (content.body) texts.push(content.body);
  const fullText = texts.join(' ');

  const sensitivityResult = checkCulturalSensitivity(fullText, locale);
  const inappropriateResult = detectInappropriateContent(fullText, locale);

  const sensitivityWeight = 0.6;
  const inappropriateWeight = 0.4;

  let inappropriateScore = 100;
  if (inappropriateResult.hasInappropriateContent) {
    const severityDeductions: Record<SensitivityLevel, number> = { critical: 40, high: 25, medium: 15, low: 5 };
    inappropriateScore -= severityDeductions[inappropriateResult.severity];
    inappropriateScore -= inappropriateResult.issues.length * 5;
  }
  inappropriateScore = Math.max(0, inappropriateScore);

  const overallScore = Math.round(sensitivityResult.score * sensitivityWeight + inappropriateScore * inappropriateWeight);
  const passed = overallScore >= 70 && !inappropriateResult.issues.some(i => i.type === 'dietary_violation' || i.type === 'sexual_content');

  let summary = '';
  if (passed && overallScore >= 90) summary = 'Content passes cultural compliance with excellent score';
  else if (passed) summary = 'Content passes cultural compliance but has minor considerations';
  else if (overallScore >= 50) summary = 'Content has cultural issues that should be addressed';
  else summary = 'Content has critical cultural compliance failures';

  return { passed, sensitivityResult, inappropriateResult, overallScore, summary };
}

export function getCulturalGreeting(locale: Locale, occasion?: string): string {
  const greetings: Record<string, Record<string, string>> = {
    ar: { default: 'السلام عليكم (Peace be upon you)', ramadan: 'رمضان كريم (Ramadan Kareem)', eid: 'عيد مبارك (Eid Mubarak)', morning: 'صباح الخير (Good morning)', evening: 'مساء الخير (Good evening)' },
    he: { default: 'שלום (Shalom)', shabbat: 'שבת שלום (Shabbat Shalom)', holiday: 'חג שמח (Chag Sameach)', morning: 'בוקר טוב (Boker Tov)', evening: 'ערב טוב (Erev Tov)' },
    en: { default: 'Hello', morning: 'Good morning', evening: 'Good evening', holiday: 'Happy Holidays' },
  };
  const localeGreetings = greetings[locale] || greetings.en;
  return localeGreetings[occasion || 'default'] || localeGreetings.default;
}

export function detectHolidayReferences(text: string, locale: Locale): HolidayInfo[] {
  const normalizedText = text.toLowerCase();
  const holidays = getHolidays(locale);
  const detected: HolidayInfo[] = [];

  for (const holiday of holidays) {
    const searchTerms = [holiday.name.toLowerCase()];
    if (holiday.nameAr) searchTerms.push(holiday.nameAr);
    if (holiday.nameHe) searchTerms.push(holiday.nameHe);

    for (const term of searchTerms) {
      if (normalizedText.includes(term)) {
        detected.push(holiday);
        break;
      }
    }
  }
  return detected;
}

export function batchCulturalReview(items: Array<{ text: string; locale: Locale }>): Array<{ locale: Locale; result: CulturalReviewResult }> {
  return items.map(item => ({ locale: item.locale, result: checkCulturalSensitivity(item.text, item.locale) }));
}

export function exportCulturalData(): { taboos: typeof CULTURAL_TABOOS; holidays: typeof CULTURAL_HOLIDAYS; guidelines: typeof CULTURAL_GUIDELINES } {
  return { taboos: CULTURAL_TABOOS, holidays: CULTURAL_HOLIDAYS, guidelines: CULTURAL_GUIDELINES };
}
