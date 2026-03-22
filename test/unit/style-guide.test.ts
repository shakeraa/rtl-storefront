import { describe, expect, it } from "vitest";

import { enforceStyleGuide } from "../../app/services/style-guide";

describe("style guide service", () => {
  it("flags banned and non-preferred terms and normalizes the text", () => {
    const result = enforceStyleGuide(
      "Grab this cheap abaya deal now!!!",
      {
        locale: "en",
        bannedTerms: [
          { term: "cheap", replacement: "accessible", reason: "it weakens premium brand voice" },
        ],
        preferredTerms: [
          { source: "deal", preferred: "offer" },
        ],
        maxExclamationMarks: 1,
      },
    );

    expect(result.compliant).toBe(false);
    expect(result.violations).toHaveLength(3);
    expect(result.normalizedText).toBe("Grab this accessible abaya offer now!");
  });

  it("returns compliant results when no rules are broken", () => {
    const result = enforceStyleGuide(
      "Discover our signature abaya collection.",
      {
        locale: "en",
        bannedTerms: [],
        preferredTerms: [],
      },
    );

    expect(result).toEqual({
      compliant: true,
      violations: [],
      normalizedText: "Discover our signature abaya collection.",
    });
  });
});
