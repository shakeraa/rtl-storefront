import { describe, expect, it } from "vitest";

import {
  countEmojis,
  hasEmojis,
  preserveEmojis,
  restoreEmojis,
} from "../../app/services/translation-formatting";

describe("emoji handling service", () => {
  it("detects and counts emojis in translated text", () => {
    const text = "New arrivals ✨😊";

    expect(hasEmojis(text)).toBe(true);
    expect(countEmojis(text)).toBe(2);
  });

  it("preserves and restores emoji placeholders", () => {
    const source = "Shop now 🔥 and save 🎉";
    const { text, emojiMap } = preserveEmojis(source);

    expect(text).not.toContain("🔥");
    expect(text).not.toContain("🎉");
    expect(emojiMap.size).toBe(2);
    expect(restoreEmojis(text, emojiMap)).toBe(source);
  });
});
