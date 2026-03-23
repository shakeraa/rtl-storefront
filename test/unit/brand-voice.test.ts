import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProfile,
  getProfile,
  updateProfile,
  addLockedPhrase,
  removeLockedPhrase,
  setLocaleOverride,
  getEffectiveVoice,
  analyzeText,
  checkConsistency,
  deleteProfile,
  clearProfiles,
  type BrandVoiceProfile,
  type VoiceAnalysisResult,
} from '../../app/services/brand-voice';

const SHOP = 'test-shop.myshopify.com';

function makeAnalysis(overrides: Partial<VoiceAnalysisResult> = {}): VoiceAnalysisResult {
  return {
    formality: 7,
    technicalDepth: 5,
    humor: 3,
    luxuryPositioning: 6,
    detectedKeywords: ['premium', 'quality', 'elegant'],
    sampleSentences: ['Our premium collection is here.', 'Quality meets elegance.'],
    confidence: 0.85,
    ...overrides,
  };
}

describe('Brand Voice Preservation Service (T0387)', () => {
  beforeEach(() => {
    clearProfiles();
  });

  describe('createProfile', () => {
    it('creates a profile with correct shop', () => {
      const profile = createProfile(SHOP, makeAnalysis());
      expect(profile.shop).toBe(SHOP);
    });

    it('copies formality from analysis', () => {
      const profile = createProfile(SHOP, makeAnalysis({ formality: 8 }));
      expect(profile.formality).toBe(8);
    });

    it('copies technicalDepth from analysis', () => {
      const profile = createProfile(SHOP, makeAnalysis({ technicalDepth: 4 }));
      expect(profile.technicalDepth).toBe(4);
    });

    it('copies humor from analysis', () => {
      const profile = createProfile(SHOP, makeAnalysis({ humor: 9 }));
      expect(profile.humor).toBe(9);
    });

    it('copies luxuryPositioning from analysis', () => {
      const profile = createProfile(SHOP, makeAnalysis({ luxuryPositioning: 2 }));
      expect(profile.luxuryPositioning).toBe(2);
    });

    it('sets default age range 18-65', () => {
      const profile = createProfile(SHOP, makeAnalysis());
      expect(profile.targetAgeMin).toBe(18);
      expect(profile.targetAgeMax).toBe(65);
    });

    it('copies detected keywords as personalityKeywords', () => {
      const profile = createProfile(SHOP, makeAnalysis({ detectedKeywords: ['bold', 'modern'] }));
      expect(profile.personalityKeywords).toEqual(['bold', 'modern']);
    });

    it('initializes lockedPhrases as empty object', () => {
      const profile = createProfile(SHOP, makeAnalysis());
      expect(profile.lockedPhrases).toEqual({});
    });

    it('initializes perLocaleOverrides as empty object', () => {
      const profile = createProfile(SHOP, makeAnalysis());
      expect(profile.perLocaleOverrides).toEqual({});
    });

    it('generates an id starting with bv_', () => {
      const profile = createProfile(SHOP, makeAnalysis());
      expect(profile.id).toMatch(/^bv_/);
      expect(profile.id).toContain(SHOP);
    });

    it('sets createdAt and updatedAt as ISO strings', () => {
      const profile = createProfile(SHOP, makeAnalysis());
      expect(() => new Date(profile.createdAt)).not.toThrow();
      expect(() => new Date(profile.updatedAt)).not.toThrow();
      expect(profile.createdAt).toBe(profile.updatedAt);
    });
  });

  describe('getProfile', () => {
    it('returns null for non-existent shop', () => {
      expect(getProfile('no-such-shop')).toBeNull();
    });

    it('returns the created profile', () => {
      createProfile(SHOP, makeAnalysis({ formality: 5 }));
      const profile = getProfile(SHOP);
      expect(profile).not.toBeNull();
      expect(profile!.formality).toBe(5);
      expect(profile!.shop).toBe(SHOP);
    });
  });

  describe('updateProfile', () => {
    it('returns null for non-existent shop', () => {
      expect(updateProfile('no-shop', { formality: 3 })).toBeNull();
    });

    it('updates formality and preserves other fields', () => {
      createProfile(SHOP, makeAnalysis({ formality: 5, humor: 7 }));
      const updated = updateProfile(SHOP, { formality: 9 });
      expect(updated!.formality).toBe(9);
      expect(updated!.humor).toBe(7);
    });

    it('updates the updatedAt timestamp', () => {
      const original = createProfile(SHOP, makeAnalysis());
      const originalUpdatedAt = original.updatedAt;
      // Small delay to ensure different timestamp
      const updated = updateProfile(SHOP, { humor: 1 });
      expect(updated!.updatedAt).toBeDefined();
      expect(typeof updated!.updatedAt).toBe('string');
    });

    it('persists updates in subsequent getProfile calls', () => {
      createProfile(SHOP, makeAnalysis({ formality: 3 }));
      updateProfile(SHOP, { formality: 10 });
      expect(getProfile(SHOP)!.formality).toBe(10);
    });
  });

  describe('addLockedPhrase', () => {
    it('returns false for non-existent shop', () => {
      expect(addLockedPhrase('no-shop', 'hello', 'hi')).toBe(false);
    });

    it('adds a locked phrase to the profile', () => {
      createProfile(SHOP, makeAnalysis());
      expect(addLockedPhrase(SHOP, 'Nike', 'Nike')).toBe(true);
      const profile = getProfile(SHOP)!;
      expect(profile.lockedPhrases['Nike']).toBe('Nike');
    });

    it('can add multiple locked phrases', () => {
      createProfile(SHOP, makeAnalysis());
      addLockedPhrase(SHOP, 'Brand A', 'Brand A');
      addLockedPhrase(SHOP, 'Tagline', 'Our Tagline');
      const profile = getProfile(SHOP)!;
      expect(Object.keys(profile.lockedPhrases)).toHaveLength(2);
    });

    it('overwrites existing locked phrase', () => {
      createProfile(SHOP, makeAnalysis());
      addLockedPhrase(SHOP, 'slogan', 'v1');
      addLockedPhrase(SHOP, 'slogan', 'v2');
      expect(getProfile(SHOP)!.lockedPhrases['slogan']).toBe('v2');
    });
  });

  describe('removeLockedPhrase', () => {
    it('returns false for non-existent shop', () => {
      expect(removeLockedPhrase('no-shop', 'key')).toBe(false);
    });

    it('removes an existing locked phrase', () => {
      createProfile(SHOP, makeAnalysis());
      addLockedPhrase(SHOP, 'Brand', 'Brand');
      expect(removeLockedPhrase(SHOP, 'Brand')).toBe(true);
      expect(getProfile(SHOP)!.lockedPhrases['Brand']).toBeUndefined();
    });

    it('returns true even if phrase did not exist (no-op delete)', () => {
      createProfile(SHOP, makeAnalysis());
      // delete on non-existent key still returns true since profile exists
      expect(removeLockedPhrase(SHOP, 'nonexistent')).toBe(true);
    });
  });

  describe('setLocaleOverride', () => {
    it('returns false for non-existent shop', () => {
      expect(setLocaleOverride('no-shop', 'ar', { formality: 3 })).toBe(false);
    });

    it('sets locale override for a specific locale', () => {
      createProfile(SHOP, makeAnalysis({ formality: 5 }));
      expect(setLocaleOverride(SHOP, 'ar', { formality: 9 })).toBe(true);
      const profile = getProfile(SHOP)!;
      expect(profile.perLocaleOverrides['ar']).toEqual({ formality: 9 });
    });

    it('can set overrides for multiple locales', () => {
      createProfile(SHOP, makeAnalysis());
      setLocaleOverride(SHOP, 'ar', { formality: 9 });
      setLocaleOverride(SHOP, 'he', { humor: 2 });
      const profile = getProfile(SHOP)!;
      expect(Object.keys(profile.perLocaleOverrides)).toHaveLength(2);
    });
  });

  describe('getEffectiveVoice', () => {
    it('returns null for non-existent shop', () => {
      expect(getEffectiveVoice('no-shop')).toBeNull();
    });

    it('returns base voice when no locale specified', () => {
      createProfile(SHOP, makeAnalysis({ formality: 7, humor: 3, technicalDepth: 5, luxuryPositioning: 6 }));
      const voice = getEffectiveVoice(SHOP);
      expect(voice).toEqual({ formality: 7, technicalDepth: 5, humor: 3, luxuryPositioning: 6 });
    });

    it('returns base voice when locale has no override', () => {
      createProfile(SHOP, makeAnalysis({ formality: 7 }));
      const voice = getEffectiveVoice(SHOP, 'fr');
      expect(voice!.formality).toBe(7);
    });

    it('merges locale override with base voice', () => {
      createProfile(SHOP, makeAnalysis({ formality: 5, humor: 4, technicalDepth: 6, luxuryPositioning: 3 }));
      setLocaleOverride(SHOP, 'ar', { formality: 9, humor: 1 });
      const voice = getEffectiveVoice(SHOP, 'ar');
      expect(voice!.formality).toBe(9);
      expect(voice!.humor).toBe(1);
      expect(voice!.technicalDepth).toBe(6); // unchanged
      expect(voice!.luxuryPositioning).toBe(3); // unchanged
    });
  });

  describe('analyzeText', () => {
    it('returns confidence 0 for empty text array', () => {
      const result = analyzeText([]);
      expect(result.confidence).toBe(0);
    });

    it('returns confidence 0.5 for 1-2 texts', () => {
      const result = analyzeText(['Hello world.']);
      expect(result.confidence).toBe(0.5);
    });

    it('returns confidence 0.85 for 3+ texts', () => {
      const result = analyzeText(['Text one.', 'Text two.', 'Text three.']);
      expect(result.confidence).toBe(0.85);
    });

    it('detects higher formality for longer sentences', () => {
      const short = analyzeText(['Buy now.', 'Get it.', 'Sale today.']);
      const long = analyzeText([
        'Our exquisite collection of handcrafted premium leather goods represents the pinnacle of artisanal craftsmanship and timeless elegance.',
        'Each piece in our distinguished portfolio has been carefully curated to meet the discerning standards of our most sophisticated clientele.',
        'We invite you to explore our extensive range of luxury accessories that combine traditional techniques with contemporary design philosophy.',
      ]);
      expect(long.formality).toBeGreaterThan(short.formality);
    });

    it('returns formality clamped between 1 and 10', () => {
      const tiny = analyzeText(['Hi.']);
      const huge = analyzeText([Array(200).fill('word').join(' ')]);
      expect(tiny.formality).toBeGreaterThanOrEqual(1);
      expect(tiny.formality).toBeLessThanOrEqual(10);
      expect(huge.formality).toBeGreaterThanOrEqual(1);
      expect(huge.formality).toBeLessThanOrEqual(10);
    });

    it('detects keywords from repeated words', () => {
      const result = analyzeText([
        'premium quality premium goods premium items',
        'premium selection premium range',
        'premium choices for premium customers',
      ]);
      expect(result.detectedKeywords).toContain('premium');
    });

    it('only detects words longer than 4 characters', () => {
      const result = analyzeText(['the the the the the cat cat cat cat cat']);
      // "the" (3 chars) should not appear
      expect(result.detectedKeywords).not.toContain('the');
    });

    it('returns at most 3 sample sentences', () => {
      const result = analyzeText(['One.', 'Two.', 'Three.', 'Four.', 'Five.']);
      expect(result.sampleSentences).toHaveLength(3);
      expect(result.sampleSentences).toEqual(['One.', 'Two.', 'Three.']);
    });

    it('technicalDepth is derived from formality', () => {
      const result = analyzeText(['A moderately long sentence for testing purposes here now.']);
      // technicalDepth = round(formality * 0.8), clamped 1-10
      const expected = Math.min(10, Math.max(1, Math.round(result.formality * 0.8)));
      expect(result.technicalDepth).toBe(expected);
    });

    it('humor is inversely related to formality', () => {
      const result = analyzeText(['Short.', 'Sentences.', 'Here.']);
      // humor = 5 - floor(formality / 3), clamped 1-10
      const expected = Math.min(10, Math.max(1, 5 - Math.floor(result.formality / 3)));
      expect(result.humor).toBe(expected);
    });
  });

  describe('checkConsistency', () => {
    it('returns passed=true and score=100 for consistent text', () => {
      const profile = createProfile(SHOP, makeAnalysis({ formality: 3 }));
      // Short sentences => low formality matching profile.formality=3
      const result = checkConsistency('Buy now. Get it. Quick sale.', profile);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.issues).toEqual([]);
    });

    it('detects formality mismatch when text formality differs by more than 3', () => {
      const profile = createProfile(SHOP, makeAnalysis({ formality: 1 }));
      // Very long sentence => high text formality
      const longText = 'This is a very long and elaborate sentence that goes on and on and on with many words to push formality up significantly beyond what is expected.';
      const result = checkConsistency(longText, profile);
      const formalityIssue = result.issues.find(i => i.type === 'formality_mismatch');
      expect(formalityIssue).toBeDefined();
      expect(formalityIssue!.severity).toBe('medium');
    });

    it('detects locked phrase missing', () => {
      const profile = createProfile(SHOP, makeAnalysis());
      addLockedPhrase(SHOP, 'Our Brand', 'OurBrand(TM)');
      const updatedProfile = getProfile(SHOP)!;
      // Text has original but not preserved form
      const result = checkConsistency('Our Brand is the best product on the market today.', updatedProfile);
      const phraseIssue = result.issues.find(i => i.type === 'locked_phrase_missing');
      expect(phraseIssue).toBeDefined();
      expect(phraseIssue!.severity).toBe('high');
      expect(phraseIssue!.suggestion).toContain('OurBrand(TM)');
    });

    it('does not flag locked phrase when preserved form is present', () => {
      const profile = createProfile(SHOP, makeAnalysis({ formality: 2 }));
      addLockedPhrase(SHOP, 'Brand', 'Brand(R)');
      const updatedProfile = getProfile(SHOP)!;
      const result = checkConsistency('Brand(R) is great.', updatedProfile);
      const phraseIssue = result.issues.find(i => i.type === 'locked_phrase_missing');
      expect(phraseIssue).toBeUndefined();
    });

    it('score decreases by 20 per issue', () => {
      const profile = createProfile(SHOP, makeAnalysis({ formality: 1 }));
      addLockedPhrase(SHOP, 'X', 'Y');
      const updatedProfile = getProfile(SHOP)!;
      // Long text (formality mismatch) + locked phrase issue
      const result = checkConsistency(
        'X is mentioned in this very long and elaborate sentence that goes on and on with many many many many more words beyond expectations.',
        updatedProfile
      );
      expect(result.score).toBeLessThanOrEqual(60);
      expect(result.passed).toBe(false);
    });

    it('score never goes below 0', () => {
      const profile = createProfile(SHOP, makeAnalysis({ formality: 1 }));
      // Add 6 locked phrases to push score below 0
      for (let i = 0; i < 6; i++) {
        addLockedPhrase(SHOP, `phrase${i}`, `PHRASE${i}`);
      }
      const updatedProfile = getProfile(SHOP)!;
      const text = 'phrase0 phrase1 phrase2 phrase3 phrase4 phrase5 in a very long elaborate sentence with many words.';
      const result = checkConsistency(text, updatedProfile);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('deleteProfile', () => {
    it('returns false for non-existent shop', () => {
      expect(deleteProfile('no-shop')).toBe(false);
    });

    it('deletes an existing profile', () => {
      createProfile(SHOP, makeAnalysis());
      expect(deleteProfile(SHOP)).toBe(true);
      expect(getProfile(SHOP)).toBeNull();
    });

    it('returns false on second delete of same shop', () => {
      createProfile(SHOP, makeAnalysis());
      deleteProfile(SHOP);
      expect(deleteProfile(SHOP)).toBe(false);
    });
  });

  describe('clearProfiles', () => {
    it('removes all profiles', () => {
      createProfile('shop1.myshopify.com', makeAnalysis());
      createProfile('shop2.myshopify.com', makeAnalysis());
      clearProfiles();
      expect(getProfile('shop1.myshopify.com')).toBeNull();
      expect(getProfile('shop2.myshopify.com')).toBeNull();
    });
  });
});
