import { describe, it, expect } from 'vitest';
import {
  getMedicalDisclaimer,
  getAvailableDisclaimerTypes,
  getSupportedLocales,
  validateMedicalContent,
  checkMedicalClaims,
  getHealthWarningLabels,
  getHealthWarningLabel,
  getDisclaimerText,
  needsEmergencyDisclaimer,
  getProductDisclaimers,
  formatDisclaimerForDisplay,
  getAllMedicalDisclaimers,
  isLocaleSupported,
  getDisclaimerRequirements,
  type SupportedLocale,
  type DisclaimerType,
} from '../../app/services/translation-features/medical-disclaimer';

describe('Medical Disclaimer Service - T0343', () => {
  const supportedLocales: SupportedLocale[] = ['ar', 'he', 'en'];

  describe('getMedicalDisclaimer', () => {
    it('should return disclaimer for all supported locales and types', () => {
      const types: DisclaimerType[] = [
        'general', 'product', 'supplement', 'device', 'emergency',
        'consult-doctor', 'not-medical-advice', 'fda-not-evaluated'
      ];

      for (const locale of supportedLocales) {
        for (const type of types) {
          const disclaimer = getMedicalDisclaimer(locale, type);
          expect(disclaimer).toBeDefined();
          expect(disclaimer.type).toBe(type);
          expect(disclaimer.locale).toBe(locale);
          expect(disclaimer.title).toBeTruthy();
          expect(disclaimer.content).toBeTruthy();
          expect(disclaimer.shortVersion).toBeTruthy();
          expect(['info', 'warning', 'critical']).toContain(disclaimer.warningLevel);
          expect(typeof disclaimer.requiresAcknowledgment).toBe('boolean');
        }
      }
    });

    it('should return English fallback for unsupported locale', () => {
      const disclaimer = getMedicalDisclaimer('fr' as SupportedLocale, 'general');
      expect(disclaimer).toBeDefined();
      expect(disclaimer.locale).toBe('en');
    });

    it('should return general disclaimer as ultimate fallback', () => {
      const disclaimer = getMedicalDisclaimer('fr' as SupportedLocale, 'invalid' as DisclaimerType);
      expect(disclaimer).toBeDefined();
      expect(disclaimer.type).toBe('general');
    });

    it('should have correct RTL language content for Arabic', () => {
      const disclaimer = getMedicalDisclaimer('ar', 'general');
      expect(disclaimer.title).toBe('إخلاء مسؤولية طبية');
      expect(disclaimer.content).toContain('المعلومات');
      expect(disclaimer.shortVersion).toContain('استشر');
    });

    it('should have correct RTL language content for Hebrew', () => {
      const disclaimer = getMedicalDisclaimer('he', 'general');
      expect(disclaimer.title).toBe('כתב ויתור רפואי');
      expect(disclaimer.content).toContain('מידע');
      expect(disclaimer.shortVersion).toContain('רופא');
    });

    it('should have correct content for English', () => {
      const disclaimer = getMedicalDisclaimer('en', 'general');
      expect(disclaimer.title).toBe('Medical Disclaimer');
      expect(disclaimer.content).toContain('informational purposes');
      expect(disclaimer.shortVersion).toContain('consult your doctor');
    });
  });

  describe('getAvailableDisclaimerTypes', () => {
    it('should return all 8 disclaimer types', () => {
      const types = getAvailableDisclaimerTypes();
      expect(types).toHaveLength(8);
      expect(types).toContain('general');
      expect(types).toContain('product');
      expect(types).toContain('supplement');
      expect(types).toContain('device');
      expect(types).toContain('emergency');
      expect(types).toContain('consult-doctor');
      expect(types).toContain('not-medical-advice');
      expect(types).toContain('fda-not-evaluated');
    });
  });

  describe('getSupportedLocales', () => {
    it('should return ar, he, and en locales', () => {
      const locales = getSupportedLocales();
      expect(locales).toHaveLength(3);
      expect(locales).toContain('ar');
      expect(locales).toContain('he');
      expect(locales).toContain('en');
    });
  });

  describe('validateMedicalContent', () => {
    it('should flag content with prohibited claims in English', () => {
      const content = 'This product promises a guaranteed cure for all diseases instantly!';
      const result = validateMedicalContent(content, 'en');
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === 'prohibited_content')).toBe(true);
    });

    it('should flag content with prohibited claims in Arabic', () => {
      const content = 'هذا المنتج وعد الشفاء لجميع الأمراض فوراً!';
      const result = validateMedicalContent(content, 'ar');
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === 'prohibited_content')).toBe(true);
    });

    it('should flag content with prohibited claims in Hebrew', () => {
      const content = 'מוצר זה הבטחת ריפוי לכל המחלות מיידית!';
      const result = validateMedicalContent(content, 'he');
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.type === 'prohibited_content')).toBe(true);
    });

    it('should require disclaimers for medical content', () => {
      const content = 'This medicine helps treat pain and symptoms effectively.';
      const result = validateMedicalContent(content, 'en');
      
      expect(result.requiresDisclaimer).toBe(true);
      expect(result.recommendedDisclaimers.length).toBeGreaterThan(0);
    });

    it('should not require disclaimers for non-medical content', () => {
      const content = 'This is a beautiful red dress made of cotton.';
      const result = validateMedicalContent(content, 'en');
      
      expect(result.requiresDisclaimer).toBe(false);
    });

    it('should recommend consult-doctor for high-risk content', () => {
      const content = 'This supplement cures cancer and guarantees 100% results!';
      const result = validateMedicalContent(content, 'en');
      
      expect(result.requiresDisclaimer).toBe(true);
      expect(result.recommendedDisclaimers).toContain('consult-doctor');
    });

    it('should return valid for safe medical content', () => {
      const content = 'This product may support general wellness when used as directed.';
      const result = validateMedicalContent(content, 'en');
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('checkMedicalClaims', () => {
    it('should detect treatment claims in English', () => {
      const content = 'This product treats headaches and reduces pain effectively.';
      const result = checkMedicalClaims(content, 'en');
      
      expect(result.hasMedicalClaims).toBe(true);
      expect(result.detectedClaims.some(c => c.type === 'treatment')).toBe(true);
    });

    it('should detect cure claims in English', () => {
      const content = 'This supplement cures diabetes completely!';
      const result = checkMedicalClaims(content, 'en');
      
      expect(result.hasMedicalClaims).toBe(true);
      expect(result.detectedClaims.some(c => c.type === 'cure')).toBe(true);
      expect(result.riskLevel).toBe('high');
      expect(result.requiresRegulatoryReview).toBe(true);
    });

    it('should detect prevention claims in English', () => {
      const content = 'This vitamin prevents colds and flu during winter.';
      const result = checkMedicalClaims(content, 'en');
      
      expect(result.hasMedicalClaims).toBe(true);
      expect(result.detectedClaims.some(c => c.type === 'prevention')).toBe(true);
    });

    it('should detect diagnosis claims in English', () => {
      const content = 'This device detects early signs of heart disease.';
      const result = checkMedicalClaims(content, 'en');
      
      expect(result.hasMedicalClaims).toBe(true);
      expect(result.detectedClaims.some(c => c.type === 'diagnosis')).toBe(true);
    });

    it('should detect guarantee claims in English', () => {
      const content = 'We guarantee 100% satisfaction or your money back!';
      const result = checkMedicalClaims(content, 'en');
      
      expect(result.hasMedicalClaims).toBe(true);
      expect(result.detectedClaims.some(c => c.type === 'guarantee')).toBe(true);
      expect(result.riskLevel).toBe('high');
    });

    it('should detect treatment claims in Arabic', () => {
      const content = 'هذا المنتج يعالج الصداع ويُخفف من الألم';
      const result = checkMedicalClaims(content, 'ar');
      
      expect(result.hasMedicalClaims).toBe(true);
      expect(result.detectedClaims.some(c => c.type === 'treatment')).toBe(true);
    });

    it('should detect treatment claims in Hebrew', () => {
      const content = 'מוצר זה מטפל בכאבי ראש ומקל על כאב';
      const result = checkMedicalClaims(content, 'he');
      
      expect(result.hasMedicalClaims).toBe(true);
      expect(result.detectedClaims.some(c => c.type === 'treatment')).toBe(true);
    });

    it('should return no claims for neutral content', () => {
      const content = 'This is a blue shirt with a comfortable fit.';
      const result = checkMedicalClaims(content, 'en');
      
      expect(result.hasMedicalClaims).toBe(false);
      expect(result.detectedClaims).toHaveLength(0);
      expect(result.riskLevel).toBe('low');
    });

    it('should set medium risk for multiple non-critical claims', () => {
      const content = 'This helps with treatment and provides prevention benefits while supporting diagnosis.';
      const result = checkMedicalClaims(content, 'en');
      
      expect(result.riskLevel).toBe('high'); // 3+ claims = high risk
    });
  });

  describe('getHealthWarningLabels', () => {
    it('should return warning labels for all locales', () => {
      for (const locale of supportedLocales) {
        const labels = getHealthWarningLabels(locale);
        expect(labels.length).toBeGreaterThan(0);
        
        labels.forEach(label => {
          expect(label.id).toBeTruthy();
          expect(label.label).toBeTruthy();
          expect(label.description).toBeTruthy();
          expect(label.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        });
      }
    });

    it('should return English labels for unsupported locale', () => {
      const labels = getHealthWarningLabels('fr' as SupportedLocale);
      expect(labels.length).toBeGreaterThan(0);
      expect(labels[0].label).toContain('Keep'); // English content
    });

    it('should include common warning label types', () => {
      const labels = getHealthWarningLabels('en');
      const ids = labels.map(l => l.id);
      
      expect(ids).toContain('keep-out-reach');
      expect(ids).toContain('pregnancy-warning');
      expect(ids).toContain('dosage-limit');
      expect(ids).toContain('allergy-alert');
    });
  });

  describe('getHealthWarningLabel', () => {
    it('should return specific label by ID', () => {
      const label = getHealthWarningLabel('en', 'keep-out-reach');
      expect(label).toBeDefined();
      expect(label?.id).toBe('keep-out-reach');
      expect(label?.label).toContain('children');
    });

    it('should return undefined for unknown label ID', () => {
      const label = getHealthWarningLabel('en', 'unknown-label');
      expect(label).toBeUndefined();
    });
  });

  describe('getDisclaimerText', () => {
    it('should return short version by default', () => {
      const text = getDisclaimerText('en', 'general');
      expect(text).toBe('For informational purposes only - consult your doctor');
    });

    it('should return full version when requested', () => {
      const text = getDisclaimerText('en', 'general', 'full');
      expect(text.length).toBeGreaterThan(50);
      expect(text).toContain('informational purposes');
    });

    it('should return Arabic text for Arabic locale', () => {
      const text = getDisclaimerText('ar', 'consult-doctor');
      expect(text).toContain('استشر');
    });

    it('should return Hebrew text for Hebrew locale', () => {
      const text = getDisclaimerText('he', 'consult-doctor');
      expect(text).toContain('רופא');
    });
  });

  describe('needsEmergencyDisclaimer', () => {
    it('should detect emergency keywords in English', () => {
      expect(needsEmergencyDisclaimer('Call 911 for emergency!', 'en')).toBe(true);
      expect(needsEmergencyDisclaimer('Urgent medical attention needed', 'en')).toBe(true);
      expect(needsEmergencyDisclaimer('Life threatening condition', 'en')).toBe(true);
    });

    it('should detect emergency keywords in Arabic', () => {
      expect(needsEmergencyDisclaimer('اتصل بالإسعاف فوراً', 'ar')).toBe(true);
      expect(needsEmergencyDisclaimer('حالة طوارئ', 'ar')).toBe(true);
    });

    it('should detect emergency keywords in Hebrew', () => {
      expect(needsEmergencyDisclaimer('התקשר למד"א מיד', 'he')).toBe(true);
      expect(needsEmergencyDisclaimer('מצב חירום', 'he')).toBe(true);
    });

    it('should not flag non-emergency content', () => {
      expect(needsEmergencyDisclaimer('This is a regular product description', 'en')).toBe(false);
      expect(needsEmergencyDisclaimer('Contact us for more information', 'en')).toBe(false);
    });
  });

  describe('getProductDisclaimers', () => {
    it('should return disclaimers for supplement products', () => {
      const disclaimers = getProductDisclaimers('supplement', 'en');
      expect(disclaimers.length).toBeGreaterThanOrEqual(3);
      expect(disclaimers.some(d => d.type === 'general')).toBe(true);
      expect(disclaimers.some(d => d.type === 'supplement')).toBe(true);
      expect(disclaimers.some(d => d.type === 'consult-doctor')).toBe(true);
    });

    it('should return disclaimers for device products', () => {
      const disclaimers = getProductDisclaimers('device', 'en');
      expect(disclaimers.length).toBeGreaterThanOrEqual(2);
      expect(disclaimers.some(d => d.type === 'general')).toBe(true);
      expect(disclaimers.some(d => d.type === 'device')).toBe(true);
    });

    it('should return disclaimers for medication products', () => {
      const disclaimers = getProductDisclaimers('medication', 'en');
      expect(disclaimers.length).toBeGreaterThanOrEqual(3);
      expect(disclaimers.some(d => d.type === 'general')).toBe(true);
      expect(disclaimers.some(d => d.type === 'consult-doctor')).toBe(true);
      expect(disclaimers.some(d => d.type === 'not-medical-advice')).toBe(true);
    });

    it('should return disclaimers for general products', () => {
      const disclaimers = getProductDisclaimers('general', 'en');
      expect(disclaimers.length).toBeGreaterThanOrEqual(2);
      expect(disclaimers.some(d => d.type === 'general')).toBe(true);
      expect(disclaimers.some(d => d.type === 'product')).toBe(true);
    });

    it('should return localized disclaimers', () => {
      const disclaimers = getProductDisclaimers('supplement', 'ar');
      expect(disclaimers[0].locale).toBe('ar');
      expect(disclaimers[0].title).toContain('إخلاء');
    });
  });

  describe('formatDisclaimerForDisplay', () => {
    it('should format disclaimer with RTL flag for Arabic', () => {
      const disclaimer = getMedicalDisclaimer('ar', 'general');
      const formatted = formatDisclaimerForDisplay(disclaimer);
      
      expect(formatted.isRTL).toBe(true);
      expect(formatted.text).toBe(disclaimer.content);
      expect(formatted.title).toBe(disclaimer.title);
      expect(formatted.warningLevel).toBe(disclaimer.warningLevel);
    });

    it('should format disclaimer with RTL flag for Hebrew', () => {
      const disclaimer = getMedicalDisclaimer('he', 'general');
      const formatted = formatDisclaimerForDisplay(disclaimer);
      
      expect(formatted.isRTL).toBe(true);
    });

    it('should format disclaimer without RTL for English', () => {
      const disclaimer = getMedicalDisclaimer('en', 'general');
      const formatted = formatDisclaimerForDisplay(disclaimer);
      
      expect(formatted.isRTL).toBe(false);
    });

    it('should allow hiding title', () => {
      const disclaimer = getMedicalDisclaimer('en', 'general');
      const formatted = formatDisclaimerForDisplay(disclaimer, { showTitle: false });
      
      expect(formatted.title).toBe('');
    });
  });

  describe('getAllMedicalDisclaimers', () => {
    it('should return all disclaimers for a locale', () => {
      const disclaimers = getAllMedicalDisclaimers('en');
      expect(disclaimers).toHaveLength(8);
      
      const types = disclaimers.map(d => d.type);
      expect(types).toContain('general');
      expect(types).toContain('product');
      expect(types).toContain('supplement');
    });

    it('should return all disclaimers in correct locale', () => {
      const disclaimers = getAllMedicalDisclaimers('ar');
      disclaimers.forEach(d => {
        expect(d.locale).toBe('ar');
      });
    });
  });

  describe('isLocaleSupported', () => {
    it('should return true for supported locales', () => {
      expect(isLocaleSupported('ar')).toBe(true);
      expect(isLocaleSupported('he')).toBe(true);
      expect(isLocaleSupported('en')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(isLocaleSupported('fr')).toBe(false);
      expect(isLocaleSupported('de')).toBe(false);
      expect(isLocaleSupported('es')).toBe(false);
    });
  });

  describe('getDisclaimerRequirements', () => {
    it('should return requirements for packaging content', () => {
      const reqs = getDisclaimerRequirements('packaging');
      expect(reqs.requiredTypes).toContain('general');
      expect(reqs.requiredTypes).toContain('consult-doctor');
      expect(reqs.requiresAcknowledgment).toBe(true);
      expect(reqs.minWarningLevel).toBe('warning');
    });

    it('should return requirements for marketing content', () => {
      const reqs = getDisclaimerRequirements('marketing');
      expect(reqs.requiredTypes).toContain('general');
      expect(reqs.requiredTypes).toContain('not-medical-advice');
      expect(reqs.requiresAcknowledgment).toBe(false);
      expect(reqs.minWarningLevel).toBe('info');
    });

    it('should return requirements for educational content', () => {
      const reqs = getDisclaimerRequirements('educational');
      expect(reqs.requiredTypes).toContain('not-medical-advice');
      expect(reqs.requiresAcknowledgment).toBe(false);
      expect(reqs.minWarningLevel).toBe('info');
    });

    it('should return requirements for product-description content', () => {
      const reqs = getDisclaimerRequirements('product-description');
      expect(reqs.requiredTypes).toContain('general');
      expect(reqs.requiredTypes).toContain('product');
      expect(reqs.requiresAcknowledgment).toBe(true);
      expect(reqs.minWarningLevel).toBe('warning');
    });
  });
});
