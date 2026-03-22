import { isRTLLanguage } from "../../utils/rtl";

export interface SensitivityRule {
  id: string;
  pattern: string;
  type: "religious" | "dietary" | "modesty" | "cultural" | "political";
  severity: "low" | "medium" | "high";
  replacement?: string;
  context: string;
}

export interface SensitivityMatch {
  rule: SensitivityRule;
  matchedText: string;
  position: number;
  suggestion?: string;
}

export interface SensitivityScanResult {
  matches: SensitivityMatch[];
  score: number;
  isClean: boolean;
  highSeverityCount: number;
}

export const SENSITIVITY_RULES: SensitivityRule[] = [
  // Religious
  { id: "rel-01", pattern: "\\bchristmas\\b", type: "religious", severity: "low", context: "May need cultural adaptation for MENA markets" },
  { id: "rel-02", pattern: "\\beaster\\b", type: "religious", severity: "low", context: "Consider using neutral 'spring' terminology" },
  { id: "rel-03", pattern: "\\bchurch\\b", type: "religious", severity: "low", context: "Religious reference - verify appropriateness" },
  { id: "rel-04", pattern: "\\bholy\\s+(?:water|communion|spirit)\\b", type: "religious", severity: "medium", context: "Christian-specific term" },
  { id: "rel-05", pattern: "\\bcrucifix\\b", type: "religious", severity: "medium", context: "Religious symbol reference" },
  { id: "rel-06", pattern: "\\bgod\\s+bless\\b", type: "religious", severity: "low", context: "Consider neutral alternative" },

  // Dietary
  { id: "diet-01", pattern: "\\bpork\\b", type: "dietary", severity: "high", replacement: "meat", context: "Pork is haram - use neutral 'meat' alternative" },
  { id: "diet-02", pattern: "\\bbacon\\b", type: "dietary", severity: "high", replacement: "turkey bacon", context: "Pork product - suggest halal alternative" },
  { id: "diet-03", pattern: "\\bham\\b", type: "dietary", severity: "high", replacement: "smoked meat", context: "Pork product" },
  { id: "diet-04", pattern: "\\bwine\\b", type: "dietary", severity: "medium", context: "Alcohol reference - verify context" },
  { id: "diet-05", pattern: "\\bbeer\\b", type: "dietary", severity: "medium", context: "Alcohol reference" },
  { id: "diet-06", pattern: "\\bwhiskey\\b|\\bwhisky\\b", type: "dietary", severity: "medium", context: "Alcohol reference" },
  { id: "diet-07", pattern: "\\bcocktail\\b", type: "dietary", severity: "low", context: "May imply alcohol - verify context" },
  { id: "diet-08", pattern: "\\bgelatin\\b", type: "dietary", severity: "low", context: "May be non-halal - specify source" },
  { id: "diet-09", pattern: "\\blard\\b", type: "dietary", severity: "high", context: "Animal fat - often pork-derived" },
  { id: "diet-10", pattern: "\\bnon-halal\\b", type: "dietary", severity: "high", context: "Explicitly non-halal content" },

  // Modesty
  { id: "mod-01", pattern: "\\bbikini\\b", type: "modesty", severity: "medium", replacement: "swimwear", context: "Consider modest swimwear alternative" },
  { id: "mod-02", pattern: "\\blingerie\\b", type: "modesty", severity: "medium", context: "Intimate wear - may need modest framing" },
  { id: "mod-03", pattern: "\\brevealing\\b", type: "modesty", severity: "low", context: "Consider modesty-conscious language" },
  { id: "mod-04", pattern: "\\bsexy\\b", type: "modesty", severity: "medium", replacement: "elegant", context: "Use modest alternative" },
  { id: "mod-05", pattern: "\\bskinny\\s+(?:jeans|fit)\\b", type: "modesty", severity: "low", context: "Tight-fit clothing - verify audience" },
  { id: "mod-06", pattern: "\\bcrop\\s+top\\b", type: "modesty", severity: "medium", replacement: "tunic top", context: "Revealing garment" },
  { id: "mod-07", pattern: "\\bshort\\s+(?:skirt|dress|shorts)\\b", type: "modesty", severity: "low", context: "May need modest alternative description" },

  // Cultural
  { id: "cul-01", pattern: "\\bleft\\s+hand\\b", type: "cultural", severity: "low", context: "Left hand has cultural significance in MENA" },
  { id: "cul-02", pattern: "\\bdog\\b", type: "cultural", severity: "low", context: "Dogs may have cultural sensitivity - verify context" },
  { id: "cul-03", pattern: "\\bvalentine\\b", type: "cultural", severity: "low", context: "May not be celebrated in some MENA markets" },
  { id: "cul-04", pattern: "\\bhalloween\\b", type: "cultural", severity: "low", context: "Western holiday - may not resonate" },
  { id: "cul-05", pattern: "\\blucky\\s+charm\\b", type: "cultural", severity: "low", context: "Superstition - may conflict with beliefs" },

  // Political
  { id: "pol-01", pattern: "\\bisrael(?:i)?\\b", type: "political", severity: "high", context: "Politically sensitive in many MENA markets" },
  { id: "pol-02", pattern: "\\bsanctions\\b", type: "political", severity: "medium", context: "Trade/political reference" },
  { id: "pol-03", pattern: "\\bboycott\\b", type: "political", severity: "medium", context: "Political action reference" },
];

