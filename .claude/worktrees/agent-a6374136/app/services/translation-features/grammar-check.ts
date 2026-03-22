/**
 * T0304 - Grammar Check Service
 * Rule-based grammar checking with locale-aware patterns.
 */

export interface GrammarIssue {
  type: string;
  message: string;
  offset: number;
  length: number;
  suggestion?: string;
}

export interface GrammarCheckResult {
  correct: boolean;
  issues: GrammarIssue[];
}

export interface GrammarSuggestion {
  original: string;
  corrected: string;
  issues: GrammarIssue[];
}

interface GrammarRule {
  id: string;
  locales: string[];
  pattern: RegExp;
  message: string;
  type: string;
  fix?: (match: RegExpExecArray) => string;
}

const GRAMMAR_RULES: GrammarRule[] = [
  {
    id: "double_space",
    locales: [],
    pattern: /  +/g,
    message: "Multiple consecutive spaces found",
    type: "whitespace",
    fix: () => " ",
  },
  {
    id: "repeated_word",
    locales: ["en", "fr", "de", "es"],
    pattern: /\b(\w+)\s+\1\b/gi,
    message: "Repeated word detected",
    type: "repetition",
    fix: (m) => m[1],
  },
  {
    id: "trailing_whitespace",
    locales: [],
    pattern: /[ \t]+$/gm,
    message: "Trailing whitespace",
    type: "whitespace",
    fix: () => "",
  },
  {
    id: "multiple_punctuation",
    locales: [],
    pattern: /([!?])\1{2,}/g,
    message: "Excessive punctuation",
    type: "punctuation",
    fix: (m) => m[1],
  },
  {
    id: "space_before_punctuation",
    locales: ["en", "de", "es"],
    pattern: / ([,;:!?.])/g,
    message: "Space before punctuation mark",
    type: "spacing",
    fix: (m) => m[1],
  },
];

function getLangCode(locale: string): string {
  return locale.split("-")[0].toLowerCase();
}

function rulesForLocale(locale: string): GrammarRule[] {
  const lang = getLangCode(locale);
  return GRAMMAR_RULES.filter(
    (r) => r.locales.length === 0 || r.locales.includes(lang),
  );
}

export function checkGrammar(text: string, locale: string): GrammarCheckResult {
  const rules = rulesForLocale(locale);
  const issues: GrammarIssue[] = [];

  for (const rule of rules) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      issues.push({
        type: rule.type,
        message: rule.message,
        offset: match.index,
        length: match[0].length,
        suggestion: rule.fix ? rule.fix(match) : undefined,
      });
      if (match[0].length === 0) re.lastIndex++;
    }
  }

  return { correct: issues.length === 0, issues };
}

export function getGrammarSuggestions(
  text: string,
  locale: string,
): GrammarSuggestion {
  const { issues } = checkGrammar(text, locale);
  const rules = rulesForLocale(locale);

  let corrected = text;
  for (const rule of rules) {
    if (rule.fix) {
      const re = new RegExp(rule.pattern.source, rule.pattern.flags);
      corrected = corrected.replace(re, (...args) => {
        const match = args.slice(0, -2) as unknown as RegExpExecArray;
        match.index = args[args.length - 2] as number;
        match.input = args[args.length - 1] as string;
        return rule.fix!(match);
      });
    }
  }

  return { original: text, corrected, issues };
}
