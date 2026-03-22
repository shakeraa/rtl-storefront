import { calculateSimilarity, normalizeForMatching } from "../translation-memory/matcher";

export interface DuplicateContentMatch {
  existingText: string;
  similarity: number;
  risk: "low" | "medium" | "high";
}

export interface DuplicateContentReport {
  candidateText: string;
  matches: DuplicateContentMatch[];
  highestSimilarity: number;
  flagged: boolean;
}

export function detectDuplicateContent(
  candidateText: string,
  existingTexts: string[],
  options: { threshold?: number; maxMatches?: number } = {},
): DuplicateContentReport {
  const threshold = options.threshold ?? 0.75;
  const maxMatches = options.maxMatches ?? 5;
  const normalizedCandidate = normalizeForMatching(candidateText);

  if (normalizedCandidate.length === 0) {
    return {
      candidateText,
      matches: [],
      highestSimilarity: 0,
      flagged: false,
    };
  }

  const matches = existingTexts
    .map((existingText) => {
      const similarity = calculateSimilarity(
        normalizedCandidate,
        normalizeForMatching(existingText),
      );

      return {
        existingText,
        similarity,
        risk: getDuplicateRisk(similarity),
      } satisfies DuplicateContentMatch;
    })
    .filter((match) => match.similarity >= threshold)
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, maxMatches);

  return {
    candidateText,
    matches,
    highestSimilarity: matches[0]?.similarity ?? 0,
    flagged: matches.length > 0,
  };
}

export function getDuplicateRisk(similarity: number): DuplicateContentMatch["risk"] {
  if (similarity >= 0.95) return "high";
  if (similarity >= 0.85) return "medium";
  return "low";
}