const RAMADAN_PATTERNS = [
  /\beat(?:ing)?\s+(?:during|while)\s+(?:the\s+)?day/i,
  /\bfood\s+(?:ad|advertisement|promo)/i,
  /\brestaurant\s+(?:open|special|deal)/i,
  /\blunch\s+(?:special|deal|offer)/i,
  /\bbreakfast\s+(?:special|deal)/i,
  /\bdrink(?:ing)?\s+(?:during|while)/i,
];

/**
 * Scan text for cultural/religious sensitivity issues.
 */
export function scanForSensitivity(text: string, locale: string): SensitivityScanResult {
  const baseLocale = locale.split("-")[0]?.toLowerCase() ?? "";
  if (!isRTLLanguage(locale) && !["ar", "he", "fa", "ur"].includes(baseLocale)) {
    return { matches: [], score: 100, isClean: true, highSeverityCount: 0 };
  }

  const matches: SensitivityMatch[] = [];

  for (const rule of SENSITIVITY_RULES) {
    const regex = new RegExp(rule.pattern, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        rule,
        matchedText: match[0],
        position: match.index,
        suggestion: rule.replacement,
      });
    }
  }

  const highCount = matches.filter((m) => m.rule.severity === "high").length;
  const mediumCount = matches.filter((m) => m.rule.severity === "medium").length;
  const lowCount = matches.filter((m) => m.rule.severity === "low").length;

  const penalty = highCount * 20 + mediumCount * 10 + lowCount * 3;
  const score = Math.max(0, 100 - penalty);

  return {
    matches,
    score,
    isClean: matches.length === 0,
    highSeverityCount: highCount,
  };
}

/**
 * Auto-correct text by applying safe replacements.
 */
export function autoCorrect(text: string, locale: string): { corrected: string; changes: string[] } {
  let corrected = text;
  const changes: string[] = [];

  for (const rule of SENSITIVITY_RULES) {
    if (!rule.replacement) continue;
    const regex = new RegExp(rule.pattern, "gi");
    const newText = corrected.replace(regex, (match) => {
      changes.push(`"${match}" → "${rule.replacement}"`);
      return rule.replacement!;
    });
    corrected = newText;
  }

  return { corrected, changes };
}

/**
 * Check if text contains Ramadan-inappropriate content.
 */
export function isRamadanSensitive(text: string): boolean {
  return RAMADAN_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Get a sensitivity score (0-100, 100 = fully safe).
 */
export function getSensitivityScore(text: string, locale: string): number {
  const result = scanForSensitivity(text, locale);
  return result.score;
}
