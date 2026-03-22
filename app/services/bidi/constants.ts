export const BIDI_MARKS = {
  /** Left-to-Right Mark */
  LRM: "\u200E",
  /** Right-to-Left Mark */
  RLM: "\u200F",
  /** Left-to-Right Embedding */
  LRE: "\u202A",
  /** Right-to-Left Embedding */
  RLE: "\u202B",
  /** Pop Directional Formatting */
  PDF: "\u202C",
  /** Left-to-Right Override */
  LRO: "\u202D",
  /** Right-to-Left Override */
  RLO: "\u202E",
  /** Left-to-Right Isolate */
  LRI: "\u2066",
  /** Right-to-Left Isolate */
  RLI: "\u2067",
  /** First Strong Isolate */
  FSI: "\u2068",
  /** Pop Directional Isolate */
  PDI: "\u2069",
} as const;

/** Arabic Unicode block range */
export const ARABIC_RANGE = "\u0600-\u06FF";

/** Hebrew Unicode block range */
export const HEBREW_RANGE = "\u0590-\u05FF";

/** Combined RTL character range for regex patterns */
export const RTL_CHAR_RANGE = `${ARABIC_RANGE}${HEBREW_RANGE}`;

/** Latin character range for regex patterns */
export const LTR_CHAR_RANGE = "a-zA-Z";

/** Regex matching RTL characters */
export const RTL_REGEX = new RegExp(`[${RTL_CHAR_RANGE}]`);

/** Regex matching LTR characters */
export const LTR_REGEX = new RegExp(`[${LTR_CHAR_RANGE}]`);

/** Email pattern - simple but safe */
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** URL pattern - http(s):// and www. */
export const URL_REGEX = /(?:https?:\/\/|www\.)[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g;
