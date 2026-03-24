/**
 * Translation Content Formatting & Preservation Service
 *
 * T0307 - Character Limits
 * T0308 - Formatting Preservation (HTML & Markdown)
 * T0309 - Emoji Handling
 * T0310 - Special Characters
 * T0311 - URL Preservation
 * T0312 - Email Preservation
 *
 * Uses ⟪FMT_N⟫ as placeholder pattern (distinct from never-translate ⟦NT_N⟧).
 */

const PLACEHOLDER_PREFIX = "\u27EA" + "FMT_"; // ⟪FMT_
const PLACEHOLDER_SUFFIX = "\u27EB"; // ⟫

function createPlaceholderGenerator() {
  let counter = 0;
  return () => `${PLACEHOLDER_PREFIX}${counter++}${PLACEHOLDER_SUFFIX}`;
}

// ---------------------------------------------------------------------------
// T0307 - Character Limits
// ---------------------------------------------------------------------------

export interface CharacterLimitConfig {
  field: string;
  maxLength: number;
  warningLength: number;
  truncationStrategy: "ellipsis" | "word_break" | "sentence_break";
}

export const DEFAULT_LIMITS: Record<string, CharacterLimitConfig> = {
  meta_title: {
    field: "meta_title",
    maxLength: 60,
    warningLength: 50,
    truncationStrategy: "ellipsis",
  },
  meta_description: {
    field: "meta_description",
    maxLength: 160,
    warningLength: 140,
    truncationStrategy: "sentence_break",
  },
  product_title: {
    field: "product_title",
    maxLength: 255,
    warningLength: 200,
    truncationStrategy: "word_break",
  },
  product_description: {
    field: "product_description",
    maxLength: 5000,
    warningLength: 4500,
    truncationStrategy: "sentence_break",
  },
  collection_title: {
    field: "collection_title",
    maxLength: 255,
    warningLength: 200,
    truncationStrategy: "word_break",
  },
  alt_text: {
    field: "alt_text",
    maxLength: 125,
    warningLength: 100,
    truncationStrategy: "word_break",
  },
  variant_title: {
    field: "variant_title",
    maxLength: 255,
    warningLength: 200,
    truncationStrategy: "ellipsis",
  },
  page_title: {
    field: "page_title",
    maxLength: 255,
    warningLength: 200,
    truncationStrategy: "word_break",
  },
};

export function checkCharacterLimit(
  text: string,
  field: string,
): { withinLimit: boolean; length: number; max: number; warning: boolean } {
  const config = DEFAULT_LIMITS[field];
  if (!config) {
    return { withinLimit: true, length: text.length, max: Infinity, warning: false };
  }
  return {
    withinLimit: text.length <= config.maxLength,
    length: text.length,
    max: config.maxLength,
    warning: text.length > config.warningLength,
  };
}

export function truncateText(
  text: string,
  maxLength: number,
  strategy: string,
): string {
  if (text.length <= maxLength) return text;

  switch (strategy) {
    case "ellipsis":
      return text.slice(0, maxLength - 1) + "\u2026";

    case "word_break": {
      const truncated = text.slice(0, maxLength - 1);
      const lastSpace = truncated.lastIndexOf(" ");
      if (lastSpace > maxLength * 0.5) {
        return truncated.slice(0, lastSpace) + "\u2026";
      }
      return truncated + "\u2026";
    }

    case "sentence_break": {
      const chunk = text.slice(0, maxLength);
      // Look for sentence-ending punctuation
      const sentenceEnd = Math.max(
        chunk.lastIndexOf(". "),
        chunk.lastIndexOf("! "),
        chunk.lastIndexOf("? "),
        chunk.lastIndexOf(".\u200F"), // Arabic sentence end with RLM
        chunk.lastIndexOf(".\n"),
      );
      if (sentenceEnd > maxLength * 0.4) {
        return chunk.slice(0, sentenceEnd + 1);
      }
      // Fall back to word break
      return truncateText(text, maxLength, "word_break");
    }

    default:
      return text.slice(0, maxLength - 1) + "\u2026";
  }
}

// ---------------------------------------------------------------------------
// T0308 - Formatting Preservation (HTML & Markdown)
// ---------------------------------------------------------------------------

