/**
 * Cultural Features Service
 * T0060: White Friday Campaign Templates
 * T0062: Weekend Adjustment
 * T0064: Cultural Consultant Marketplace
 * T0066: Dialect Awareness
 * T0067: Formality Adjustment
 */

// ---------------------------------------------------------------------------
// T0060 - White Friday Campaign Templates
// ---------------------------------------------------------------------------

export interface CampaignTemplate {
  id: string;
  name: string;
  nameAr: string;
  type: "white_friday" | "ramadan" | "eid" | "national_day";
  colors: { primary: string; secondary: string; accent: string };
  discount: number;
  bannerText: string;
  bannerTextAr: string;
  startDate: string;
  endDate: string;
  countries: string[];
}

export const WHITE_FRIDAY_TEMPLATE: CampaignTemplate = {
  id: "wf-2026",
  name: "White Friday Mega Sale",
  nameAr: "تخفيضات الجمعة البيضاء الكبرى",
  type: "white_friday",
  colors: { primary: "#000000", secondary: "#D4AF37", accent: "#FFFFFF" },
  discount: 60,
  bannerText: "White Friday — Up to 70% Off!",
  bannerTextAr: "الجمعة البيضاء — خصومات تصل إلى ٧٠٪!",
  startDate: "2026-11-20",
  endDate: "2026-11-30",
  countries: ["SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO"],
};

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  WHITE_FRIDAY_TEMPLATE,
  {
    id: "ramadan-2026",
    name: "Ramadan Kareem Sale",
    nameAr: "عروض رمضان كريم",
    type: "ramadan",
    colors: { primary: "#1A472A", secondary: "#D4AF37", accent: "#FFFFFF" },
    discount: 30,
    bannerText: "Ramadan Kareem — Special Offers",
    bannerTextAr: "رمضان كريم — عروض خاصة",
    startDate: "2026-02-18",
    endDate: "2026-03-19",
    countries: ["SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO", "IQ"],
  },
  {
    id: "eid-fitr-2026",
    name: "Eid Al-Fitr Celebration",
    nameAr: "احتفالات عيد الفطر",
    type: "eid",
    colors: { primary: "#2E7D32", secondary: "#FFD700", accent: "#FAFAFA" },
    discount: 40,
    bannerText: "Eid Mubarak — Celebrate with Savings",
    bannerTextAr: "عيد مبارك — احتفل مع التوفير",
    startDate: "2026-03-20",
    endDate: "2026-03-27",
    countries: ["SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO"],
  },
  {
    id: "national-day-sa-2026",
    name: "Saudi National Day",
    nameAr: "اليوم الوطني السعودي",
    type: "national_day",
    colors: { primary: "#006C35", secondary: "#FFFFFF", accent: "#006C35" },
    discount: 50,
    bannerText: "Saudi National Day — Exclusive Deals",
    bannerTextAr: "اليوم الوطني السعودي — عروض حصرية",
    startDate: "2026-09-20",
    endDate: "2026-09-25",
    countries: ["SA"],
  },
];

export function generateWhiteFridayBanner(
  locale: string,
  discountPercent: number,
): string {
  const isArabic = locale.startsWith("ar");
  const dir = isArabic ? "rtl" : "ltr";
  const headline = isArabic
    ? "الجمعة البيضاء"
    : "White Friday";
  const subtitle = isArabic
    ? `خصومات تصل إلى ${discountPercent}٪`
    : `Up to ${discountPercent}% Off`;
  const cta = isArabic ? "تسوق الآن" : "Shop Now";

  return `<div dir="${dir}" style="background:linear-gradient(135deg,#000 0%,#1a1a1a 100%);color:#fff;padding:48px;text-align:center;font-family:sans-serif;">
  <h1 style="font-size:3rem;margin:0;color:#D4AF37;">${headline}</h1>
  <p style="font-size:1.5rem;margin:16px 0;color:#fff;">${subtitle}</p>
  <a href="#" style="display:inline-block;padding:16px 48px;background:#D4AF37;color:#000;text-decoration:none;font-weight:bold;font-size:1.2rem;border-radius:4px;">${cta}</a>
</div>`;
}

