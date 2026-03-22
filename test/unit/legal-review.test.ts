/**
 * Legal Review Tests
 * Tests for legal compliance checking in translations
 */

import {
  validateLegalTerminology,
  checkRequiredPhrases,
  verifyDisclaimers,
  getLegalRequirements,
  LegalTerminologyIssue,
  RequiredPhraseCheck,
  DisclaimerVerification,
  LegalRequirements,
  LegalContentType,
  LEGAL_TERMINOLOGY,
  REQUIRED_PHRASES,
  DISCLAIMER_TEMPLATES,
} from '../../app/services/translation-features/legal-review';

describe('Legal Review - validateLegalTerminology', () => {
  test('should return empty array for valid English text', () => {
    const text = 'This product is subject to our standard terms and conditions.';
    const result = validateLegalTerminology(text, 'en');
    expect(result).toEqual([]);
  });

  test('should detect incorrect warranty terminology in English', () => {
    const text = 'We guarantee this product forever with unlimited warranty.';
    const result = validateLegalTerminology(text, 'en');
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((i: LegalTerminologyIssue) => i.type === 'warranty')).toBe(true);
  });

  test('should detect missing liability limitations in English', () => {
    const text = 'Our company is fully responsible for all damages.';
    const result = validateLegalTerminology(text, 'en');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should validate Arabic legal terminology', () => {
    const text = 'هذا المنتج يخضع لشروطنا دون أي قيود على المسؤولية.';
    const result = validateLegalTerminology(text, 'ar');
    expect(Array.isArray(result)).toBe(true);
  });

  test('should detect problematic terms in Arabic', () => {
    const text = 'نضمن إلى الأبد بدون قيود.';
    const result = validateLegalTerminology(text, 'ar');
    expect(result.some((i: LegalTerminologyIssue) => i.severity === 'high')).toBe(true);
  });

  test('should validate Hebrew legal terminology', () => {
    const text = 'מוצר זה כפוף לתנאים וההגבלות הסטנדרטיים שלנו.';
    const result = validateLegalTerminology(text, 'he');
    expect(Array.isArray(result)).toBe(true);
  });

  test('should detect unlimited liability claims in Hebrew', () => {
    const text = 'אנו אחראים באופן מלא לכל נזק.';
    const result = validateLegalTerminology(text, 'he');
    expect(result.length).toBeGreaterThan(0);
  });

  test('should handle empty text', () => {
    const result = validateLegalTerminology('', 'en');
    expect(result).toEqual([]);
  });

  test('should handle unsupported locale gracefully', () => {
    const text = 'Some legal text here.';
    const result = validateLegalTerminology(text, 'fr');
    expect(Array.isArray(result)).toBe(true);
  });

  test('should detect binding language issues', () => {
    const text = 'This agreement is not legally binding on us.';
    const result = validateLegalTerminology(text, 'en');
    expect(result.some((i: LegalTerminologyIssue) => i.type === 'binding')).toBe(true);
  });
});

describe('Legal Review - checkRequiredPhrases', () => {
  test('should detect missing required phrases for terms of service', () => {
    const text = 'Welcome to our website. Please use our services.';
    const result = checkRequiredPhrases(text, 'en', 'terms_of_service');
    expect(result.missing.length).toBeGreaterThan(0);
  });

  test('should validate terms of service with all required phrases', () => {
    const text = 'Terms of Service govern your use. By accessing, you agree. We may modify or terminate these terms at any time.';
    const result = checkRequiredPhrases(text, 'en', 'terms_of_service');
    expect(result.missing.length).toBe(0);
    expect(result.isComplete).toBe(true);
  });

  test('should check privacy policy requirements', () => {
    const text = 'We collect personal information from users.';
    const result = checkRequiredPhrases(text, 'en', 'privacy_policy');
    expect(Array.isArray(result.missing)).toBe(true);
  });

  test('should validate privacy policy with required phrases', () => {
    const text = 'Privacy Policy: We collect your personal data and use it responsibly. We protect your privacy. You have rights to access and delete personal information.';
    const result = checkRequiredPhrases(text, 'en', 'privacy_policy');
    expect(result.isComplete).toBe(true);
  });

  test('should check refund policy requirements', () => {
    const text = 'We offer refunds for products.';
    const result = checkRequiredPhrases(text, 'en', 'refund_policy');
    expect(Array.isArray(result.missing)).toBe(true);
  });

  test('should validate refund policy with required phrases', () => {
    const text = 'Items may be returned within 30 days of purchase. Refunds will be processed within 14 business days. Products must be in original condition. Custom items are non-refundable.';
    const result = checkRequiredPhrases(text, 'en', 'refund_policy');
    expect(result.isComplete).toBe(true);
  });

  test('should support Arabic required phrases', () => {
    const text = 'هذه الشروط تحكم استخدامك لموقعنا.';
    const result = checkRequiredPhrases(text, 'ar', 'terms_of_service');
    expect(Array.isArray(result.missing)).toBe(true);
    expect(Array.isArray(result.present)).toBe(true);
  });

  test('should support Hebrew required phrases', () => {
    const text = 'תנאי השירות הללו חלים על השימוש שלך באתר.';
    const result = checkRequiredPhrases(text, 'he', 'terms_of_service');
    expect(Array.isArray(result.missing)).toBe(true);
    expect(Array.isArray(result.present)).toBe(true);
  });

  test('should handle unknown content type', () => {
    const text = 'Some generic text.';
    const result = checkRequiredPhrases(text, 'en', 'unknown_type' as LegalContentType);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual([]);
  });

  test('should calculate compliance score', () => {
    const text = 'Terms of Service govern your use. By accessing, you agree.';
    const result = checkRequiredPhrases(text, 'en', 'terms_of_service');
    expect(typeof result.complianceScore).toBe('number');
    expect(result.complianceScore).toBeGreaterThanOrEqual(0);
    expect(result.complianceScore).toBeLessThanOrEqual(100);
  });
});