const HTML_TAG_REGEX = /<\/?[a-zA-Z][^>]*>/g;
const MARKDOWN_PATTERNS = [
  /\*\*[^*]+\*\*/g,           // bold **text**
  /\*[^*]+\*/g,               // italic *text*
  /__[^_]+__/g,               // bold __text__
  /_[^_]+_/g,                 // italic _text_
  /~~[^~]+~~/g,               // strikethrough ~~text~~
  /`[^`]+`/g,                 // inline code `text`
  /!\[[^\]]*\]\([^)]+\)/g,    // images ![alt](url)
  /\[[^\]]*\]\([^)]+\)/g,     // links [text](url)
  /^#{1,6}\s/gm,              // headings
  /^\s*[-*+]\s/gm,            // unordered lists
  /^\s*\d+\.\s/gm,            // ordered lists
];

export function preserveHTMLFormatting(
  html: string,
): { text: string; placeholders: Map<string, string> } {
  const nextPlaceholder = createPlaceholderGenerator();
  const placeholders = new Map<string, string>();
  let result = html;

  result = result.replace(HTML_TAG_REGEX, (match) => {
    const ph = nextPlaceholder();
    placeholders.set(ph, match);
    return ph;
  });

  return { text: result, placeholders };
}

export function restoreHTMLFormatting(
  text: string,
  placeholders: Map<string, string>,
): string {
  let result = text;
  for (const [ph, original] of placeholders) {
    result = result.replace(ph, original);
  }
  return result;
}

export function preserveMarkdown(
  text: string,
): { text: string; placeholders: Map<string, string> } {
  const nextPlaceholder = createPlaceholderGenerator();
  const placeholders = new Map<string, string>();
  let result = text;

  for (const pattern of MARKDOWN_PATTERNS) {
    result = result.replace(pattern, (match) => {
      const ph = nextPlaceholder();
      placeholders.set(ph, match);
      return ph;
    });
  }

  return { text: result, placeholders };
}

export function restoreMarkdown(
  text: string,
  placeholders: Map<string, string>,
): string {
  let result = text;
  for (const [ph, original] of placeholders) {
    result = result.replace(ph, original);
  }
  return result;
}

// ---------------------------------------------------------------------------
// T0309 - Emoji Handling
// ---------------------------------------------------------------------------

// Matches most emoji sequences (including ZWJ sequences and skin tones)
const EMOJI_REGEX =
  /\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Regional_Indicator}{2}|[\u{1F3F4}][\u{E0060}-\u{E007F}]+/gu;

export function hasEmojis(text: string): boolean {
  EMOJI_REGEX.lastIndex = 0;
  return EMOJI_REGEX.test(text);
}

export function countEmojis(text: string): number {
  const matches = text.match(EMOJI_REGEX);
  return matches ? matches.length : 0;
}

export function preserveEmojis(
  text: string,
): { text: string; emojiMap: Map<string, string> } {
  const nextPlaceholder = createPlaceholderGenerator();
  const emojiMap = new Map<string, string>();
  const result = text.replace(EMOJI_REGEX, (match) => {
    const ph = nextPlaceholder();
    emojiMap.set(ph, match);
    return ph;
  });
  return { text: result, emojiMap };
}

export function restoreEmojis(
  text: string,
  emojiMap: Map<string, string>,
): string {
  let result = text;
  for (const [ph, emoji] of emojiMap) {
    result = result.replace(ph, emoji);
  }
  return result;
}

// ---------------------------------------------------------------------------
// T0310 - Special Characters
// ---------------------------------------------------------------------------

const SPECIAL_CHARS_REGEX = /[\u2122\u00AE\u00A9\u00B0\u00B1\u00B2\u00B3\u00BD\u00BC\u00BE\u20AC\u00A3\u00A5\u20B9\u20BA\u20BF\u00A7\u00B6\u2020\u2021\u2022\u2030\u2031\u221E\u2248\u2260\u2264\u2265\u00AB\u00BB\u2039\u203A]/g;

export function preserveSpecialChars(
  text: string,
): { text: string; charMap: Map<string, string> } {
  const nextPlaceholder = createPlaceholderGenerator();
  const charMap = new Map<string, string>();
  const result = text.replace(SPECIAL_CHARS_REGEX, (match) => {
    const ph = nextPlaceholder();
    charMap.set(ph, match);
    return ph;
  });
  return { text: result, charMap };
}

export function restoreSpecialChars(
  text: string,
  charMap: Map<string, string>,
): string {
  let result = text;
  for (const [ph, char] of charMap) {
    result = result.replace(ph, char);
  }
  return result;
}

// ---------------------------------------------------------------------------
// T0311 - URL Preservation
// ---------------------------------------------------------------------------

const URL_REGEX = /https?:\/\/[^\s<>"')\]},;]+/g;

export function extractUrls(
  text: string,
): Array<{ url: string; position: number }> {
  const results: Array<{ url: string; position: number }> = [];
  const re = new RegExp(URL_REGEX.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    results.push({ url: match[0], position: match.index });
  }
  return results;
}

export function protectUrls(
  text: string,
): { text: string; urls: Map<string, string> } {
  const nextPlaceholder = createPlaceholderGenerator();
  const urls = new Map<string, string>();
  const result = text.replace(URL_REGEX, (match) => {
    const ph = nextPlaceholder();
    urls.set(ph, match);
    return ph;
  });
  return { text: result, urls };
}

export function restoreUrls(
  text: string,
  urls: Map<string, string>,
): string {
  let result = text;
  for (const [ph, url] of urls) {
    result = result.replace(ph, url);
  }
  return result;
}

// ---------------------------------------------------------------------------
// T0312 - Email Preservation
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

export function extractEmails(text: string): string[] {
  return text.match(EMAIL_REGEX) || [];
}

export function protectEmails(
  text: string,
): { text: string; emails: Map<string, string> } {
  const nextPlaceholder = createPlaceholderGenerator();
  const emails = new Map<string, string>();
  const result = text.replace(EMAIL_REGEX, (match) => {
    const ph = nextPlaceholder();
    emails.set(ph, match);
    return ph;
  });
  return { text: result, emails };
}

export function restoreEmails(
  text: string,
  emails: Map<string, string>,
): string {
  let result = text;
  for (const [ph, email] of emails) {
    result = result.replace(ph, email);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Liquid Template Preservation
// ---------------------------------------------------------------------------

const LIQUID_REGEX = /\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g;

export function preserveLiquid(
  text: string,
): { text: string; placeholders: Map<string, string> } {
  const nextPlaceholder = createPlaceholderGenerator();
  const placeholders = new Map<string, string>();
  const result = text.replace(LIQUID_REGEX, (match) => {
    const ph = nextPlaceholder();
    placeholders.set(ph, match);
    return ph;
  });
  return { text: result, placeholders };
}

export function restoreLiquid(
  text: string,
  placeholders: Map<string, string>,
): string {
  let result = text;
  for (const [ph, original] of placeholders) {
    result = result.replace(ph, original);
  }
  return result;
}
