import { isRTLLanguage, getTextDirection } from "../../utils/rtl";
import type { BiDiSegment, BiDiPreserveOptions, BiDiAnalysis } from "./types";
import {
  BIDI_MARKS,
  RTL_CHAR_RANGE,
  LTR_CHAR_RANGE,
  RTL_REGEX,
  LTR_REGEX,
  EMAIL_REGEX,
  URL_REGEX,
} from "./constants";

export { BIDI_MARKS } from "./constants";
export type { BiDiSegment, BiDiPreserveOptions, BiDiAnalysis } from "./types";

/**
 * BiDi text preservation service.
 *
 * Handles mixed LTR/RTL content by inserting Unicode isolate characters
 * (LRI/RLI/PDI) so that emails, URLs, numbers, and brand names render
 * correctly regardless of the surrounding text direction.
 */
export class BiDiPreserver {
  /**
   * Main entry point - applies all BiDi preservation rules based on options.
   */
  preserve(text: string, locale: string, options?: Partial<BiDiPreserveOptions>): string {
    if (!text) {
      return text;
    }

    const opts: BiDiPreserveOptions = {
      locale,
      neverTranslateTerms: options?.neverTranslateTerms ?? [],
      preserveEmails: options?.preserveEmails ?? true,
      preserveUrls: options?.preserveUrls ?? true,
      preserveNumbers: options?.preserveNumbers ?? true,
      insertMarks: options?.insertMarks ?? true,
    };

    let result = text;

    // Preserve emails and URLs first (before inserting general marks)
    // so their LTR isolates don't get disrupted.
    if (opts.preserveEmails) {
      result = this.preserveEmails(result);
    }

    if (opts.preserveUrls) {
      result = this.preserveUrls(result);
    }

    if (opts.neverTranslateTerms && opts.neverTranslateTerms.length > 0) {
      result = this.preserveBrandNames(result, opts.neverTranslateTerms);
    }

    if (opts.preserveNumbers) {
      result = this.preserveNumbers(result, locale);
    }

    if (opts.insertMarks) {
      const direction = getTextDirection(locale);
      result = this.insertDirectionalMarks(result, direction);
    }

    return result;
  }

  /**
   * Insert LRM or RLM marks at the boundaries of the text based on the
   * document's base direction. This anchors the overall paragraph direction
   * so that the Unicode BiDi algorithm resolves neutrals correctly.
   */
  insertDirectionalMarks(text: string, direction: "rtl" | "ltr"): string {
    if (!text) {
      return text;
    }

    const mark = direction === "rtl" ? BIDI_MARKS.RLM : BIDI_MARKS.LRM;

    const analysis = this.detectMixedContent(text);

    // Only insert marks when the text actually contains mixed-direction content
    if (!analysis.hasRTL || !analysis.hasLTR) {
      return text;
    }

    return `${mark}${text}${mark}`;
  }

  /**
   * Wrap email addresses in LTR isolates so they always render left-to-right,
   * even inside an RTL paragraph.
   */
  preserveEmails(text: string): string {
    if (!text) {
      return text;
    }

    return text.replace(EMAIL_REGEX, (match) => {
      return `${BIDI_MARKS.LRI}${match}${BIDI_MARKS.PDI}`;
    });
  }

  /**
   * Wrap URLs in LTR isolates so they always render left-to-right.
   */
  preserveUrls(text: string): string {
    if (!text) {
      return text;
    }

    return text.replace(URL_REGEX, (match) => {
      return `${BIDI_MARKS.LRI}${match}${BIDI_MARKS.PDI}`;
    });
  }

