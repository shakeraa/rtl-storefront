import { isRTLLanguage } from "../../utils/rtl";
import type { SensitivityFlag, SensitivityResult } from "./types";

interface SensitivityPattern {
  pattern: RegExp;
  type: SensitivityFlag["type"];
  severity: SensitivityFlag["severity"];
  description: string;
  suggestion?: string;
}

/**
 * Patterns for detecting religiously sensitive content.
 */
const RELIGIOUS_PATTERNS: SensitivityPattern[] = [
  {
    pattern: /\b(god|deity|divine)\b(?![\s-]*(willing|bless))/i,
    type: "religious",
    severity: "medium",
    description: "Religious reference that may need careful translation with appropriate reverence",
    suggestion: "Ensure the translation uses appropriate Arabic honorifics (e.g., الله سبحانه وتعالى)",
  },
  {
    pattern: /\b(christmas|easter|halloween)\b/i,
    type: "religious",
    severity: "low",
    description: "Non-Islamic holiday reference",
    suggestion: "Consider whether this reference is appropriate for the target audience or if a neutral alternative is better",
  },
  {
    pattern: /\b(church|temple|synagogue)\b/i,
    type: "religious",
    severity: "low",
    description: "Non-Islamic place of worship reference",
    suggestion: "Translate accurately but consider the audience context",
  },
  {
    pattern: /\b(bible|torah|gospel)\b/i,
    type: "religious",
    severity: "low",
    description: "Non-Islamic scripture reference",
    suggestion: "Use the standard Arabic term for the scripture (e.g., الإنجيل for Gospel, التوراة for Torah)",
  },
  {
    pattern: /\b(pray(er)?|worship|blessed|holy|sacred)\b/i,
    type: "religious",
    severity: "low",
    description: "Religious/spiritual term requiring culturally appropriate translation",
    suggestion: "Use Islamic equivalents where contextually appropriate",
  },
];

/**
 * Patterns for detecting dietary sensitivity (halal/haram concerns).
 */
const DIETARY_PATTERNS: SensitivityPattern[] = [
  {
    pattern: /\b(pork|bacon|ham|prosciutto|salami|pepperoni|lard)\b/i,
    type: "dietary",
    severity: "high",
    description: "Pork product reference - haram in Islamic dietary law",
    suggestion: "Flag clearly as non-halal or suggest halal alternative (e.g., beef bacon, turkey pepperoni)",
  },
  {
    pattern: /\b(alcohol|wine|beer|cocktail|champagne|whiskey|vodka|rum|liquor|spirits)\b/i,
    type: "dietary",
    severity: "high",
    description: "Alcohol reference - haram in Islamic dietary law",
    suggestion: "Consider non-alcoholic alternatives or clearly label as containing alcohol",
  },
  {
    pattern: /\b(gelatin|gelatine)\b/i,
    type: "dietary",
    severity: "medium",
    description: "Gelatin may be derived from non-halal sources",
    suggestion: "Specify if halal-certified or suggest plant-based alternative",
  },
  {
    pattern: /\b(halal)\b/i,
    type: "dietary",
    severity: "low",
    description: "Halal reference - ensure accurate certification claims",
    suggestion: "Verify halal certification before making claims in translation",
  },
];

/**
 * Patterns for detecting modesty-related sensitivity.
 */
const MODESTY_PATTERNS: SensitivityPattern[] = [
  {
    pattern: /\b(bikini|swimsuit|swimwear|lingerie|underwear|bra|negligee)\b/i,
    type: "modesty",
    severity: "medium",
    description: "Intimate/revealing clothing reference",
    suggestion: "Consider using modest alternatives (e.g., 'burkini' for swimwear) or ensure product descriptions emphasize coverage options",
  },
  {
    pattern: /\b(sexy|seductive|revealing|low[- ]cut|backless|strapless|mini[- ]?skirt|crop[- ]?top)\b/i,
    type: "modesty",
    severity: "medium",
    description: "Suggestive or revealing fashion description",
    suggestion: "Replace with modest fashion terminology (e.g., 'elegant' instead of 'sexy', 'stylish' instead of 'seductive')",
  },
  {
    pattern: /\b(sheer|see[- ]?through|transparent)\b/i,
    type: "modesty",
    severity: "low",
    description: "Fabric transparency reference",
    suggestion: "If describing fabric, clarify that it includes a lining or is used as an overlay",
  },
  {
    pattern: /\b(nude|naked|bare[- ]?skin)\b/i,
    type: "modesty",
    severity: "high",
    description: "Nudity or skin-exposure reference",
    suggestion: "Replace with culturally appropriate alternatives (e.g., 'nude' color → 'skin-tone' or 'beige')",
  },
];

