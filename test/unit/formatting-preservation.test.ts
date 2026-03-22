import { describe, expect, it } from "vitest";

import {
  preserveHTMLFormatting,
  preserveMarkdown,
  restoreHTMLFormatting,
  restoreMarkdown,
} from "../../app/services/translation-formatting";

describe("formatting preservation service", () => {
  it("preserves and restores HTML tags", () => {
    const source = "<p>Hello <strong>world</strong></p>";
    const { text, placeholders } = preserveHTMLFormatting(source);

    expect(text).not.toContain("<p>");
    expect(text).not.toContain("<strong>");
    expect(placeholders.size).toBe(4);
    expect(restoreHTMLFormatting(text, placeholders)).toBe(source);
  });

  it("preserves and restores markdown syntax", () => {
    const source = "**Bold** text with [link](https://example.com) and `code`";
    const { text, placeholders } = preserveMarkdown(source);

    expect(text).not.toContain("**Bold**");
    expect(text).not.toContain("[link](https://example.com)");
    expect(text).not.toContain("`code`");
    expect(placeholders.size).toBe(3);
    expect(restoreMarkdown(text, placeholders)).toBe(source);
  });
});
