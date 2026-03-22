/**
 * Video Subtitles Translation Service
 *
 * Handles parsing, formatting, and translation of video subtitle files
 * Supports SRT, VTT, and TTML formats with RTL language support.
 */

// ===========================================================================
// Types
// ===========================================================================

export type SubtitleFormat = "srt" | "vtt" | "ttml";

export interface SubtitleEntry {
  /** Entry index/sequence number */
  index: number;
  /** Start time in format HH:MM:SS,mmm (SRT) or HH:MM:SS.mmm (VTT) */
  startTime: string;
  /** End time in format HH:MM:SS,mmm (SRT) or HH:MM:SS.mmm (VTT) */
  endTime: string;
  /** Subtitle text content */
  text: string;
}

export interface ParsedSubtitle {
  format: SubtitleFormat;
  entries: SubtitleEntry[];
  /** TTML-specific: body ID if present */
  bodyId?: string;
  /** TTML-specific: styling information */
  styles?: Record<string, unknown>;
}

export interface TranslationOptions {
  /** Target locale code (e.g., 'ar', 'he', 'en') */
  targetLocale: string;
  /** Whether to apply RTL direction markers */
  applyRtlMarkers?: boolean;
  /** Whether to preserve original formatting */
  preserveFormatting?: boolean;
}

export interface TimestampShiftOptions {
  /** Offset in milliseconds (positive = forward, negative = backward) */
  offsetMs: number;
  /** Whether to shift only forward (prevent negative times) */
  preventNegative?: boolean;
}

// ===========================================================================
// Constants
// ===========================================================================

/** RTL language codes */
export const RTL_LOCALES = new Set(["ar", "he", "iw", "fa", "ur"]);

/** Time format regex patterns */
const SRT_TIME_PATTERN = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;
const VTT_TIME_PATTERN = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;

/** TTML namespace */
const TTML_NS = "http://www.w3.org/ns/ttml";

// ===========================================================================
// Parsing Functions
// ===========================================================================

/**
 * Parse subtitle content based on format.
 * Auto-detects format if not specified.
 */
export function parseSubtitles(
  content: string,
  format?: SubtitleFormat,
): ParsedSubtitle {
  const detectedFormat = format || detectFormat(content);

  switch (detectedFormat) {
    case "srt":
      return { format: "srt", entries: parseSRT(content) };
    case "vtt":
      return { format: "vtt", entries: parseVTT(content) };
    case "ttml":
      return parseTTML(content);
    default:
      throw new Error(`Unsupported subtitle format: ${detectedFormat}`);
  }
}

/**
 * Auto-detect subtitle format from content.
 */
export function detectFormat(content: string): SubtitleFormat {
  const trimmed = content.trim();

  if (trimmed.startsWith("WEBVTT")) {
    return "vtt";
  }

  if (trimmed.startsWith("<?xml") || trimmed.includes("<tt")) {
    return "ttml";
  }

  // SRT is the default - check for SRT-like pattern
  const srtPattern = /^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m;
  if (srtPattern.test(trimmed)) {
    return "srt";
  }

  // Default to SRT if uncertain
  return "srt";
}

/**
 * Parse SRT subtitle format.
 * SRT format:
 * 1
 * 00:00:01,000 --> 00:00:04,000
 * Hello world
 *
 * 2
 * 00:00:05,000 --> 00:00:08,000
 * Second subtitle
 */
export function parseSRT(srt: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = srt.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const index = parseInt(lines[0].trim(), 10);
    if (isNaN(index)) continue;

    const timeLine = lines[1].trim();
    const timeParts = timeLine.split(/\s*-->\s*/);
    if (timeParts.length !== 2) continue;

    const startTime = normalizeSrtTime(timeParts[0].trim());
    const endTime = normalizeSrtTime(timeParts[1].trim());
    const text = lines.slice(2).join("\n").trim();

    if (!text) continue;

    entries.push({
      index,
      startTime,
      endTime,
      text: unescapeSrtText(text),
    });
  }

  return entries;
}

/**
 * Parse WebVTT subtitle format.
 * VTT format:
 * WEBVTT
 *
 * 00:00:01.000 --> 00:00:04.000
 * Hello world
 *
 * NOTE Comments are supported
 * 00:00:05.000 --> 00:00:08.000
 * Second subtitle
 */