  /**
   * Preserve numbers in RTL context by wrapping digit sequences with LTR
   * isolates. This prevents numbers adjacent to RTL text from being
   * re-ordered incorrectly by the BiDi algorithm.
   *
   * Only applied when the locale is RTL.
   */
  preserveNumbers(text: string, locale: string): string {
    if (!text || !isRTLLanguage(locale)) {
      return text;
    }

    // Match sequences of digits (with optional separators like commas, dots,
    // spaces) that appear near RTL characters.
    const numberPattern = new RegExp(
      `(\\d[\\d,.\\s]*\\d|\\d)`,
      "g",
    );

    return text.replace(numberPattern, (match) => {
      return `${BIDI_MARKS.LRI}${match}${BIDI_MARKS.PDI}`;
    });
  }

  /**
   * Wrap brand names (never-translate terms) in LTR isolates so they
   * maintain their original LTR rendering inside RTL text.
   */
  preserveBrandNames(text: string, neverTranslateTerms: string[]): string {
    if (!text || neverTranslateTerms.length === 0) {
      return text;
    }

    let result = text;

    // Sort by length descending so longer brand names match first
    // (e.g. "Shopify Plus" before "Shopify").
    const sorted = [...neverTranslateTerms].sort((a, b) => b.length - a.length);

    for (const term of sorted) {
      if (!term) continue;

      // Only wrap terms that contain LTR characters (brand names are Latin)
      if (!LTR_REGEX.test(term)) continue;

      // Escape special regex characters in the brand name
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Match the brand name as a whole word, avoiding already-wrapped terms.
      // We use a simple approach: only wrap if not immediately preceded by LRI.
      const lriEscaped = escapeForRegex(BIDI_MARKS.LRI);
      const pattern = new RegExp(`(?<!${lriEscaped})\\b${escaped}\\b`, "g");

      result = result.replace(pattern, (match) => {
        return `${BIDI_MARKS.LRI}${match}${BIDI_MARKS.PDI}`;
      });
    }

    return result;
  }

  /**
   * Analyze text to detect mixed bidirectional content.
   * Returns segment-level breakdown of directional runs.
   */
  detectMixedContent(text: string): BiDiAnalysis {
    if (!text) {
      return {
        hasRTL: false,
        hasLTR: false,
        isMixed: false,
        segments: [],
        dominantDirection: "ltr",
      };
    }

    const segments: BiDiSegment[] = [];

    // Build a regex that splits text into directional runs.
    // Each run is RTL chars, LTR chars, or neutral (digits, punctuation, spaces).
    const segmentPattern = new RegExp(
      `([${RTL_CHAR_RANGE}]+[${RTL_CHAR_RANGE}\\s]*)|([${LTR_CHAR_RANGE}]+[${LTR_CHAR_RANGE}\\s]*)|([^${RTL_CHAR_RANGE}${LTR_CHAR_RANGE}]+)`,
      "g",
    );

    let match: RegExpExecArray | null;
    while ((match = segmentPattern.exec(text)) !== null) {
      const segmentText = match[0];
      let direction: "rtl" | "ltr" | "neutral";

      if (match[1]) {
        direction = "rtl";
      } else if (match[2]) {
        direction = "ltr";
      } else {
        direction = "neutral";
      }

      segments.push({
        text: segmentText,
        direction,
        start: match.index,
        end: match.index + segmentText.length,
      });
    }

    const hasRTL = RTL_REGEX.test(text);
    const hasLTR = LTR_REGEX.test(text);

    // Determine dominant direction by counting strong characters
    let rtlCount = 0;
    let ltrCount = 0;
    for (const seg of segments) {
      if (seg.direction === "rtl") {
        rtlCount += seg.text.length;
      } else if (seg.direction === "ltr") {
        ltrCount += seg.text.length;
      }
    }

    return {
      hasRTL,
      hasLTR,
      isMixed: hasRTL && hasLTR,
      segments,
      dominantDirection: rtlCount >= ltrCount ? "rtl" : "ltr",
    };
  }
}

/**
 * Escape a string for use in a RegExp pattern.
 */
function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Singleton instance for convenience */
export const bidiPreserver = new BiDiPreserver();
