/**
 * Compare Versions Service
 * T0333: Translation - Compare Versions
 *
 * Provides diff and comparison utilities for translation versions,
 * enabling side-by-side review of content changes.
 */

import { TranslationVersion } from './version-history';

export type ChangeType = 'added' | 'removed' | 'unchanged';

export interface DiffLine {
  type: ChangeType;
  value: string;
  lineNumber?: number;
}

export interface VersionComparison {
  versionA: TranslationVersion;
  versionB: TranslationVersion;
  diff: DiffLine[];
  summary: {
    added: number;
    removed: number;
    unchanged: number;
    changePercent: number;
  };
  identical: boolean;
}

export interface TextDiff {
  diff: DiffLine[];
  added: number;
  removed: number;
  unchanged: number;
  changePercent: number;
}

/**
 * Computes a word-level diff between two strings.
 * Uses a simple LCS (longest common subsequence) approach on words.
 * @param oldText - Original text
 * @param newText - New text
 * @returns TextDiff object with annotated diff lines
 */
export function getDiff(oldText: string, newText: string): TextDiff {
  const oldWords = oldText.split(/\s+/).filter(Boolean);
  const newWords = newText.split(/\s+/).filter(Boolean);

  // Build LCS table
  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const diffLines: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      diffLines.unshift({ type: 'unchanged', value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffLines.unshift({ type: 'added', value: newWords[j - 1] });
      j--;
    } else {
      diffLines.unshift({ type: 'removed', value: oldWords[i - 1] });
      i--;
    }
  }

  const added = diffLines.filter((d) => d.type === 'added').length;
  const removed = diffLines.filter((d) => d.type === 'removed').length;
  const unchanged = diffLines.filter((d) => d.type === 'unchanged').length;
  const total = added + removed + unchanged;
  const changePercent = total > 0 ? Math.round(((added + removed) / total) * 100) : 0;

  return { diff: diffLines, added, removed, unchanged, changePercent };
}

/**
 * Compares two TranslationVersion objects and returns a detailed comparison.
 * @param versionA - The base version (older)
 * @param versionB - The target version (newer)
 * @returns VersionComparison with diff and summary statistics
 */
export function compareVersions(
  versionA: TranslationVersion,
  versionB: TranslationVersion
): VersionComparison {
  const textDiff = getDiff(versionA.content, versionB.content);
  const identical = versionA.content === versionB.content;

  return {
    versionA,
    versionB,
    diff: textDiff.diff,
    summary: {
      added: textDiff.added,
      removed: textDiff.removed,
      unchanged: textDiff.unchanged,
      changePercent: textDiff.changePercent,
    },
    identical,
  };
}

/**
 * Returns a human-readable summary of changes between two texts.
 * @param oldText - Original text
 * @param newText - Modified text
 * @returns Summary string
 */
export function summarizeChanges(oldText: string, newText: string): string {
  const { added, removed, changePercent } = getDiff(oldText, newText);

  if (added === 0 && removed === 0) {
    return 'No changes detected';
  }

  const parts: string[] = [];
  if (added > 0) parts.push(`${added} word${added > 1 ? 's' : ''} added`);
  if (removed > 0) parts.push(`${removed} word${removed > 1 ? 's' : ''} removed`);
  parts.push(`${changePercent}% changed`);

  return parts.join(', ');
}

/**
 * Checks if two versions are from the same resource.
 */
export function isSameResource(
  versionA: TranslationVersion,
  versionB: TranslationVersion
): boolean {
  return (
    versionA.shop === versionB.shop &&
    versionA.resourceId === versionB.resourceId &&
    versionA.locale === versionB.locale
  );
}
