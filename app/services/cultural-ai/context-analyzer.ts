import { isRTLLanguage, getBaseLocale } from "../../utils/rtl";
import { detectDialect, getDialectFromCountry, getDialectPromptModifier } from "./dialect-detector";
import { findFashionTerms } from "./fashion-corpus";
import { checkSensitivity } from "./religious-filter";
import type {
  ArabicDialect,
  CulturalContextInput,
  CulturalContextResult,
  FormalityLevel,
} from "./types";

/**
 * Category-specific cultural considerations for MENA markets.
 */
const CATEGORY_CULTURAL_NOTES: Record<string, string[]> = {
  fashion: [
    "Prioritize modesty-conscious descriptions",
    "Use culturally appropriate fashion terminology",
    "Avoid sexualized or revealing clothing descriptions",
    "Highlight coverage, elegance, and sophistication",
  ],
  food: [
    "Flag non-halal ingredients (pork, alcohol)",
    "Use Arabic culinary terms where appropriate",
    "Note dietary restrictions relevant to Islamic law",
    "Prefer halal-certified product descriptions",
  ],
  beauty: [
    "Check ingredient lists for alcohol-based products",
    "Use appropriate terminology for beauty standards",
    "Be aware of modesty considerations in beauty marketing",
    "Highlight natural and halal-certified ingredients",
  ],
  electronics: [
    "Use established Arabic technical terminology",
    "Keep brand names untranslated",
    "Right-to-left interface considerations for software references",
  ],
  home: [
    "Consider prayer room and Islamic decor references",
    "Use culturally appropriate interior design terminology",
    "Be mindful of imagery descriptions (avoid figurative art references in conservative contexts)",
  ],
  jewelry: [
    "Use Arabic terms for gold standards (e.g., عيار for karat)",
    "Cultural significance of gold in Gulf markets",
    "Islamic jewelry terminology (e.g., prayer beads, Allah pendants)",
  ],
  health: [
    "Check for non-halal ingredients in medications/supplements",
    "Use appropriate terminology for gender-specific health products",
    "Be aware of fasting-related health product context (Ramadan)",
  ],
};

/**
 * Category-specific prompt instructions for translation AI.
 */
const CATEGORY_PROMPT_INSTRUCTIONS: Record<string, string> = {
  fashion:
    "This is a fashion/clothing product. Emphasize modesty, elegance, and quality. " +
    "Use established MENA fashion terminology. Avoid suggestive language.",
  food:
    "This is a food/beverage product. Flag any non-halal ingredients. " +
    "Use Arabic culinary terms where they exist. Maintain accuracy for dietary information.",
  beauty:
    "This is a beauty/cosmetic product. Use appropriate Arabic beauty terminology. " +
    "Note any alcohol-based or non-halal ingredients. Focus on elegance and refinement.",
  electronics:
    "This is a technology/electronics product. Preserve technical specifications accurately. " +
    "Keep brand names in their original form. Use established Arabic tech vocabulary.",
  home:
    "This is a home/lifestyle product. Use culturally relevant home decor terminology. " +
    "Consider Islamic interior design aesthetics and prayer-space relevance.",
  jewelry:
    "This is a jewelry product. Use Arabic gold/gem terminology. " +
    "Highlight cultural significance where relevant. Maintain precision for karat/weight measurements.",
  health:
    "This is a health/wellness product. Verify halal-compliance of ingredients. " +
    "Use medically accurate Arabic terminology. Consider Ramadan/fasting context if relevant.",
};

/**
 * Default formality levels by category.
 */
const CATEGORY_DEFAULT_FORMALITY: Record<string, FormalityLevel> = {
  fashion: "formal",
  food: "informal",
  beauty: "formal",
  electronics: "formal",
  home: "informal",
  jewelry: "formal",
  health: "formal",
};

/**
 * Get the formality prompt instruction for the given level.
 */
function getFormalityInstruction(level: FormalityLevel): string {
  switch (level) {
    case "formal":
      return "Use formal register (فصحى influenced). Address the reader with respectful forms. Maintain professional tone.";
    case "informal":
      return "Use semi-formal register. Friendly but respectful tone. Appropriate for everyday commerce.";
    case "casual":
      return "Use casual, conversational register. Approachable and friendly tone appropriate for social media and youth-oriented content.";
  }
}

/**
 * Resolve the appropriate dialect from input, text analysis, or locale.
 */
function resolveDialect(input: CulturalContextInput): ArabicDialect {
  // Explicit dialect takes priority
  if (input.dialect) {
    return input.dialect;
  }

  // Try to detect from Arabic text content
  const hasArabic = /[\u0600-\u06FF]/.test(input.text);
  if (hasArabic) {
    const detected = detectDialect(input.text);
    if (detected !== "msa") {
      return detected;
    }
  }

  // Fall back to locale-based detection
  const localeParts = input.targetLocale.split("-");
  if (localeParts.length > 1) {
    const countryCode = localeParts[localeParts.length - 1]!.toUpperCase();
    const countryDialect = getDialectFromCountry(countryCode);
    if (countryDialect !== "msa") {
      return countryDialect;
    }
  }

  return "msa";
}

