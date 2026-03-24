import type { ArabicDialect } from "./types";

export type { ArabicDialect };

/**
 * Country code to Arabic dialect mapping.
 */
const COUNTRY_DIALECT_MAP: Record<string, ArabicDialect> = {
  // Gulf Arabic
  SA: "gulf",
  AE: "gulf",
  KW: "gulf",
  BH: "gulf",
  QA: "gulf",
  OM: "gulf",
  // Levantine Arabic
  SY: "levantine",
  LB: "levantine",
  JO: "levantine",
  PS: "levantine",
  // Egyptian Arabic
  EG: "egyptian",
  // Maghreb Arabic
  MA: "maghrebi",
  DZ: "maghrebi",
  TN: "maghrebi",
  LY: "maghrebi",
};

/**
 * Dialect-specific marker words used for detection.
 * Each array contains words/patterns that are characteristic of the dialect.
 */
const DIALECT_MARKERS: Record<ArabicDialect, string[]> = {
  gulf: [
    "شلونك", // How are you (Gulf)
    "يالله", // Let's go
    "زين", // Good
    "وايد", // Very/much
    "شكو ماكو", // What's up
    "إمبيه", // What
    "هالحين", // Now
    "يديد", // New
    "حيل", // Very
  ],
  levantine: [
    "كيفك", // How are you (Levantine)
    "هلق", // Now
    "شو", // What
    "كتير", // Very
    "هيك", // Like this
    "منيح", // Good
    "بعرف", // I know
    "لسا", // Still
  ],
  egyptian: [
    "إزيك", // How are you (Egyptian)
    "ازاي", // How
    "كده", // Like this
    "دلوقتي", // Now
    "خالص", // Very/at all
    "عايز", // Want
    "حاجة", // Thing
    "بتاع", // Of/belonging to
    "قوي", // Very
  ],
  maghrebi: [
    "واش", // What (Maghreb)
    "كيفاش", // How
    "بزاف", // Very/much
    "لاباس", // Fine/ok
    "ديالي", // Mine
    "خويا", // Brother
    "غادي", // Going
    "هاذ", // This
  ],
  msa: [
    "بسم الله", // In the name of God
    "إن شاء الله", // God willing
    "ما شاء الله", // God has willed
    "الحمد لله", // Praise be to God
    "جزاكم الله", // May God reward you
  ],
};

/**
 * Detect Arabic dialect from text by checking for dialect-specific marker words.
 * Falls back to MSA if no dialect markers are found.
 */
export function detectDialect(text: string): ArabicDialect {
  const scores: Record<ArabicDialect, number> = {
    gulf: 0,
    levantine: 0,
    egyptian: 0,
    maghrebi: 0,
    msa: 0,
  };

  for (const [dialect, markers] of Object.entries(DIALECT_MARKERS)) {
    for (const marker of markers) {
      if (text.includes(marker)) {
        scores[dialect as ArabicDialect] += 1;
      }
    }
  }

  let bestDialect: ArabicDialect = "msa";
  let bestScore = 0;

  for (const [dialect, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestDialect = dialect as ArabicDialect;
    }
  }

  return bestDialect;
}

/**
 * Map a country code to its primary Arabic dialect.
 * Returns MSA for unknown or non-Arabic countries.
 */
export function getDialectFromCountry(countryCode: string): ArabicDialect {
  return COUNTRY_DIALECT_MAP[countryCode.toUpperCase()] ?? "msa";
}

/**
 * Get a prompt modifier string for the given dialect, suitable for
 * appending to translation prompts to guide dialect-specific output.
 */
export function getDialectPromptModifier(dialect: ArabicDialect): string {
  switch (dialect) {
    case "gulf":
      return (
        "Use Gulf Arabic (Khaliji) dialect common in Saudi Arabia, UAE, Kuwait, Bahrain, Qatar, and Oman. " +
        "Prefer Gulf-specific vocabulary and expressions. Use ك for 'your' addressing."
      );
    case "levantine":
      return (
        "Use Levantine Arabic dialect common in Syria, Lebanon, Jordan, and Palestine. " +
        "Prefer Levantine vocabulary such as 'شو' for 'what' and 'كتير' for 'very'."
      );
    case "egyptian":
      return (
        "Use Egyptian Arabic dialect. Prefer Egyptian vocabulary such as 'ازاي' for 'how' " +
        "and 'دلوقتي' for 'now'. Use Egyptian pronunciation conventions in transliteration."
      );
    case "maghrebi":
      return (
        "Use Maghrebi Arabic dialect common in Morocco, Algeria, Tunisia, and Libya. " +
        "Prefer Maghrebi vocabulary and French-influenced loanwords where commonly used."
      );
    case "msa":
      return (
        "Use Modern Standard Arabic (MSA / فصحى). Maintain formal register with classical " +
        "Arabic grammar and vocabulary suitable for a pan-Arab audience."
      );
  }
}
