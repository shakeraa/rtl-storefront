/**
 * Cultural Features Service
 * T0060: White Friday Campaign Templates
 * T0062: Weekend Adjustment
 * T0064: Cultural Consultant Marketplace
 * T0066: Dialect Awareness
 * T0067: Formality Adjustment
 */

// ---------------------------------------------------------------------------
// T0060 - White Friday Campaign Templates (consolidated into white-friday/ service)
// ---------------------------------------------------------------------------

export {
  createWhiteFridayCampaign,
  isWhiteFridayActive,
  getWhiteFridayTemplate,
  getWhiteFridayCountdown,
  formatCountdown,
  getSaleBadge,
  getDiscountMessage,
} from "../white-friday";

// ---------------------------------------------------------------------------
// T0062 - Weekend Adjustment (consolidated into weekend/ service)
// ---------------------------------------------------------------------------

export { isWeekend, getNextBusinessDay, getWeekendConfig, getWeekendType } from "../weekend";

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
// T0066 - Dialect Awareness (consolidated into cultural-ai/dialect-detector)
// ---------------------------------------------------------------------------

export { detectDialect, getDialectFromCountry, getDialectPromptModifier, type ArabicDialect } from "../cultural-ai/dialect-detector";

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
