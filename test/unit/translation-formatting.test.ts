import { describe, it, expect } from "vitest";
import {
  checkCharacterLimit,
  truncateText,
  DEFAULT_LIMITS,
  preserveHTMLFormatting,
  restoreHTMLFormatting,
  preserveMarkdown,
  restoreMarkdown,
  hasEmojis,
  countEmojis,
  preserveEmojis,
  restoreEmojis,
  preserveSpecialChars,
  restoreSpecialChars,
  extractUrls,
  protectUrls,
  restoreUrls,
  extractEmails,
  protectEmails,
  restoreEmails,
} from "../../app/services/translation-formatting";

// -----------------------------------------------------------------------
// T0307 - Character Limits
// -----------------------------------------------------------------------

describe("T0307 — Character Limits", () => {
  it("reports within limit for short text", () => {
    const result = checkCharacterLimit("Hello", "meta_title");
    expect(result.withinLimit).toBe(true);
    expect(result.length).toBe(5);
    expect(result.max).toBe(60);
    expect(result.warning).toBe(false);
  });

  it("triggers warning above warningLength", () => {
    const text = "A".repeat(55);
    const result = checkCharacterLimit(text, "meta_title");
    expect(result.withinLimit).toBe(true);
    expect(result.warning).toBe(true);
  });

  it("reports over limit when exceeding maxLength", () => {
    const text = "A".repeat(65);
    const result = checkCharacterLimit(text, "meta_title");
    expect(result.withinLimit).toBe(false);
    expect(result.warning).toBe(true);
  });

  it("returns Infinity for unknown fields", () => {
    const result = checkCharacterLimit("text", "unknown_field");
    expect(result.withinLimit).toBe(true);
    expect(result.max).toBe(Infinity);
  });

  it("meta_description has max 160", () => {
    expect(DEFAULT_LIMITS.meta_description.maxLength).toBe(160);
  });

  it("product_title has max 255", () => {
    expect(DEFAULT_LIMITS.product_title.maxLength).toBe(255);
  });

  it("alt_text has max 125", () => {
    expect(DEFAULT_LIMITS.alt_text.maxLength).toBe(125);
  });

  // Truncation
  it("truncateText returns text unchanged when within limit", () => {
    expect(truncateText("Hello", 10, "ellipsis")).toBe("Hello");
  });

  it("truncateText ellipsis adds \u2026 at maxLength", () => {
    const result = truncateText("Hello World!", 8, "ellipsis");
    expect(result.length).toBeLessThanOrEqual(8);
    expect(result).toContain("\u2026");
  });

  it("truncateText word_break breaks at word boundary when possible", () => {
    const result = truncateText("Hello World This Is A Longer Text", 20, "word_break");
    expect(result).toContain("\u2026");
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("truncateText sentence_break breaks at sentence end", () => {
    const text = "First sentence. Second sentence. Third sentence is much longer here.";
    const result = truncateText(text, 40, "sentence_break");
    expect(result).toMatch(/\.$/);
  });
});

// -----------------------------------------------------------------------
// T0308 - Formatting Preservation
// -----------------------------------------------------------------------

describe("T0308 — HTML Formatting Preservation", () => {
  it("replaces HTML tags with placeholders", () => {
    const { text, placeholders } = preserveHTMLFormatting("<b>Hello</b> world");
    expect(text).not.toContain("<b>");
    expect(text).not.toContain("</b>");
    expect(text).toContain("Hello");
    expect(text).toContain("world");
    expect(placeholders.size).toBe(2);
  });

  it("restores HTML tags from placeholders", () => {
    const { text, placeholders } = preserveHTMLFormatting("<p>Test</p>");
    const restored = restoreHTMLFormatting(text, placeholders);
    expect(restored).toBe("<p>Test</p>");
  });

  it("handles nested HTML tags", () => {
    const html = "<div><span>Hello</span></div>";
    const { text, placeholders } = preserveHTMLFormatting(html);
    const restored = restoreHTMLFormatting(text, placeholders);
    expect(restored).toBe(html);
  });

  it("handles self-closing tags", () => {
    const html = "Line 1<br/>Line 2";
    const { text, placeholders } = preserveHTMLFormatting(html);
    expect(placeholders.size).toBe(1);
    const restored = restoreHTMLFormatting(text, placeholders);
    expect(restored).toBe(html);
  });
});

describe("T0308 — Markdown Preservation", () => {
  it("replaces bold markdown with placeholders", () => {
    const { text, placeholders } = preserveMarkdown("This is **bold** text");
    expect(text).not.toContain("**bold**");
    expect(placeholders.size).toBeGreaterThanOrEqual(1);
  });

  it("restores markdown from placeholders", () => {
    const md = "This is **bold** text";
    const { text, placeholders } = preserveMarkdown(md);
    const restored = restoreMarkdown(text, placeholders);
    expect(restored).toBe(md);
  });

  it("handles links", () => {
    const md = "Click [here](https://example.com) now";
    const { text, placeholders } = preserveMarkdown(md);
    const restored = restoreMarkdown(text, placeholders);
    expect(restored).toBe(md);
  });
});

// -----------------------------------------------------------------------
// T0309 - Emoji Handling
// -----------------------------------------------------------------------

describe("T0309 — Emoji Handling", () => {
  it("detects emojis in text", () => {
    expect(hasEmojis("Hello \ud83d\ude00 World")).toBe(true);
    expect(hasEmojis("No emojis here")).toBe(false);
  });

  it("counts emojis correctly", () => {
    expect(countEmojis("Hello \ud83d\ude00\ud83d\ude01\ud83d\ude02")).toBe(3);
    expect(countEmojis("No emojis")).toBe(0);
  });

  it("preserves and restores emojis", () => {
    const original = "Sale \ud83d\udd25 50% off \ud83c\udf89";
    const { text, emojiMap } = preserveEmojis(original);
    expect(text).not.toContain("\ud83d\udd25");
    expect(text).not.toContain("\ud83c\udf89");
    const restored = restoreEmojis(text, emojiMap);
    expect(restored).toBe(original);
  });

  it("handles text without emojis", () => {
    const original = "No emojis here";
    const { text, emojiMap } = preserveEmojis(original);
    expect(text).toBe(original);
    expect(emojiMap.size).toBe(0);
  });
});

// -----------------------------------------------------------------------
// T0310 - Special Characters
// -----------------------------------------------------------------------

describe("T0310 — Special Characters", () => {
  it("preserves trademark symbol", () => {
    const original = "Brand\u2122 Product";
    const { text, charMap } = preserveSpecialChars(original);
    expect(text).not.toContain("\u2122");
    const restored = restoreSpecialChars(text, charMap);
    expect(restored).toBe(original);
  });

  it("preserves copyright and registered symbols", () => {
    const original = "\u00a9 2026 Company\u00ae";
    const { text, charMap } = preserveSpecialChars(original);
    expect(charMap.size).toBe(2);
    const restored = restoreSpecialChars(text, charMap);
    expect(restored).toBe(original);
  });

  it("preserves currency symbols", () => {
    const original = "Price: \u20ac100 or \u00a350";
    const { text, charMap } = preserveSpecialChars(original);
    const restored = restoreSpecialChars(text, charMap);
    expect(restored).toBe(original);
  });

  it("handles text without special chars", () => {
    const { charMap } = preserveSpecialChars("Plain text");
    expect(charMap.size).toBe(0);
  });
});

// -----------------------------------------------------------------------
// T0311 - URL Preservation
// -----------------------------------------------------------------------

describe("T0311 — URL Preservation", () => {
  it("extracts URLs with positions", () => {
    const text = "Visit https://example.com for more";
    const urls = extractUrls(text);
    expect(urls).toHaveLength(1);
    expect(urls[0].url).toBe("https://example.com");
    expect(urls[0].position).toBe(6);
  });

  it("extracts multiple URLs", () => {
    const text = "See https://a.com and http://b.com/path";
    const urls = extractUrls(text);
    expect(urls).toHaveLength(2);
  });

  it("protects and restores URLs", () => {
    const original = "Visit https://shop.com/products?id=123 today";
    const { text, urls } = protectUrls(original);
    expect(text).not.toContain("https://");
    const restored = restoreUrls(text, urls);
    expect(restored).toBe(original);
  });

  it("handles text without URLs", () => {
    const { urls } = protectUrls("No URLs here");
    expect(urls.size).toBe(0);
  });
});

// -----------------------------------------------------------------------
// T0312 - Email Preservation
// -----------------------------------------------------------------------

describe("T0312 — Email Preservation", () => {
  it("extracts email addresses", () => {
    const emails = extractEmails("Contact us at info@example.com or sales@shop.co");
    expect(emails).toHaveLength(2);
    expect(emails).toContain("info@example.com");
    expect(emails).toContain("sales@shop.co");
  });

  it("protects and restores emails", () => {
    const original = "Email support@store.com for help";
    const { text, emails } = protectEmails(original);
    expect(text).not.toContain("support@store.com");
    const restored = restoreEmails(text, emails);
    expect(restored).toBe(original);
  });

  it("handles text without emails", () => {
    const emails = extractEmails("No emails here");
    expect(emails).toHaveLength(0);
  });
});
