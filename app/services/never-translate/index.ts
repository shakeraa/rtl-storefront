export interface NeverTranslateTerm {
  term: string;
  type: "exact" | "regex" | "prefix";
  caseSensitive: boolean;
  category: "brand" | "sku" | "technical" | "custom";
}

export interface NeverTranslateConfig {
  terms: NeverTranslateTerm[];
  preserveAllCaps: boolean;
  preserveNumbers: boolean;
  preserveEmails: boolean;
  preserveUrls: boolean;
}

export interface ProtectionResult {
  originalText: string;
  protectedText: string;
  placeholders: Map<string, string>;
  protectedTerms: string[];
}

const PLACEHOLDER_PREFIX = "⟦NT_";
const PLACEHOLDER_SUFFIX = "⟧";

/**
 * Protects never-translate terms by replacing them with placeholders
 * before sending text to translation. After translation, restore them.
 */
export class NeverTranslateProtector {
  private readonly config: NeverTranslateConfig;

  constructor(config: NeverTranslateConfig) {
    this.config = config;
  }

  /**
   * Replace never-translate terms with placeholders before translation.
   */
  protect(text: string): ProtectionResult {
    let protectedText = text;
    const placeholders = new Map<string, string>();
    const protectedTerms: string[] = [];
    let index = 0;

    // Protect explicit terms (longest first to avoid partial matches)
    const sortedTerms = [...this.config.terms].sort(
      (a, b) => b.term.length - a.term.length,
    );

    for (const term of sortedTerms) {
      const matches = this.findMatches(protectedText, term);
      for (const match of matches) {
        const placeholder = `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`;
        protectedText = protectedText.replace(match, placeholder);
        placeholders.set(placeholder, match);
        protectedTerms.push(match);
        index++;
      }
    }

    // Protect emails
    if (this.config.preserveEmails) {
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      protectedText = protectedText.replace(emailPattern, (match) => {
        const placeholder = `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`;
        placeholders.set(placeholder, match);
        protectedTerms.push(match);
        index++;
        return placeholder;
      });
    }

    // Protect URLs
    if (this.config.preserveUrls) {
      const urlPattern = /https?:\/\/[^\s<>]+/g;
      protectedText = protectedText.replace(urlPattern, (match) => {
        const placeholder = `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`;
        placeholders.set(placeholder, match);
        protectedTerms.push(match);
        index++;
        return placeholder;
      });
    }

    // Protect ALL_CAPS words (likely acronyms/brands)
    if (this.config.preserveAllCaps) {
      const capsPattern = /\b[A-Z]{2,}\b/g;
      protectedText = protectedText.replace(capsPattern, (match) => {
        if (placeholders.has(match)) return match;
        const placeholder = `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`;
        placeholders.set(placeholder, match);
        protectedTerms.push(match);
        index++;
        return placeholder;
      });
    }

    return { originalText: text, protectedText, placeholders, protectedTerms };
  }

  /**
   * Restore placeholders with original terms after translation.
   */
  restore(translatedText: string, placeholders: Map<string, string>): string {
    let restored = translatedText;
    for (const [placeholder, original] of placeholders) {
      restored = restored.replaceAll(placeholder, original);
    }
    return restored;
  }

  private findMatches(text: string, term: NeverTranslateTerm): string[] {
    const matches: string[] = [];
    const escaped = term.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (term.type === "regex") {
      try {
        const flags = term.caseSensitive ? "g" : "gi";
        const regex = new RegExp(term.term, flags);
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
          matches.push(match[0]);
        }
      } catch {
        // Invalid regex, skip
      }
    } else if (term.type === "prefix") {
      const flags = term.caseSensitive ? "g" : "gi";
      const regex = new RegExp(`\\b${escaped}\\S*`, flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match[0]);
      }
    } else {
      const flags = term.caseSensitive ? "g" : "gi";
      const regex = new RegExp(`\\b${escaped}\\b`, flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match[0]);
      }
    }

    return matches;
  }
}

export function createDefaultConfig(): NeverTranslateConfig {
  return {
    terms: [],
    preserveAllCaps: true,
    preserveNumbers: true,
    preserveEmails: true,
    preserveUrls: true,
  };
}

export function addSkuTerms(config: NeverTranslateConfig, skus: string[]): NeverTranslateConfig {
  return {
    ...config,
    terms: [
      ...config.terms,
      ...skus.map((sku) => ({
        term: sku,
        type: "exact" as const,
        caseSensitive: true,
        category: "sku" as const,
      })),
    ],
  };
}

export function addBrandTerms(config: NeverTranslateConfig, brands: string[]): NeverTranslateConfig {
  return {
    ...config,
    terms: [
      ...config.terms,
      ...brands.map((brand) => ({
        term: brand,
        type: "exact" as const,
        caseSensitive: false,
        category: "brand" as const,
      })),
    ],
  };
}