/**
 * Patterns for detecting cultural sensitivities.
 */
const CULTURAL_PATTERNS: SensitivityPattern[] = [
  {
    pattern: /\b(lucky|luck|fortune[- ]?telling|horoscope|zodiac|astrology)\b/i,
    type: "cultural",
    severity: "low",
    description: "Superstition or fortune-telling reference",
    suggestion: "Some audiences may find fortune-telling references inappropriate; consider neutral alternatives",
  },
  {
    pattern: /\b(valentines|valentine'?s?\s*day)\b/i,
    type: "cultural",
    severity: "low",
    description: "Valentine's Day is controversial in some MENA markets",
    suggestion: "Consider using neutral terms like 'special occasion' or 'gift-giving season'",
  },
  {
    pattern: /\b(gambling|casino|betting|lottery)\b/i,
    type: "cultural",
    severity: "high",
    description: "Gambling reference - prohibited in Islamic law",
    suggestion: "Remove or replace with permissible alternatives",
  },
  {
    pattern: /\b(tattoo|piercing)\b/i,
    type: "cultural",
    severity: "low",
    description: "Body modification reference",
    suggestion: "Translate accurately; awareness that some audiences may view negatively",
  },
];

/**
 * Patterns for detecting political sensitivities.
 */
const POLITICAL_PATTERNS: SensitivityPattern[] = [
  {
    pattern: /\b(israel(?:i)?|zion(?:ist|ism)?)\b/i,
    type: "political",
    severity: "high",
    description: "Politically sensitive reference in MENA context",
    suggestion: "Handle with extreme care; verify compliance with local laws and regulations",
  },
  {
    pattern: /\b(sanctions?|embargo|boycott)\b/i,
    type: "political",
    severity: "medium",
    description: "Trade restriction reference",
    suggestion: "Ensure compliance with local trade regulations",
  },
];

const ALL_PATTERNS: SensitivityPattern[] = [
  ...RELIGIOUS_PATTERNS,
  ...DIETARY_PATTERNS,
  ...MODESTY_PATTERNS,
  ...CULTURAL_PATTERNS,
  ...POLITICAL_PATTERNS,
];

/**
 * Check text for cultural and religious sensitivity issues relevant to MENA markets.
 * Returns flags for any detected issues along with suggestions for alternatives.
 */
export function checkSensitivity(text: string, locale: string): SensitivityResult {
  const baseLocale = locale.split("-")[0]?.toLowerCase() ?? locale;

  // Only apply full sensitivity checking for Arabic and other MENA-relevant locales
  const isMENALocale = isRTLLanguage(locale) || ["ar", "fa", "ur"].includes(baseLocale);

  if (!isMENALocale) {
    return {
      hasSensitiveContent: false,
      flags: [],
      suggestions: [],
    };
  }

  const flags: SensitivityFlag[] = [];

  for (const entry of ALL_PATTERNS) {
    const matches = text.match(new RegExp(entry.pattern, "gi"));
    if (matches) {
      for (const match of matches) {
        flags.push({
          type: entry.type,
          severity: entry.severity,
          description: entry.description,
          originalText: match,
          suggestion: entry.suggestion,
        });
      }
    }
  }

  // Deduplicate flags by originalText + type
  const seen = new Set<string>();
  const uniqueFlags = flags.filter((flag) => {
    const key = `${flag.type}:${flag.originalText.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Sort by severity: high → medium → low
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  uniqueFlags.sort(
    (a, b) => (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2),
  );

  const suggestions = uniqueFlags
    .filter((flag) => flag.suggestion)
    .map((flag) => flag.suggestion!);

  return {
    hasSensitiveContent: uniqueFlags.length > 0,
    flags: uniqueFlags,
    suggestions: Array.from(new Set(suggestions)),
  };
}