describe('Legal Review - verifyDisclaimers', () => {
  test('should require disclaimers for financial content', () => {
    const content = {
      text: 'Invest in our product for guaranteed returns.',
      type: 'financial' as const,
      hasDisclaimers: false,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.valid).toBe(false);
    expect(result.required).toBe(true);
  });

  test('should validate financial disclaimers', () => {
    const content = {
      text: 'Past performance does not guarantee future results. Investments carry risk.',
      type: 'financial' as const,
      hasDisclaimers: true,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.valid).toBe(true);
  });

  test('should require disclaimers for medical content', () => {
    const content = {
      text: 'This product cures all diseases.',
      type: 'medical' as const,
      hasDisclaimers: false,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.valid).toBe(false);
  });

  test('should validate medical disclaimers', () => {
    const content = {
      text: 'This information is for educational purposes only. Consult a healthcare provider.',
      type: 'medical' as const,
      hasDisclaimers: true,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.valid).toBe(true);
  });

  test('should require disclaimers for affiliate content', () => {
    const content = {
      text: 'We recommend these products.',
      type: 'affiliate' as const,
      hasDisclaimers: false,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.valid).toBe(false);
  });

  test('should validate affiliate disclaimers', () => {
    const content = {
      text: 'This post contains affiliate links. We may earn a commission.',
      type: 'affiliate' as const,
      hasDisclaimers: true,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.valid).toBe(true);
  });

  test('should support Arabic disclaimers', () => {
    const content = {
      text: 'الأداء السابق لا يضمن النتائج المستقبلية.',
      type: 'financial' as const,
      hasDisclaimers: true,
    };
    const result = verifyDisclaimers(content, 'ar');
    expect(typeof result.valid).toBe('boolean');
  });

  test('should support Hebrew disclaimers', () => {
    const content = {
      text: 'ביצועים קודמים אינם מבטיחים תוצאות עתידיות.',
      type: 'financial' as const,
      hasDisclaimers: true,
    };
    const result = verifyDisclaimers(content, 'he');
    expect(typeof result.valid).toBe('boolean');
  });

  test('should provide suggested disclaimer text', () => {
    const content = {
      text: 'Buy now for huge profits!',
      type: 'financial' as const,
      hasDisclaimers: false,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.suggestedDisclaimer).toBeTruthy();
  });

  test('should handle content without disclaimer requirement', () => {
    const content = {
      text: 'Welcome to our store.',
      type: 'general' as const,
      hasDisclaimers: false,
    };
    const result = verifyDisclaimers(content, 'en');
    expect(result.required).toBe(false);
    expect(result.valid).toBe(true);
  });
});

describe('Legal Review - getLegalRequirements', () => {
  test('should return requirements for English locale', () => {
    const result = getLegalRequirements('en');
    expect(result).toBeDefined();
    expect(result.locale).toBe('en');
    expect(Array.isArray(result.requiredElements)).toBe(true);
    expect(Array.isArray(result.prohibitedTerms)).toBe(true);
  });

  test('should return requirements for Arabic locale', () => {
    const result = getLegalRequirements('ar');
    expect(result).toBeDefined();
    expect(result.locale).toBe('ar');
    expect(Array.isArray(result.requiredElements)).toBe(true);
  });

  test('should return requirements for Hebrew locale', () => {
    const result = getLegalRequirements('he');
    expect(result).toBeDefined();
    expect(result.locale).toBe('he');
    expect(Array.isArray(result.requiredElements)).toBe(true);
  });

  test('should include jurisdiction information', () => {
    const result = getLegalRequirements('en');
    expect(result.jurisdiction).toBeTruthy();
  });

  test('should include consumer protection requirements', () => {
    const result = getLegalRequirements('en');
    expect(result.consumerProtection).toBeDefined();
  });

  test('should include data privacy requirements', () => {
    const result = getLegalRequirements('en');
    expect(result.dataPrivacy).toBeDefined();
  });

  test('should default to English for unsupported locale', () => {
    const result = getLegalRequirements('fr');
    expect(result).toBeDefined();
  });
});

