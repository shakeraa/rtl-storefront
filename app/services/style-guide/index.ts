export interface StyleGuideConfig {
  locale: string;
  bannedTerms: Array<{ term: string; replacement?: string; reason: string }>;
  preferredTerms: Array<{ source: string; preferred: string }>;
  maxExclamationMarks?: number;
}

export interface StyleGuideViolation {
  type: "banned_term" | "preferred_term" | "punctuation";
  message: string;
  position?: { start: number; end: number };
  suggestion?: string;
}

export interface StyleGuideResult {
  compliant: boolean;
  violations: StyleGuideViolation[];
  normalizedText: string;
}

export function enforceStyleGuide(
  text: string,
  config: StyleGuideConfig,
): StyleGuideResult {
  const violations: StyleGuideViolation[] = [];
  let normalizedText = text;

  for (const banned of config.bannedTerms) {
    const pattern = new RegExp(`\\b${escapeRegExp(banned.term)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      violations.push({
        type: "banned_term",
        message: `Avoid "${match[0]}" because ${banned.reason}`,
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
        suggestion: banned.replacement,
      });
    }

    if (banned.replacement) {
      normalizedText = normalizedText.replace(pattern, banned.replacement);
    }
  }

  for (const preferred of config.preferredTerms) {
    const pattern = new RegExp(`\\b${escapeRegExp(preferred.source)}\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      violations.push({
        type: "preferred_term",
        message: `Prefer "${preferred.preferred}" instead of "${match[0]}"`,
        position: {
          start: match.index,
          end: match.index + match[0].length,
        },
        suggestion: preferred.preferred,
      });
    }

    normalizedText = normalizedText.replace(pattern, preferred.preferred);
  }

  const maxExclamationMarks = config.maxExclamationMarks ?? 1;
  const exclamationGroups = normalizedText.match(/!+/g) ?? [];
  for (const group of exclamationGroups) {
    if (group.length > maxExclamationMarks) {
      violations.push({
        type: "punctuation",
        message: `Limit exclamation marks to ${maxExclamationMarks}`,
        suggestion: "!".repeat(maxExclamationMarks),
      });
      normalizedText = normalizedText.replace(group, "!".repeat(maxExclamationMarks));
    }
  }

  return {
    compliant: violations.length === 0,
    violations,
    normalizedText,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