// ---------------------------------------------------------------------------
// T0062 - Weekend Adjustment
// ---------------------------------------------------------------------------

export interface WeekendConfig {
  country: string;
  weekendDays: number[];
  workStartDay: number;
}

export const WEEKEND_CONFIGS: Record<string, WeekendConfig> = {
  // GCC countries - Friday(5) + Saturday(6)
  SA: { country: "SA", weekendDays: [5, 6], workStartDay: 0 },
  AE: { country: "AE", weekendDays: [5, 6], workStartDay: 0 },
  QA: { country: "QA", weekendDays: [5, 6], workStartDay: 0 },
  KW: { country: "KW", weekendDays: [5, 6], workStartDay: 0 },
  BH: { country: "BH", weekendDays: [5, 6], workStartDay: 0 },
  OM: { country: "OM", weekendDays: [5, 6], workStartDay: 0 },
  // Other MENA - Friday(5) + Saturday(6)
  EG: { country: "EG", weekendDays: [5, 6], workStartDay: 0 },
  JO: { country: "JO", weekendDays: [5, 6], workStartDay: 0 },
  IQ: { country: "IQ", weekendDays: [5, 6], workStartDay: 0 },
  IL: { country: "IL", weekendDays: [5, 6], workStartDay: 0 },
  // Western - Saturday(6) + Sunday(0)
  US: { country: "US", weekendDays: [0, 6], workStartDay: 1 },
  GB: { country: "GB", weekendDays: [0, 6], workStartDay: 1 },
  FR: { country: "FR", weekendDays: [0, 6], workStartDay: 1 },
  DE: { country: "DE", weekendDays: [0, 6], workStartDay: 1 },
  CA: { country: "CA", weekendDays: [0, 6], workStartDay: 1 },
};

export function isWeekend(date: Date, country: string): boolean {
  const config = WEEKEND_CONFIGS[country] ?? WEEKEND_CONFIGS.US;
  return config.weekendDays.includes(date.getDay());
}