describe('Legal Review - Constants and Data Structures', () => {
  test('LEGAL_TERMINOLOGY should contain warranty terms', () => {
    expect(LEGAL_TERMINOLOGY.warranty).toBeDefined();
    expect(LEGAL_TERMINOLOGY.warranty.en).toBeDefined();
  });

  test('LEGAL_TERMINOLOGY should contain liability terms', () => {
    expect(LEGAL_TERMINOLOGY.liability).toBeDefined();
    expect(LEGAL_TERMINOLOGY.liability.en).toBeDefined();
  });

  test('LEGAL_TERMINOLOGY should contain binding terms', () => {
    expect(LEGAL_TERMINOLOGY.binding).toBeDefined();
  });

  test('REQUIRED_PHRASES should contain terms_of_service phrases', () => {
    expect(REQUIRED_PHRASES.terms_of_service).toBeDefined();
    expect(REQUIRED_PHRASES.terms_of_service.en).toBeDefined();
    expect(Array.isArray(REQUIRED_PHRASES.terms_of_service.en)).toBe(true);
  });

  test('REQUIRED_PHRASES should contain privacy_policy phrases', () => {
    expect(REQUIRED_PHRASES.privacy_policy).toBeDefined();
    expect(REQUIRED_PHRASES.privacy_policy.en).toBeDefined();
  });

  test('REQUIRED_PHRASES should contain refund_policy phrases', () => {
    expect(REQUIRED_PHRASES.refund_policy).toBeDefined();
    expect(REQUIRED_PHRASES.refund_policy.en).toBeDefined();
  });

  test('DISCLAIMER_TEMPLATES should contain financial disclaimer', () => {
    expect(DISCLAIMER_TEMPLATES.financial).toBeDefined();
    expect(DISCLAIMER_TEMPLATES.financial.en).toBeTruthy();
  });

  test('DISCLAIMER_TEMPLATES should contain medical disclaimer', () => {
    expect(DISCLAIMER_TEMPLATES.medical).toBeDefined();
    expect(DISCLAIMER_TEMPLATES.medical.en).toBeTruthy();
  });

  test('DISCLAIMER_TEMPLATES should contain affiliate disclaimer', () => {
    expect(DISCLAIMER_TEMPLATES.affiliate).toBeDefined();
    expect(DISCLAIMER_TEMPLATES.affiliate.en).toBeTruthy();
  });

  test('DISCLAIMER_TEMPLATES should contain copyright disclaimer', () => {
    expect(DISCLAIMER_TEMPLATES.copyright).toBeDefined();
  });

  test('DISCLAIMER_TEMPLATES should contain warranty disclaimer', () => {
    expect(DISCLAIMER_TEMPLATES.warranty).toBeDefined();
  });

  test('DISCLAIMER_TEMPLATES should support all locales', () => {
    const locales = ['en', 'ar', 'he'];
    for (const locale of locales) {
      expect(DISCLAIMER_TEMPLATES.financial[locale]).toBeTruthy();
      expect(DISCLAIMER_TEMPLATES.medical[locale]).toBeTruthy();
      expect(DISCLAIMER_TEMPLATES.affiliate[locale]).toBeTruthy();
    }
  });
});

describe('Legal Review - Integration Tests', () => {
  test('should perform complete legal review for e-commerce terms', () => {
    const text = 'Terms of Service govern your use. By accessing, you agree. We may modify or terminate these terms at any time.';
    const terminologyIssues = validateLegalTerminology(text, 'en');
    const phraseCheck = checkRequiredPhrases(text, 'en', 'terms_of_service');
    
    expect(Array.isArray(terminologyIssues)).toBe(true);
    expect(phraseCheck.isComplete).toBe(true);
  });

  test('should identify multiple legal issues in problematic text', () => {
    const text = 'We guarantee forever warranty and accept unlimited liability for all claims.';
    const issues = validateLegalTerminology(text, 'en');
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });

  test('should validate complete privacy policy document', () => {
    const text = `
      Privacy Policy
      This Privacy Policy explains how we collect, use, and protect your personal data.
      We are committed to protecting your privacy and personal information.
      You have the right to access and delete your personal information.
      This policy complies with GDPR and applicable data protection laws.
    `;
    const result = checkRequiredPhrases(text, 'en', 'privacy_policy');
    expect(result.complianceScore).toBeGreaterThan(75);
  });

  test('should handle RTL text properly for legal review', () => {
    const arText = 'نحن نحمي بياناتك الشخصية وفقاً لسياسة الخصوصية.';
    const heText = 'אנו מגנים על הנתונים האישיים שלך בהתאם למדיניות הפרטיות.';
    
    const arResult = validateLegalTerminology(arText, 'ar');
    const heResult = validateLegalTerminology(heText, 'he');
    
    expect(Array.isArray(arResult)).toBe(true);
    expect(Array.isArray(heResult)).toBe(true);
  });
});
