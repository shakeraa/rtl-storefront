import { describe, it, expect } from 'vitest';
import {
  getFinancialDisclaimer,
  getAllDisclaimers,
  getRiskWarningLabels,
  getRiskWarning,
  checkFinancialClaims,
  validateFinancialContent,
  getFormattedDisclaimer,
  isRTLLocale,
  getSupportedLocales,
  getDisclaimerTypes,
  requiresFinancialDisclaimers,
  getComplianceChecklist,
  GENERAL_DISCLAIMERS,
  INVESTMENT_DISCLAIMERS,
  TRADING_DISCLAIMERS,
  CRYPTO_DISCLAIMERS,
  FOREX_DISCLAIMERS,
  SECURITIES_DISCLAIMERS,
  ADVISORY_DISCLAIMERS,
  PAST_PERFORMANCE_DISCLAIMERS,
  TAX_DISCLAIMERS,
  NOT_FINANCIAL_ADVICE_DISCLAIMERS,
  DISCLAIMERS_BY_TYPE,
  RISK_WARNING_LABELS,
  RISK_DESCRIPTIONS,
  FINANCIAL_CLAIM_PATTERNS,
  REQUIRED_DISCLAIMERS,
} from '../../app/services/translation-features/financial-disclaimer';

describe('Financial Disclaimer Service', () => {
  describe('getFinancialDisclaimer', () => {
    it('returns Arabic disclaimer for ar locale', () => {
      const disclaimer = getFinancialDisclaimer('ar', 'general');
      expect(disclaimer).toBe(GENERAL_DISCLAIMERS.ar);
      expect(disclaimer).toContain('لأغراض إعلامية');
    });

    it('returns Hebrew disclaimer for he locale', () => {
      const disclaimer = getFinancialDisclaimer('he', 'general');
      expect(disclaimer).toBe(GENERAL_DISCLAIMERS.he);
      expect(disclaimer).toContain('מידע');
    });

    it('returns English disclaimer for en locale', () => {
      const disclaimer = getFinancialDisclaimer('en', 'general');
      expect(disclaimer).toBe(GENERAL_DISCLAIMERS.en);
      expect(disclaimer).toContain('informational');
    });

    it('handles locale variants (ar-SA, he-IL, en-US)', () => {
      expect(getFinancialDisclaimer('ar-SA', 'general')).toBe(GENERAL_DISCLAIMERS.ar);
      expect(getFinancialDisclaimer('he-IL', 'general')).toBe(GENERAL_DISCLAIMERS.he);
      expect(getFinancialDisclaimer('en-US', 'general')).toBe(GENERAL_DISCLAIMERS.en);
    });

    it('falls back to English for unsupported locales', () => {
      expect(getFinancialDisclaimer('fr', 'general')).toBe(GENERAL_DISCLAIMERS.en);
      expect(getFinancialDisclaimer('de', 'investment')).toBe(INVESTMENT_DISCLAIMERS.en);
    });

    it('returns all disclaimer types correctly', () => {
      const types = [
        'general',
        'investment',
        'trading',
        'crypto',
        'forex',
        'securities',
        'advisory',
        'past-performance',
        'tax',
        'not-advice',
      ] as const;

      for (const type of types) {
        const arDisclaimer = getFinancialDisclaimer('ar', type);
        const heDisclaimer = getFinancialDisclaimer('he', type);
        const enDisclaimer = getFinancialDisclaimer('en', type);

        expect(arDisclaimer).toBeDefined();
        expect(heDisclaimer).toBeDefined();
        expect(enDisclaimer).toBeDefined();
        expect(arDisclaimer.length).toBeGreaterThan(0);
        expect(heDisclaimer.length).toBeGreaterThan(0);
        expect(enDisclaimer.length).toBeGreaterThan(0);
      }
    });

    it('returns general disclaimer for unknown type', () => {
      const disclaimer = getFinancialDisclaimer('en', 'unknown' as any);
      expect(disclaimer).toBe(GENERAL_DISCLAIMERS.en);
    });
  });

  describe('getAllDisclaimers', () => {
    it('returns all disclaimer types for Arabic', () => {
      const disclaimers = getAllDisclaimers('ar');
      expect(disclaimers.general).toBe(GENERAL_DISCLAIMERS.ar);
      expect(disclaimers.investment).toBe(INVESTMENT_DISCLAIMERS.ar);
      expect(disclaimers.trading).toBe(TRADING_DISCLAIMERS.ar);
      expect(disclaimers.crypto).toBe(CRYPTO_DISCLAIMERS.ar);
      expect(disclaimers['not-advice']).toBe(NOT_FINANCIAL_ADVICE_DISCLAIMERS.ar);
    });

    it('returns all disclaimer types for Hebrew', () => {
      const disclaimers = getAllDisclaimers('he');
      expect(disclaimers.general).toBe(GENERAL_DISCLAIMERS.he);
      expect(disclaimers.forex).toBe(FOREX_DISCLAIMERS.he);
      expect(disclaimers.tax).toBe(TAX_DISCLAIMERS.he);
    });

    it('returns all disclaimer types for English', () => {
      const disclaimers = getAllDisclaimers('en');
      expect(disclaimers.securities).toBe(SECURITIES_DISCLAIMERS.en);
      expect(disclaimers.advisory).toBe(ADVISORY_DISCLAIMERS.en);
      expect(disclaimers['past-performance']).toBe(PAST_PERFORMANCE_DISCLAIMERS.en);
    });
  });

  describe('getRiskWarningLabels', () => {
    it('returns risk labels for all levels in Arabic', () => {
      const { labels, descriptions } = getRiskWarningLabels('ar');
      expect(labels.low).toBe('مخاطر منخفضة');
      expect(labels.medium).toBe('مخاطر متوسطة');
      expect(labels.high).toBe('مخاطر عالية');
      expect(labels.extreme).toBe('مخاطر شديدة');
      expect(descriptions.low).toContain('مخاطر');
    });

    it('returns risk labels for all levels in Hebrew', () => {
      const { labels, descriptions } = getRiskWarningLabels('he');
      expect(labels.low).toBe('סיכון נמוך');
      expect(labels.medium).toBe('סיכון בינוני');
      expect(labels.high).toBe('סיכון גבוה');
      expect(labels.extreme).toBe('סיכון קיצוני');
      expect(descriptions.high).toContain('סיכון');
    });

    it('returns risk labels for all levels in English', () => {
      const { labels, descriptions } = getRiskWarningLabels('en');
      expect(labels.low).toBe('Low Risk');
      expect(labels.medium).toBe('Medium Risk');
      expect(labels.high).toBe('High Risk');
      expect(labels.extreme).toBe('Extreme Risk');
      expect(descriptions.extreme).toContain('risk');
    });
  });

  describe('getRiskWarning', () => {
    it('returns specific risk level warning in Arabic', () => {
      const warning = getRiskWarning('high', 'ar');
      expect(warning.label).toBe('مخاطر عالية');
      expect(warning.description).toContain('عالية');
    });

    it('returns specific risk level warning in Hebrew', () => {
      const warning = getRiskWarning('extreme', 'he');
      expect(warning.label).toBe('סיכון קיצוני');
      expect(warning.description).toContain('קיצוני');
    });

    it('returns specific risk level warning in English', () => {
      const warning = getRiskWarning('medium', 'en');
      expect(warning.label).toBe('Medium Risk');
      expect(warning.description).toContain('medium');
    });

    it('handles all risk levels', () => {
      const levels = ['low', 'medium', 'high', 'extreme'] as const;
      for (const level of levels) {
        const enWarning = getRiskWarning(level, 'en');
        expect(enWarning.label).toBeDefined();
        expect(enWarning.description).toBeDefined();
      }
    });
  });

  describe('checkFinancialClaims', () => {
    it('detects guaranteed returns claims in English', () => {
      const result = checkFinancialClaims('This investment offers guaranteed 10% returns', 'en');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'guaranteed-returns')).toBe(true);
    });

    it('detects risk-free claims in English', () => {
      const result = checkFinancialClaims('This is a risk-free investment opportunity', 'en');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'risk-free')).toBe(true);
    });

    it('detects get-rich-quick claims in English', () => {
      const result = checkFinancialClaims('Get rich quick with our amazing system', 'en');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'get-rich-quick')).toBe(true);
    });

    it('detects expert recommendation claims in English', () => {
      const result = checkFinancialClaims('Expert recommendation: Buy this stock now', 'en');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'expert-recommendation')).toBe(true);
    });

    it('detects guaranteed returns claims in Arabic', () => {
      const result = checkFinancialClaims('هذا الاستثمار يقدم عائداً مضموناً 10%', 'ar');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'guaranteed-returns')).toBe(true);
    });

    it('detects risk-free claims in Arabic', () => {
      const result = checkFinancialClaims('استثمار آمن بلا مخاطر', 'ar');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'risk-free')).toBe(true);
    });

    it('detects guaranteed returns claims in Hebrew', () => {
      const result = checkFinancialClaims('תשואה מובטחת של 10%', 'he');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'guaranteed-returns')).toBe(true);
    });

    it('detects risk-free claims in Hebrew', () => {
      const result = checkFinancialClaims('השקעה בטוחה ללא סיכון', 'he');
      expect(result.isValid).toBe(false);
      expect(result.violations.some((v) => v.type === 'risk-free')).toBe(true);
    });

    it('returns valid for clean content', () => {
      const result = checkFinancialClaims('This is general information about investing', 'en');
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('assigns critical severity to guaranteed-returns', () => {
      const result = checkFinancialClaims('Guaranteed returns on this investment', 'en');
      const violation = result.violations.find((v) => v.type === 'guaranteed-returns');
      expect(violation?.severity).toBe('critical');
    });

    it('assigns critical severity to insider-info', () => {
      const result = checkFinancialClaims('Based on insider information', 'en');
      const violation = result.violations.find((v) => v.type === 'insider-info');
      expect(violation?.severity).toBe('critical');
    });

    it('provides recommendations when violations found', () => {
      const result = checkFinancialClaims('Guaranteed returns, risk-free investment', 'en');
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('validateFinancialContent', () => {
    it('validates content without violations', () => {
      const result = validateFinancialContent('General information about markets', 'en');
      expect(result.isValid).toBe(true);
      expect(result.claimViolations).toHaveLength(0);
    });

    it('detects claim violations in content', () => {
      const result = validateFinancialContent('Get rich quick with guaranteed returns', 'en');
      expect(result.isValid).toBe(false);
      expect(result.claimViolations.length).toBeGreaterThan(0);
    });

    it('identifies missing disclaimers for investment content', () => {
      const result = validateFinancialContent('Invest in our fund for great returns', 'en');
      expect(result.missingDisclaimers.length).toBeGreaterThan(0);
      expect(result.hasRequiredDisclaimers).toBe(false);
    });

    it('provides suggestions for improvement', () => {
      const result = validateFinancialContent('Crypto trading with guaranteed profits', 'en');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('getFormattedDisclaimer', () => {
    it('formats disclaimer with default separator', () => {
      const formatted = getFormattedDisclaimer('en', ['general', 'investment']);
      expect(formatted).toContain(GENERAL_DISCLAIMERS.en);
      expect(formatted).toContain(INVESTMENT_DISCLAIMERS.en);
    });

    it('formats disclaimer with custom separator', () => {
      const formatted = getFormattedDisclaimer('en', ['general', 'investment'], {
        separator: ' | ',
      });
      expect(formatted).toContain(' | ');
    });

    it('adds prefix and suffix when provided', () => {
      const formatted = getFormattedDisclaimer('en', ['general'], {
        prefix: 'START: ',
        suffix: ' :END',
      });
      expect(formatted.startsWith('START: ')).toBe(true);
      expect(formatted.endsWith(' :END')).toBe(true);
    });

    it('includes header when requested', () => {
      const formatted = getFormattedDisclaimer('en', ['general'], { includeHeader: true });
      expect(formatted).toContain('Financial Disclaimer');
    });

    it('includes Arabic header when requested', () => {
      const formatted = getFormattedDisclaimer('ar', ['general'], { includeHeader: true });
      expect(formatted).toContain('إخلاء مسؤولية مالي');
    });
  });

  describe('isRTLLocale', () => {
    it('returns true for Arabic locale', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('ar-SA')).toBe(true);
      expect(isRTLLocale('ar-AE')).toBe(true);
    });

    it('returns true for Hebrew locale', () => {
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('he-IL')).toBe(true);
    });

    it('returns false for English locale', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('en-US')).toBe(false);
    });

    it('returns false for other LTR locales', () => {
      expect(isRTLLocale('fr')).toBe(false);
      expect(isRTLLocale('de')).toBe(false);
      expect(isRTLLocale('es')).toBe(false);
    });
  });

  describe('getSupportedLocales', () => {
    it('returns ar, he, and en', () => {
      const locales = getSupportedLocales();
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
      expect(locales).toHaveLength(3);
    });
  });

  describe('getDisclaimerTypes', () => {
    it('returns all disclaimer types', () => {
      const types = getDisclaimerTypes();
      expect(types).toContain('general');
      expect(types).toContain('investment');
      expect(types).toContain('trading');
      expect(types).toContain('crypto');
      expect(types).toContain('forex');
      expect(types).toContain('securities');
      expect(types).toContain('advisory');
      expect(types).toContain('past-performance');
      expect(types).toContain('tax');
      expect(types).toContain('not-advice');
      expect(types).toHaveLength(10);
    });
  });

  describe('requiresFinancialDisclaimers', () => {
    it('returns true for investment-related content', () => {
      expect(requiresFinancialDisclaimers('Learn about investing in stocks')).toBe(true);
      expect(requiresFinancialDisclaimers('Our investment fund returns 8%')).toBe(true);
    });

    it('returns true for trading-related content', () => {
      expect(requiresFinancialDisclaimers('Start trading forex today')).toBe(true);
      expect(requiresFinancialDisclaimers('Crypto trading platform')).toBe(true);
    });

    it('returns true for financial advice content', () => {
      expect(requiresFinancialDisclaimers('Financial advice for beginners')).toBe(true);
      expect(requiresFinancialDisclaimers('We recommend buying this stock')).toBe(true);
    });

    it('returns false for non-financial content', () => {
      expect(requiresFinancialDisclaimers('Welcome to our website')).toBe(false);
      expect(requiresFinancialDisclaimers('Contact us for more information')).toBe(false);
    });
  });

  describe('getComplianceChecklist', () => {
    it('returns pass for compliant content', () => {
      const result = getComplianceChecklist('This is general information', 'en');
      expect(result.overall).toBe('pass');
    });

    it('returns fail for content with violations', () => {
      const result = getComplianceChecklist('Guaranteed returns on this investment', 'en');
      expect(result.overall).toBe('fail');
    });

    it('includes required checks', () => {
      const result = getComplianceChecklist('Investment opportunity', 'en');
      const checks = result.items.map((i) => i.check);
      expect(checks).toContain('No prohibited claims');
      expect(checks).toContain('Required disclaimers present');
      expect(checks).toContain('Not financial advice disclaimer');
      expect(checks).toContain('Risk disclosure present');
    });

    it('marks prohibited claims as failed when found', () => {
      const result = getComplianceChecklist('Risk-free investment', 'en');
      const prohibitedCheck = result.items.find((i) => i.check === 'No prohibited claims');
      expect(prohibitedCheck?.passed).toBe(false);
    });
  });

  describe('Constants', () => {
    it('GENERAL_DISCLAIMERS contains all locales', () => {
      expect(GENERAL_DISCLAIMERS.ar).toBeDefined();
      expect(GENERAL_DISCLAIMERS.he).toBeDefined();
      expect(GENERAL_DISCLAIMERS.en).toBeDefined();
    });

    it('INVESTMENT_DISCLAIMERS contains risk warnings', () => {
      expect(INVESTMENT_DISCLAIMERS.en.toLowerCase()).toContain('risk');
      expect(INVESTMENT_DISCLAIMERS.ar).toContain('مخاطر');
      expect(INVESTMENT_DISCLAIMERS.he).toContain('סיכונים');
    });

    it('NOT_FINANCIAL_ADVICE_DISCLAIMERS contains warning symbols', () => {
      expect(NOT_FINANCIAL_ADVICE_DISCLAIMERS.en).toContain('⚠️');
      expect(NOT_FINANCIAL_ADVICE_DISCLAIMERS.ar).toContain('⚠️');
      expect(NOT_FINANCIAL_ADVICE_DISCLAIMERS.he).toContain('⚠️');
    });

    it('CRYPTO_DISCLAIMERS mentions volatility', () => {
      expect(CRYPTO_DISCLAIMERS.en.toLowerCase()).toContain('volatile');
      expect(CRYPTO_DISCLAIMERS.ar).toContain('متقلبة');
    });

    it('FOREX_DISCLAIMERS mentions exchange rates', () => {
      expect(FOREX_DISCLAIMERS.en.toLowerCase()).toContain('exchange');
      expect(FOREX_DISCLAIMERS.ar).toContain('الصرف');
    });

    it('DISCLAIMERS_BY_TYPE contains all types', () => {
      expect(DISCLAIMERS_BY_TYPE.general).toBeDefined();
      expect(DISCLAIMERS_BY_TYPE.investment).toBeDefined();
      expect(DISCLAIMERS_BY_TYPE.trading).toBeDefined();
      expect(DISCLAIMERS_BY_TYPE.crypto).toBeDefined();
      expect(DISCLAIMERS_BY_TYPE.forex).toBeDefined();
      expect(DISCLAIMERS_BY_TYPE['not-advice']).toBeDefined();
    });

    it('RISK_WARNING_LABELS has all risk levels', () => {
      expect(RISK_WARNING_LABELS.low).toBeDefined();
      expect(RISK_WARNING_LABELS.medium).toBeDefined();
      expect(RISK_WARNING_LABELS.high).toBeDefined();
      expect(RISK_WARNING_LABELS.extreme).toBeDefined();
    });

    it('RISK_DESCRIPTIONS has all risk levels', () => {
      expect(RISK_DESCRIPTIONS.low).toBeDefined();
      expect(RISK_DESCRIPTIONS.medium).toBeDefined();
      expect(RISK_DESCRIPTIONS.high).toBeDefined();
      expect(RISK_DESCRIPTIONS.extreme).toBeDefined();
    });

    it('FINANCIAL_CLAIM_PATTERNS has all claim types', () => {
      expect(FINANCIAL_CLAIM_PATTERNS['guaranteed-returns']).toBeDefined();
      expect(FINANCIAL_CLAIM_PATTERNS['risk-free']).toBeDefined();
      expect(FINANCIAL_CLAIM_PATTERNS['get-rich-quick']).toBeDefined();
      expect(FINANCIAL_CLAIM_PATTERNS['expert-recommendation']).toBeDefined();
      expect(FINANCIAL_CLAIM_PATTERNS['future-performance']).toBeDefined();
      expect(FINANCIAL_CLAIM_PATTERNS['insider-info']).toBeDefined();
      expect(FINANCIAL_CLAIM_PATTERNS['unregistered-security']).toBeDefined();
    });

    it('REQUIRED_DISCLAIMERS maps content types to disclaimers', () => {
      expect(REQUIRED_DISCLAIMERS['investment-product']).toContain('general');
      expect(REQUIRED_DISCLAIMERS['crypto-product']).toContain('crypto');
      expect(REQUIRED_DISCLAIMERS['trading-platform']).toContain('trading');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const result = checkFinancialClaims('', 'en');
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('handles very long content', () => {
      const longContent = 'Invest in our fund. '.repeat(1000);
      const result = checkFinancialClaims(longContent, 'en');
      expect(result.isValid).toBe(true);
    });

    it('handles mixed case locale codes', () => {
      expect(getFinancialDisclaimer('AR', 'general')).toBe(GENERAL_DISCLAIMERS.ar);
      expect(getFinancialDisclaimer('HE', 'general')).toBe(GENERAL_DISCLAIMERS.he);
      expect(getFinancialDisclaimer('EN', 'general')).toBe(GENERAL_DISCLAIMERS.en);
    });

    it('handles special characters in content', () => {
      const content = 'Invest! @ # $ % ^ & * () in our fund';
      const result = checkFinancialClaims(content, 'en');
      expect(result.isValid).toBe(true);
    });
  });
});