export function getNextBusinessDay(date: Date, country: string): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  while (isWeekend(next, country)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function getBusinessDays(
  start: Date,
  end: Date,
  country: string,
): number {
  let count = 0;
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    if (!isWeekend(current, country)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

// ---------------------------------------------------------------------------
// T0064 - Cultural Consultant Marketplace
// ---------------------------------------------------------------------------

export interface CulturalConsultant {
  id: string;
  name: string;
  languages: string[];
  specialties: string[];
  rate: number;
  currency: string;
  rating: number;
  available: boolean;
}

const CONSULTANT_DIRECTORY: CulturalConsultant[] = [
  { id: "cc-001", name: "Dr. Fatima Al-Rashid", languages: ["ar", "en"], specialties: ["e-commerce", "luxury brands", "Gulf culture"], rate: 150, currency: "USD", rating: 4.9, available: true },
  { id: "cc-002", name: "Ahmed Hassan", languages: ["ar", "en", "fr"], specialties: ["fashion", "Egyptian dialect", "social media"], rate: 120, currency: "USD", rating: 4.8, available: true },
  { id: "cc-003", name: "Layla Mahmoud", languages: ["ar", "en"], specialties: ["food & beverage", "Levantine culture", "packaging"], rate: 130, currency: "USD", rating: 4.7, available: true },
  { id: "cc-004", name: "Omar Al-Dosari", languages: ["ar", "en"], specialties: ["fintech", "Islamic finance", "legal compliance"], rate: 200, currency: "USD", rating: 4.9, available: false },
  { id: "cc-005", name: "Nour El-Din", languages: ["ar", "en", "de"], specialties: ["technology", "SaaS localization", "Gulf market entry"], rate: 175, currency: "USD", rating: 4.6, available: true },
  { id: "cc-006", name: "Sara Al-Mutairi", languages: ["ar", "en"], specialties: ["beauty", "health", "Saudi market"], rate: 140, currency: "USD", rating: 4.8, available: true },
  { id: "cc-007", name: "Karim Benzarti", languages: ["ar", "fr", "en"], specialties: ["Maghreb culture", "tourism", "hospitality"], rate: 110, currency: "USD", rating: 4.5, available: true },
  { id: "cc-008", name: "Huda Al-Amiri", languages: ["ar", "en"], specialties: ["education", "children's content", "Emirati culture"], rate: 160, currency: "USD", rating: 4.7, available: true },
  { id: "cc-009", name: "Youssef Khalil", languages: ["ar", "en", "tr"], specialties: ["electronics", "automotive", "B2B"], rate: 135, currency: "USD", rating: 4.6, available: false },
  { id: "cc-010", name: "Reem Al-Sayed", languages: ["ar", "en"], specialties: ["luxury retail", "Kuwaiti market", "brand voice"], rate: 180, currency: "USD", rating: 4.9, available: true },
];

export function getConsultantDirectory(): CulturalConsultant[] {
  return [...CONSULTANT_DIRECTORY];
}

export function findConsultants(
  language: string,
  specialty?: string,
): CulturalConsultant[] {
  return CONSULTANT_DIRECTORY.filter((c) => {
    const matchesLang = c.languages.includes(language);
    const matchesSpecialty =
      !specialty ||
      c.specialties.some((s) =>
        s.toLowerCase().includes(specialty.toLowerCase()),
      );
    return matchesLang && matchesSpecialty;
  });
}

export function requestConsultation(
  consultantId: string,
  text: string,
  locale: string,
): { requestId: string; estimatedResponse: string } {
  const consultant = CONSULTANT_DIRECTORY.find((c) => c.id === consultantId);
  if (!consultant) {
    throw new Error(`Consultant not found: ${consultantId}`);
  }
  if (!consultant.available) {
    throw new Error(`Consultant ${consultantId} is not currently available`);
  }

  const requestId = `cr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const estimatedResponse = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toISOString();

  return { requestId, estimatedResponse };
}

// ---------------------------------------------------------------------------
// T0066 - Dialect Awareness
// ---------------------------------------------------------------------------

export interface DialectVariation {
  word: string;
  msa: string;
  gulf: string;
  egyptian: string;
  levantine: string;
  maghreb: string;
}

export const COMMON_DIALECT_VARIATIONS: DialectVariation[] = [
  { word: "now", msa: "الآن", gulf: "الحين", egyptian: "دلوقتي", levantine: "هلأ", maghreb: "دروك" },
  { word: "what", msa: "ماذا", gulf: "شنو", egyptian: "إيه", levantine: "شو", maghreb: "واش" },
  { word: "how", msa: "كيف", gulf: "شلون", egyptian: "إزاي", levantine: "كيف", maghreb: "كيفاش" },
  { word: "good", msa: "جيد", gulf: "زين", egyptian: "كويس", levantine: "منيح", maghreb: "مزيان" },
  { word: "a lot", msa: "كثيراً", gulf: "واجد", egyptian: "كتير", levantine: "كتير", maghreb: "بزاف" },
  { word: "want", msa: "أريد", gulf: "أبي", egyptian: "عايز", levantine: "بدي", maghreb: "بغيت" },
  { word: "speak", msa: "يتكلم", gulf: "يتكلم", egyptian: "بيتكلم", levantine: "بيحكي", maghreb: "يهدر" },
  { word: "go", msa: "يذهب", gulf: "يروح", egyptian: "يروح", levantine: "يروح", maghreb: "يمشي" },
  { word: "see", msa: "يرى", gulf: "يشوف", egyptian: "يشوف", levantine: "يشوف", maghreb: "يشوف" },
  { word: "where", msa: "أين", gulf: "وين", egyptian: "فين", levantine: "وين", maghreb: "فاين" },
  { word: "this", msa: "هذا", gulf: "هذا", egyptian: "ده", levantine: "هاد", maghreb: "هاذ" },
  { word: "beautiful", msa: "جميل", gulf: "حلو", egyptian: "حلو", levantine: "حلو", maghreb: "زوين" },
  { word: "money", msa: "مال", gulf: "فلوس", egyptian: "فلوس", levantine: "مصاري", maghreb: "دراهم" },
  { word: "child", msa: "طفل", gulf: "ياهل", egyptian: "عيل", levantine: "ولد", maghreb: "درّي" },
  { word: "eat", msa: "يأكل", gulf: "ياكل", egyptian: "ياكل", levantine: "ياكل", maghreb: "ياكل" },
  { word: "car", msa: "سيارة", gulf: "سيارة", egyptian: "عربية", levantine: "سيارة", maghreb: "طونوبيل" },
  { word: "house", msa: "بيت", gulf: "بيت", egyptian: "بيت", levantine: "بيت", maghreb: "دار" },
  { word: "never mind", msa: "لا بأس", gulf: "عادي", egyptian: "معلش", levantine: "ما علينا", maghreb: "ما عليه" },
  { word: "look", msa: "انظر", gulf: "طالع", egyptian: "بص", levantine: "طلّع", maghreb: "شوف" },
  { word: "boy", msa: "ولد", gulf: "ولد", egyptian: "واد", levantine: "صبي", maghreb: "ولد" },
  { word: "girl", msa: "فتاة", gulf: "بنت", egyptian: "بنت", levantine: "بنت", maghreb: "بنت" },
  { word: "door", msa: "باب", gulf: "باب", egyptian: "باب", levantine: "باب", maghreb: "باب" },
  { word: "shop", msa: "متجر", gulf: "دكّان", egyptian: "محل", levantine: "دكّانة", maghreb: "حانوت" },
  { word: "big", msa: "كبير", gulf: "كبير", egyptian: "كبير", levantine: "كبير", maghreb: "كبير" },
  { word: "small", msa: "صغير", gulf: "صغير", egyptian: "صغير", levantine: "زغير", maghreb: "صغير" },
  { word: "tired", msa: "متعب", gulf: "تعبان", egyptian: "تعبان", levantine: "تعبان", maghreb: "عيّان" },
  { word: "water", msa: "ماء", gulf: "ماي", egyptian: "ميّة", levantine: "ميّ", maghreb: "الما" },
  { word: "bread", msa: "خبز", gulf: "خبز", egyptian: "عيش", levantine: "خبز", maghreb: "خبز" },
  { word: "fast", msa: "سريع", gulf: "سريع", egyptian: "سريع", levantine: "سريع", maghreb: "فيسع" },
  { word: "street", msa: "شارع", gulf: "شارع", egyptian: "شارع", levantine: "شارع", maghreb: "زنقة" },
  { word: "like/love", msa: "يحب", gulf: "يحب", egyptian: "بيحب", levantine: "بيحب", maghreb: "يبغي" },
];

export function getDialectVariation(
  word: string,
  dialect: string,
): string | null {
  const entry = COMMON_DIALECT_VARIATIONS.find(
    (v) => v.word.toLowerCase() === word.toLowerCase() || v.msa === word,
  );
  if (!entry) return null;
  const key = dialect as keyof DialectVariation;
  return (entry[key] as string) ?? null;
}

const DIALECT_MARKERS: Record<string, string[]> = {
  gulf: ["الحين", "شلون", "شنو", "واجد", "أبي", "زين", "ياهل"],
  egyptian: ["دلوقتي", "إزاي", "إيه", "عايز", "كويس", "بص", "عربية", "عيش", "معلش"],
  levantine: ["هلأ", "شو", "بدي", "منيح", "بيحكي", "مصاري", "هاد"],
  maghreb: ["دروك", "واش", "بزاف", "بغيت", "يهدر", "مزيان", "حانوت", "زنقة", "طونوبيل"],
};

export function detectDialectFromText(
  text: string,
): { dialect: string; confidence: number; markers: string[] } {
  const foundMarkers: Record<string, string[]> = {
    gulf: [],
    egyptian: [],
    levantine: [],
    maghreb: [],
  };

  for (const [dialect, markers] of Object.entries(DIALECT_MARKERS)) {
    for (const marker of markers) {
      if (text.includes(marker)) {
        foundMarkers[dialect].push(marker);
      }
    }
  }

  let bestDialect = "msa";
  let maxMatches = 0;
  const allMarkers: string[] = [];

  for (const [dialect, markers] of Object.entries(foundMarkers)) {
    if (markers.length > maxMatches) {
      maxMatches = markers.length;
      bestDialect = dialect;
    }
    allMarkers.push(...markers);
  }

  if (maxMatches === 0) {
    return { dialect: "msa", confidence: 0.5, markers: [] };
  }

  const totalPossibleMarkers = DIALECT_MARKERS[bestDialect]?.length ?? 1;
  const confidence = Math.min(0.95, 0.4 + (maxMatches / totalPossibleMarkers) * 0.55);

  return {
    dialect: bestDialect,
    confidence,
    markers: foundMarkers[bestDialect],
  };
}

// ---------------------------------------------------------------------------
// T0067 - Formality Adjustment
// ---------------------------------------------------------------------------

export type FormalityLevel = "formal" | "semi_formal" | "informal" | "casual";

export interface FormalityRule {
  pattern: string;
  formal: string;
  informal: string;
  context: string;
}

export const ARABIC_FORMALITY_RULES: FormalityRule[] = [
  { pattern: "أنتم", formal: "حضراتكم", informal: "أنتم", context: "plural you" },
  { pattern: "أنت", formal: "حضرتك", informal: "أنت", context: "singular you" },
  { pattern: "من فضلك", formal: "تكرماً", informal: "لو سمحت", context: "please" },
  { pattern: "شكراً", formal: "أشكركم جزيل الشكر", informal: "شكراً", context: "thank you" },
  { pattern: "مرحبا", formal: "السلام عليكم ورحمة الله وبركاته", informal: "أهلاً", context: "greeting" },
  { pattern: "نعم", formal: "بالتأكيد", informal: "أيوه", context: "yes" },
  { pattern: "لا", formal: "للأسف لا", informal: "لا", context: "no" },
  { pattern: "عفواً", formal: "أرجو المعذرة", informal: "عادي", context: "excuse me" },
  { pattern: "كيف حالك", formal: "كيف حالكم الكريم", informal: "شلونك", context: "how are you" },
  { pattern: "أريد", formal: "أود أن", informal: "أبي", context: "want" },
  { pattern: "ممكن", formal: "هل بالإمكان", informal: "ممكن", context: "may/can" },
  { pattern: "أعطني", formal: "تفضلوا بتزويدي", informal: "عطني", context: "give me" },
  { pattern: "مع السلامة", formal: "في أمان الله", informal: "باي", context: "goodbye" },
  { pattern: "تعال", formal: "تفضل", informal: "تعال", context: "come" },
  { pattern: "اسمع", formal: "أرجو الاستماع", informal: "اسمع", context: "listen" },
  { pattern: "ماذا تريد", formal: "كيف يمكنني مساعدتكم", informal: "شو بدك", context: "what do you want" },
];

export function adjustFormality(
  text: string,
  targetLevel: FormalityLevel,
): string {
  let result = text;

  for (const rule of ARABIC_FORMALITY_RULES) {
    const target =
      targetLevel === "formal" || targetLevel === "semi_formal"
        ? rule.formal
        : rule.informal;

    // Replace the pattern with the target formality
    if (result.includes(rule.pattern) && rule.pattern !== target) {
      result = result.replace(new RegExp(escapeRegex(rule.pattern), "g"), target);
    }

    // Also replace the opposite direction
    const opposite =
      targetLevel === "formal" || targetLevel === "semi_formal"
        ? rule.informal
        : rule.formal;
    if (result.includes(opposite) && opposite !== target && opposite !== rule.pattern) {
      result = result.replace(new RegExp(escapeRegex(opposite), "g"), target);
    }
  }

  return result;
}

export function detectFormality(text: string): FormalityLevel {
  let formalScore = 0;
  let informalScore = 0;

  for (const rule of ARABIC_FORMALITY_RULES) {
    if (text.includes(rule.formal)) formalScore++;
    if (text.includes(rule.informal) && rule.informal !== rule.formal) {
      informalScore++;
    }
  }

  // Check for casual markers
  const casualMarkers = ["باي", "أيوه", "عادي", "يلّا"];
  const casualCount = casualMarkers.filter((m) => text.includes(m)).length;

  if (casualCount >= 2) return "casual";
  if (formalScore > informalScore + 1) return "formal";
  if (informalScore > formalScore + 1) return "informal";
  return "semi_formal";
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
