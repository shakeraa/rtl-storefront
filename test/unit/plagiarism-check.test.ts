import { describe, expect, it } from "vitest";

import {
  detectDuplicateContent,
  getDuplicateRisk,
} from "../../app/services/plagiarism-check";

describe("plagiarism check service", () => {
  it("flags highly similar duplicate content", () => {
    const report = detectDuplicateContent(
      "Elegant summer dress with floral pattern",
      [
        "Elegant summer dress with floral pattern",
        "Winter jacket with quilted lining",
      ],
    );

    expect(report.flagged).toBe(true);
    expect(report.highestSimilarity).toBe(1);
    expect(report.matches[0]).toEqual({
      existingText: "Elegant summer dress with floral pattern",
      similarity: 1,
      risk: "high",
    });
  });

  it("filters out unrelated content below the threshold", () => {
    const report = detectDuplicateContent(
      "Minimal leather wallet",
      [
        "Noise cancelling headphones",
        "Ceramic coffee mug",
      ],
      { threshold: 0.8 },
    );

    expect(report).toEqual({
      candidateText: "Minimal leather wallet",
      matches: [],
      highestSimilarity: 0,
      flagged: false,
    });
  });

  it("caps the number of duplicate matches returned", () => {
    const report = detectDuplicateContent(
      "Premium cotton shirt",
      [
        "Premium cotton shirt",
        "Premium cotton shirts",
        "Premium cotton tee",
      ],
      { threshold: 0.7, maxMatches: 2 },
    );

    expect(report.matches).toHaveLength(2);
    expect(report.matches[0].similarity).toBeGreaterThanOrEqual(report.matches[1].similarity);
  });

  it("classifies duplicate risk bands", () => {
    expect(getDuplicateRisk(0.97)).toBe("high");
    expect(getDuplicateRisk(0.88)).toBe("medium");
    expect(getDuplicateRisk(0.77)).toBe("low");
  });
});