export function parseVTT(vtt: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];

  // Remove WEBVTT header and any header comments
  let content = vtt.replace(/^WEBVTT[^\n]*\n/, "").trim();

  // Remove region/style blocks
  content = content.replace(/REGION\s*\n[^\n]*\n/g, "");
  content = content.replace(/STYLE\s*\n(?:[^\n]*\n)*?\n/g, "");

  const blocks = content.split(/\n\s*\n/);
  let index = 1;

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    // Skip NOTE blocks and empty lines
    if (lines[0].startsWith("NOTE")) continue;

    // Find the timing line (contains "-->")
    let timingLineIndex = -1;
    let cueIdentifier: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timingLineIndex = i;
        // If timing line is not the first line, the previous line is the cue identifier
        if (i > 0 && !lines[i - 1].includes("-->")) {
          cueIdentifier = lines[i - 1].trim();
        }
        break;
      }
    }

    if (timingLineIndex === -1) continue;

    const timeLine = lines[timingLineIndex].trim();
    const timeParts = timeLine.split(/\s*-->\s*/);
    if (timeParts.length !== 2) continue;

    const startTime = normalizeVttTime(timeParts[0].trim());
    // Remove any cue settings from end time
    const endTimePart = timeParts[1].split(/\s/)[0];
    const endTime = normalizeVttTime(endTimePart);

    const text = lines.slice(timingLineIndex + 1).join("\n").trim();
    if (!text) continue;

    entries.push({
      index: cueIdentifier ? parseCueIdentifier(cueIdentifier) || index : index,
      startTime,
      endTime,
      text: unescapeVttText(text),
    });

    index++;
  }

  // Re-index entries to ensure sequential numbering
  return entries.map((entry, i) => ({ ...entry, index: i + 1 }));
}

/**
 * Parse TTML (Timed Text Markup Language) subtitle format.
 * TTML is XML-based and supports styling and positioning.
 */
export function parseTTML(ttml: string): ParsedSubtitle {
  const entries: SubtitleEntry[] = [];
  const styles: Record<string, unknown> = {};
  let bodyId: string | undefined;

  // Simple regex-based parsing for TTML
  // In production, you might want to use a proper XML parser

  // Extract body ID
  const bodyMatch = ttml.match(/<body[^>]*id="([^"]*)"[^>]*>/i);
  if (bodyMatch) {
    bodyId = bodyMatch[1];
  }

  // Extract styles
  const styleMatches = ttml.matchAll(/<style[^>]*xml:id="([^"]*)"[^>]*\/>/gi);
  for (const match of styleMatches) {
    const styleId = match[1];
    const styleAttrs: Record<string, string> = {};
    const attrMatches = match[0].matchAll(/(\w+)="([^"]*)"/g);
    for (const attr of attrMatches) {
      styleAttrs[attr[1]] = attr[2];
    }
    styles[styleId] = styleAttrs;
  }

  // Extract paragraphs (p elements)
  const pMatches = ttml.matchAll(
    /<p[^>]*begin="([^"]*)"[^>]*end="([^"]*)"[^>]*>([\s\S]*?)<\/p>/gi,
  );
  let index = 1;

  for (const match of pMatches) {
    const begin = normalizeTtmlTime(match[1]);
    const end = normalizeTtmlTime(match[2]);
    const text = match[3]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (text) {
      entries.push({
        index,
        startTime: begin,
        endTime: end,
        text: unescapeXmlText(text),
      });
      index++;
    }
  }

  return { format: "ttml", entries, bodyId, styles };
}

// ===========================================================================
// Formatting Functions
// ===========================================================================

/**
 * Format subtitle entries to specified format.
 */