/**
 * Normalize a product/content category to one of the known categories.
 */
function normalizeCategory(category: string): string {
  const lower = category.toLowerCase().trim();

  const categoryAliases: Record<string, string> = {
    clothing: "fashion",
    apparel: "fashion",
    garment: "fashion",
    garments: "fashion",
    wear: "fashion",
    "food & beverage": "food",
    beverage: "food",
    beverages: "food",
    grocery: "food",
    groceries: "food",
    cosmetics: "beauty",
    skincare: "beauty",
    makeup: "beauty",
    fragrance: "beauty",
    perfume: "beauty",
    tech: "electronics",
    technology: "electronics",
    gadgets: "electronics",
    computers: "electronics",
    furniture: "home",
    decor: "home",
    "home decor": "home",
    household: "home",
    accessories: "jewelry",
    watches: "jewelry",
    wellness: "health",
    supplements: "health",
    medicine: "health",
    pharmaceutical: "health",
  };

  return categoryAliases[lower] ?? lower;
}

/**
 * Analyze cultural context for a given text and produce an enhanced translation prompt
 * along with cultural notes and sensitivity flags.
 */
export function analyzeCulturalContext(input: CulturalContextInput): CulturalContextResult {
  const baseLocale = getBaseLocale(input.targetLocale);
  const isTargetRTL = isRTLLanguage(input.targetLocale);
  const normalizedCategory = normalizeCategory(input.category);

  // Resolve dialect and formality
  const dialect = resolveDialect(input);
  const formalityLevel =
    input.formalityLevel ??
    CATEGORY_DEFAULT_FORMALITY[normalizedCategory] ??
    "formal";

  // Gather cultural notes
  const culturalNotes: string[] = [];

  // Add category-specific notes
  const categoryNotes = CATEGORY_CULTURAL_NOTES[normalizedCategory];
  if (categoryNotes) {
    culturalNotes.push(...categoryNotes);
  }

  // Add RTL-specific notes
  if (isTargetRTL) {
    culturalNotes.push("Ensure text displays correctly in RTL layout");
    culturalNotes.push("Numbers and Latin characters may need BiDi handling");
  }

  // Check for fashion terms and add relevant notes
  const fashionTerms = findFashionTerms(input.text);
  if (fashionTerms.length > 0) {
    const termNotes = fashionTerms
      .filter((t) => t.notes)
      .map((t) => `"${t.english}" → "${t.arabic}" (${t.notes})`);
    if (termNotes.length > 0) {
      culturalNotes.push(`Fashion terminology found: ${termNotes.join("; ")}`);
    }
  }

  // Run sensitivity check
  const sensitivity = checkSensitivity(input.text, input.targetLocale);
  const sensitivityFlags = sensitivity.flags.map(
    (flag) => `[${flag.severity.toUpperCase()}] ${flag.type}: ${flag.description} ("${flag.originalText}")`,
  );

  // Build enhanced prompt
  const promptParts: string[] = [];

  promptParts.push(
    `Translate the following text to ${baseLocale === "ar" ? "Arabic" : input.targetLocale}.`,
  );

  // Dialect instruction
  promptParts.push(getDialectPromptModifier(dialect));

  // Formality instruction
  promptParts.push(getFormalityInstruction(formalityLevel));

  // Category-specific instruction
  const categoryInstruction = CATEGORY_PROMPT_INSTRUCTIONS[normalizedCategory];
  if (categoryInstruction) {
    promptParts.push(categoryInstruction);
  }

  // Fashion term guidance
  if (fashionTerms.length > 0) {
    const termMappings = fashionTerms
      .map((t) => `"${t.english}" = "${t.arabic}"`)
      .join(", ");
    promptParts.push(`Use these established translations for fashion terms: ${termMappings}.`);
  }

  // Sensitivity guidance
  if (sensitivity.hasSensitiveContent) {
    const highSeverity = sensitivity.flags.filter((f) => f.severity === "high");
    if (highSeverity.length > 0) {
      promptParts.push(
        "IMPORTANT: This text contains culturally sensitive content. " +
          highSeverity.map((f) => f.suggestion).filter(Boolean).join(" "),
      );
    }
  }

  // RTL formatting guidance
  if (isTargetRTL) {
    promptParts.push(
      "The output will be displayed in a right-to-left layout. " +
        "Ensure proper BiDi handling for any embedded Latin text or numbers.",
    );
  }

  const enhancedPrompt = promptParts.join("\n\n");

  return {
    enhancedPrompt,
    dialect,
    formalityLevel,
    culturalNotes,
    sensitivityFlags,
  };
}
