/**
 * Brand Voice Preservation Service (T0387)
 * Creates and manages Brand Voice DNA profiles for consistent translations.
 */

export interface BrandVoiceProfile {
  id: string;
  shop: string;
  formality: number;        // 1-10
  technicalDepth: number;   // 1-10
  humor: number;            // 1-10
  luxuryPositioning: number;// 1-10
  targetAgeMin: number;
  targetAgeMax: number;
  personalityKeywords: string[];
  lockedPhrases: Record<string, string>; // original -> keep-as-is
  perLocaleOverrides: Record<string, Partial<Pick<BrandVoiceProfile, 'formality' | 'technicalDepth' | 'humor' | 'luxuryPositioning'>>>;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceAnalysisResult {
  formality: number;
  technicalDepth: number;
  humor: number;
  luxuryPositioning: number;
  detectedKeywords: string[];
  sampleSentences: string[];
  confidence: number;
}

export interface ConsistencyCheck {
  score: number;            // 0-100
  issues: ConsistencyIssue[];
  passed: boolean;
}

export interface ConsistencyIssue {
  type: 'formality_mismatch' | 'tone_shift' | 'vocabulary_deviation' | 'locked_phrase_missing';
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

// In-memory store (production: Prisma)
const profiles = new Map<string, BrandVoiceProfile>();

export function createProfile(shop: string, analysis: VoiceAnalysisResult): BrandVoiceProfile {
  const profile: BrandVoiceProfile = {
    id: `bv_${shop}_${Date.now()}`,
    shop,
    formality: analysis.formality,
    technicalDepth: analysis.technicalDepth,
    humor: analysis.humor,
    luxuryPositioning: analysis.luxuryPositioning,
    targetAgeMin: 18,
    targetAgeMax: 65,
    personalityKeywords: analysis.detectedKeywords,
    lockedPhrases: {},
    perLocaleOverrides: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  profiles.set(shop, profile);
  return profile;
}

export function getProfile(shop: string): BrandVoiceProfile | null {
  return profiles.get(shop) ?? null;
}

export function updateProfile(shop: string, updates: Partial<BrandVoiceProfile>): BrandVoiceProfile | null {
  const existing = profiles.get(shop);
  if (!existing) return null;
  const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  profiles.set(shop, updated);
  return updated;
}

export function addLockedPhrase(shop: string, original: string, preserved: string): boolean {
  const profile = profiles.get(shop);
  if (!profile) return false;
  profile.lockedPhrases[original] = preserved;
  profile.updatedAt = new Date().toISOString();
  return true;
}

export function removeLockedPhrase(shop: string, original: string): boolean {
  const profile = profiles.get(shop);
  if (!profile) return false;
  delete profile.lockedPhrases[original];
  profile.updatedAt = new Date().toISOString();
  return true;
}

export function setLocaleOverride(shop: string, locale: string, overrides: Partial<Pick<BrandVoiceProfile, 'formality' | 'technicalDepth' | 'humor' | 'luxuryPositioning'>>): boolean {
  const profile = profiles.get(shop);
  if (!profile) return false;
  profile.perLocaleOverrides[locale] = overrides;
  profile.updatedAt = new Date().toISOString();
  return true;
}

export function getEffectiveVoice(shop: string, locale?: string): Pick<BrandVoiceProfile, 'formality' | 'technicalDepth' | 'humor' | 'luxuryPositioning'> | null {
  const profile = profiles.get(shop);
  if (!profile) return null;
  const base = { formality: profile.formality, technicalDepth: profile.technicalDepth, humor: profile.humor, luxuryPositioning: profile.luxuryPositioning };
  if (locale && profile.perLocaleOverrides[locale]) {
    return { ...base, ...profile.perLocaleOverrides[locale] };
  }
  return base;
}

export function analyzeText(texts: string[]): VoiceAnalysisResult {
  // Analyze formality: long sentences + complex words = more formal
  const avgLength = texts.reduce((s, t) => s + t.split(/\s+/).length, 0) / Math.max(texts.length, 1);
  const formality = Math.min(10, Math.max(1, Math.round(avgLength / 5)));

  // Detect keywords from content
  const allWords = texts.join(' ').toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();
  for (const w of allWords) {
    if (w.length > 4) wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
  }
  const detectedKeywords = [...wordFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);

  return {
    formality,
    technicalDepth: Math.min(10, Math.max(1, Math.round(formality * 0.8))),
    humor: Math.min(10, Math.max(1, 5 - Math.floor(formality / 3))),
    luxuryPositioning: Math.min(10, Math.max(1, Math.round(formality * 0.6 + 2))),
    detectedKeywords,
    sampleSentences: texts.slice(0, 3),
    confidence: texts.length >= 3 ? 0.85 : texts.length >= 1 ? 0.5 : 0,
  };
}

export function checkConsistency(text: string, profile: BrandVoiceProfile): ConsistencyCheck {
  const issues: ConsistencyIssue[] = [];

  // Check locked phrases
  for (const [original, preserved] of Object.entries(profile.lockedPhrases)) {
    if (text.includes(original) && !text.includes(preserved) && original !== preserved) {
      issues.push({
        type: 'locked_phrase_missing',
        description: `Locked phrase "${preserved}" not found (original: "${original}")`,
        severity: 'high',
        suggestion: `Replace "${original}" with "${preserved}"`,
      });
    }
  }

  // Check formality (simple heuristic: sentence length)
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?。]+/).filter(Boolean).length;
  const avgSentenceLength = sentences > 0 ? words / sentences : words;
  const textFormality = Math.min(10, Math.round(avgSentenceLength / 4));

  if (Math.abs(textFormality - profile.formality) > 3) {
    issues.push({
      type: 'formality_mismatch',
      description: `Text formality (${textFormality}) differs from brand voice (${profile.formality})`,
      severity: 'medium',
      suggestion: profile.formality > textFormality ? 'Use longer, more complex sentences' : 'Use shorter, simpler sentences',
    });
  }

  const score = Math.max(0, 100 - issues.length * 20);
  return { score, issues, passed: issues.length === 0 };
}

export function deleteProfile(shop: string): boolean {
  return profiles.delete(shop);
}

// Clear all profiles (for testing)
export function clearProfiles(): void {
  profiles.clear();
}