export function formatSubtitles(
  subtitles: SubtitleEntry[],
  format: SubtitleFormat,
  options?: { rtl?: boolean; locale?: string },
): string {
  switch (format) {
    case "srt":
      return formatSRT(subtitles, options);
    case "vtt":
      return formatVTT(subtitles, options);
    case "ttml":
      return formatTTML(subtitles, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Format subtitle entries as SRT.
 */
export function formatSRT(
  entries: SubtitleEntry[],
  options?: { rtl?: boolean; locale?: string },
): string {
  return entries
    .map((entry) => {
      const text = options?.rtl
        ? applyRtlFormatting(entry.text, options.locale)
        : entry.text;
      // Convert VTT time format to SRT format (period to comma)
      const startTime = entry.startTime.replace(".", ",");
      const endTime = entry.endTime.replace(".", ",");
      return `${entry.index}\n${startTime} --> ${endTime}\n${escapeSrtText(text)}`;
    })
    .join("\n\n");
}

/**
 * Format subtitle entries as WebVTT.
 */
export function formatVTT(
  entries: SubtitleEntry[],
  options?: { rtl?: boolean; locale?: string },
): string {
  const cues = entries
    .map((entry) => {
      const text = options?.rtl
        ? applyRtlFormatting(entry.text, options.locale)
        : entry.text;
      // Convert SRT time format to VTT format
      const startTime = entry.startTime.replace(",", ".");
      const endTime = entry.endTime.replace(",", ".");
      return `${startTime} --> ${endTime}\n${escapeVttText(text)}`;
    })
    .join("\n\n");

  let header = "WEBVTT";
  if (options?.rtl) {
    header += "\n\nREGION\nid:rtl\nwriting-mode:rl";
  }

  return `${header}\n\n${cues}`;
}

/**
 * Format subtitle entries as TTML.
 */
export function formatTTML(
  entries: SubtitleEntry[],
  options?: { rtl?: boolean; locale?: string; bodyId?: string },
): string {
  const isRtl = options?.rtl || isRtlLocale(options?.locale);
  const dir = isRtl ? ' tts:direction="rtl"' : "";

  const bodyContent = entries
    .map((entry) => {
      const text = escapeXmlText(entry.text).replace(/\n/g, "<br/>");
      // Convert to TTML time format (can use both comma and period)
      const begin = entry.startTime.replace(",", ".");
      const end = entry.endTime.replace(",", ".");
      return `      <p begin="${begin}" end="${end}"${dir}>${text}</p>`;
    })
    .join("\n");

  const bodyIdAttr = options?.bodyId ? ` id="${options.bodyId}"` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<tt xmlns="${TTML_NS}" xml:lang="${options?.locale || "en"}">
  <head>
    <metadata/>
    <styling/>
    <layout/>
  </head>
  <body${bodyIdAttr}>
    <div>
${bodyContent}
    </div>
  </body>
</tt>`;
}

// ===========================================================================
// Translation Functions
// ===========================================================================

/**
 * Translate subtitle entries to target locale.
 * This is a mock implementation - in production, this would call a translation API.
 */
export function translateSubtitles(
  subtitles: SubtitleEntry[],
  targetLocale: string,
): SubtitleEntry[] {
  return subtitles.map((entry) => ({
    ...entry,
    text: mockTranslate(entry.text, targetLocale),
  }));
}

/**
 * Mock translation function for testing.
 * In production, replace with actual translation service.
 */
function mockTranslate(text: string, targetLocale: string): string {
  const locale = targetLocale.toLowerCase().split("-")[0];

  // Simple mock translations for testing
  const translations: Record<string, Record<string, string>> = {
    ar: {
      Hello: "مرحبا",
      "Hello world": "مرحبا بالعالم",
      "Welcome to our store": "مرحبا بكم في متجرنا",
      "Product details": "تفاصيل المنتج",
      "Add to cart": "أضف إلى السلة",
      "Buy now": "اشتر الآن",
      "Thank you": "شكرا لك",
      "Free shipping": "شحن مجاني",
      "Sale ends soon": "ينتهي البيع قريبا",
      "Limited offer": "عرض محدود",
    },
    he: {
      Hello: "שלום",
      "Hello world": "שלום עולם",
      "Welcome to our store": "ברוכים הבאים לחנות שלנו",
      "Product details": "פרטי מוצר",
      "Add to cart": "הוסף לעגלה",
      "Buy now": "קנה עכשיו",
      "Thank you": "תודה",
      "Free shipping": "משלוח חינם",
      "Sale ends soon": "המכירה מסתיימת בקרוב",
      "Limited offer": "הצעה מוגבלת",
    },
  };

  const localeDict = translations[locale];
  if (localeDict && localeDict[text]) {
    return localeDict[text];
  }

  // Return original text if no translation found
  return text;
}

// ===========================================================================
// Timestamp Functions
// ===========================================================================

/**
 * Shift all timestamps by a specified offset.
 */
export function shiftTimestamps(
  subtitles: SubtitleEntry[],
  offsetMs: number,
): SubtitleEntry[] {
  return subtitles.map((entry) => ({
    ...entry,
    startTime: shiftTime(entry.startTime, offsetMs),
    endTime: shiftTime(entry.endTime, offsetMs),
  }));
}

/**
 * Shift a single timestamp by offset.
 */
function shiftTime(time: string, offsetMs: number): string {
  const ms = timeToMilliseconds(time);
  const newMs = Math.max(0, ms + offsetMs);
  return millisecondsToTime(newMs, detectTimeFormat(time));
}

/**
 * Convert time string to milliseconds.
 */
export function timeToMilliseconds(time: string): number {
  // Handle both SRT (comma) and VTT/TTML (period) formats
  const normalized = time.replace(",", ".");
  const match = normalized.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);

  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4], 10);

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
}

/**
 * Convert milliseconds to time string.
 */
export function millisecondsToTime(
  ms: number,
  format: "srt" | "vtt" = "srt",
): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  const sep = format === "srt" ? "," : ".";

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${sep}${String(milliseconds).padStart(3, "0")}`;
}

// ===========================================================================
// RTL Support Functions
// ===========================================================================

/**
 * Check if a locale is RTL.
 */
export function isRtlLocale(locale?: string): boolean {
  if (!locale) return false;
  const baseLocale = locale.toLowerCase().split("-")[0];
  return RTL_LOCALES.has(baseLocale);
}

/**
 * Apply RTL formatting to subtitle text.
 */
export function applyRtlFormatting(text: string, locale?: string): string {
  if (!locale || !isRtlLocale(locale)) {
    return text;
  }

  // Add RTL mark (U+200F) at the start of each line for proper rendering
  const lines = text.split("\n");
  return lines.map((line) => `\u200F${line}`).join("\n");
}

/**
 * Wrap subtitle text in RTL direction markup for HTML rendering.
 */
export function wrapRtlMarkup(text: string, locale?: string): string {
  if (!locale || !isRtlLocale(locale)) {
    return text;
  }

  return `<span dir="rtl">${escapeHtml(text)}</span>`;
}

// ===========================================================================
// Utility Functions
// ===========================================================================

/**
 * Detect the format of a time string.
 */
function detectTimeFormat(time: string): "srt" | "vtt" {
  return time.includes(",") ? "srt" : "vtt";
}

/**
 * Normalize SRT time format.
 */
function normalizeSrtTime(time: string): string {
  const match = time.match(SRT_TIME_PATTERN);
  if (!match) {
    // Try to fix common issues
    const fixed = time.replace(".", ",").trim();
    if (SRT_TIME_PATTERN.test(fixed)) {
      return fixed;
    }
    throw new Error(`Invalid SRT time format: ${time}`);
  }
  return time;
}

/**
 * Normalize VTT time format.
 */
function normalizeVttTime(time: string): string {
  const match = time.match(VTT_TIME_PATTERN);
  if (!match) {
    // Try to fix SRT format
    const fixed = time.replace(",", ".").trim();
    if (VTT_TIME_PATTERN.test(fixed)) {
      return fixed;
    }
    throw new Error(`Invalid VTT time format: ${time}`);
  }
  return time;
}

/**
 * Normalize TTML time format.
 */
function normalizeTtmlTime(time: string): string {
  // TTML supports both period and comma as decimal separator
  // Keep the original format style (period or comma)
  return time;
}

/**
 * Parse cue identifier from VTT.
 */
function parseCueIdentifier(identifier: string): number | null {
  const num = parseInt(identifier, 10);
  return isNaN(num) ? null : num;
}

/**
 * Escape text for SRT format.
 */
function escapeSrtText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Unescape text from SRT format.
 */
function unescapeSrtText(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Escape text for VTT format.
 */
function escapeVttText(text: string): string {
  // VTT uses HTML entities but also has some special handling
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Unescape text from VTT format.
 */
function unescapeVttText(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Escape text for XML/TTML format.
 */
function escapeXmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Unescape text from XML/TTML format.
 */
function unescapeXmlText(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ===========================================================================
// Validation Functions
// ===========================================================================

/**
 * Validate subtitle entries for common issues.
 */
export function validateSubtitles(
  entries: SubtitleEntry[],
): Array<{ index: number; issue: string; severity: "error" | "warning" }> {
  const issues: Array<{ index: number; issue: string; severity: "error" | "warning" }> = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Check for empty text
    if (!entry.text.trim()) {
      issues.push({
        index: entry.index,
        issue: "Empty subtitle text",
        severity: "error",
      });
    }

    // Check for negative duration
    const startMs = timeToMilliseconds(entry.startTime);
    const endMs = timeToMilliseconds(entry.endTime);
    if (endMs <= startMs) {
      issues.push({
        index: entry.index,
        issue: "End time must be after start time",
        severity: "error",
      });
    }

    // Check for overlapping with previous
    if (i > 0) {
      const prevEntry = entries[i - 1];
      const prevEndMs = timeToMilliseconds(prevEntry.endTime);
      if (startMs < prevEndMs) {
        issues.push({
          index: entry.index,
          issue: "Overlaps with previous subtitle",
          severity: "warning",
        });
      }
    }

    // Check for very short duration
    if (endMs - startMs < 500) {
      issues.push({
        index: entry.index,
        issue: "Subtitle duration less than 500ms",
        severity: "warning",
      });
    }

    // Check for very long duration
    if (endMs - startMs > 7000) {
      issues.push({
        index: entry.index,
        issue: "Subtitle duration more than 7 seconds",
        severity: "warning",
      });
    }

    // Check for long text
    if (entry.text.length > 100) {
      issues.push({
        index: entry.index,
        issue: "Subtitle text very long (>100 chars)",
        severity: "warning",
      });
    }
  }

  return issues;
}

// ===========================================================================
// Export all for convenience
// ===========================================================================

export {
  SRT_TIME_PATTERN,
  VTT_TIME_PATTERN,
  TTML_NS,
  normalizeSrtTime,
  normalizeVttTime,
  normalizeTtmlTime,
};
