import { describe, it, expect } from 'vitest';
import {
  getOnboardingSteps,
  getStepLabels,
  getWelcomeMessage,
  getCompletionMessage,
  getCompletionTitle,
  getProgressLabels,
  getNavigationLabels,
  getErrorLabels,
  isRTLLocale,
  getStepIndicator,
  getProgressPercentage,
  getSupportedLocales,
} from '../../app/services/onboarding/labels';

describe('Onboarding Labels — getOnboardingSteps', () => {
  it('returns 6 steps for English locale', () => {
    const steps = getOnboardingSteps('en');
    expect(steps).toHaveLength(6);
  });

  it('returns steps in correct order', () => {
    const steps = getOnboardingSteps('en');
    expect(steps[0].id).toBe('welcome');
    expect(steps[1].id).toBe('language_selection');
    expect(steps[2].id).toBe('ai_provider_setup');
    expect(steps[3].id).toBe('first_translation');
    expect(steps[4].id).toBe('storefront_preview');
    expect(steps[5].id).toBe('completion');
  });

  it('each step has required label properties', () => {
    const steps = getOnboardingSteps('en');
    for (const step of steps) {
      expect(step.labels).toHaveProperty('title');
      expect(step.labels).toHaveProperty('description');
      expect(step.labels).toHaveProperty('primaryAction');
      expect(step.labels).toHaveProperty('secondaryAction');
      expect(step.labels).toHaveProperty('skipAction');
    }
  });

  it('returns Arabic labels for ar locale', () => {
    const steps = getOnboardingSteps('ar');
    expect(steps[0].labels.primaryAction).toBe('البدء');
  });

  it('returns Hebrew labels for he locale', () => {
    const steps = getOnboardingSteps('he');
    expect(steps[0].labels.primaryAction).toBe('מתחילים');
  });

  it('falls back to English for unsupported locale', () => {
    const steps = getOnboardingSteps('xx');
    expect(steps[0].labels.primaryAction).toBe('Get Started');
  });

  it('handles locale with region code', () => {
    const steps = getOnboardingSteps('en-US');
    expect(steps[0].labels.primaryAction).toBe('Get Started');
  });

  it('handles Arabic with region code', () => {
    const steps = getOnboardingSteps('ar-SA');
    expect(steps[0].labels.primaryAction).toBe('البدء');
  });
});

describe('Onboarding Labels — getStepLabels', () => {
  it('returns labels for welcome step', () => {
    const labels = getStepLabels('welcome', 'en');
    expect(labels.title).toBe('Welcome to RTL Storefront');
    expect(labels.primaryAction).toBe('Get Started');
  });

  it('returns labels for language_selection step', () => {
    const labels = getStepLabels('language_selection', 'en');
    expect(labels.title).toBe('Select Your Languages');
    expect(labels.primaryAction).toBe('Continue');
  });

  it('returns labels for ai_provider_setup step', () => {
    const labels = getStepLabels('ai_provider_setup', 'en');
    expect(labels.title).toBe('Configure AI Translation');
    expect(labels.primaryAction).toBe('Save & Continue');
  });

  it('returns labels for completion step', () => {
    const labels = getStepLabels('completion', 'en');
    expect(labels.title).toBe("You're All Set!");
    expect(labels.primaryAction).toBe('Start Translating');
  });

  it('returns Arabic labels when locale is ar', () => {
    const labels = getStepLabels('welcome', 'ar');
    expect(labels.primaryAction).toBe('البدء');
  });

  it('returns French labels when locale is fr', () => {
    const labels = getStepLabels('welcome', 'fr');
    expect(labels.primaryAction).toBe('Commencer');
  });

  it('returns Spanish labels when locale is es', () => {
    const labels = getStepLabels('welcome', 'es');
    expect(labels.primaryAction).toBe('Comenzar');
  });

  it('returns German labels when locale is de', () => {
    const labels = getStepLabels('welcome', 'de');
    expect(labels.primaryAction).toBe("Los geht's");
  });
});

describe('Onboarding Labels — getWelcomeMessage', () => {
  it('returns English welcome message by default', () => {
    const message = getWelcomeMessage();
    expect(message).toContain('Welcome to RTL Storefront');
    expect(message).toContain('MENA markets');
  });

  it('returns Arabic welcome message for ar locale', () => {
    const message = getWelcomeMessage('ar');
    expect(message).toContain('مرحباً بك');
  });

  it('returns Hebrew welcome message for he locale', () => {
    const message = getWelcomeMessage('he');
    expect(message).toContain('ברוכים הבאים');
  });

  it('returns French welcome message for fr locale', () => {
    const message = getWelcomeMessage('fr');
    expect(message).toContain('Bienvenue');
  });
});

describe('Onboarding Labels — getCompletionMessage', () => {
  it('returns English completion message by default', () => {
    const message = getCompletionMessage();
    expect(message).toContain('Congratulations');
    expect(message).toContain('RTL');
  });

  it('returns Arabic completion message for ar locale', () => {
    const message = getCompletionMessage('ar');
    expect(message).toContain('تهانينا');
  });

  it('returns Hebrew completion message for he locale', () => {
    const message = getCompletionMessage('he');
    expect(message).toContain('מזל טוב');
  });

  it('returns Spanish completion message for es locale', () => {
    const message = getCompletionMessage('es');
    expect(message).toContain('Felicitaciones');
  });
});

describe('Onboarding Labels — getCompletionTitle', () => {
  it('returns English completion title by default', () => {
    const title = getCompletionTitle();
    expect(title).toBe("You're All Set!");
  });

  it('returns Arabic completion title for ar locale', () => {
    const title = getCompletionTitle('ar');
    expect(title).toBe('كل شيء جاهز!');
  });

  it('returns Hebrew completion title for he locale', () => {
    const title = getCompletionTitle('he');
    expect(title).toBe('הכל מוכן!');
  });
});

describe('Onboarding Labels — getProgressLabels', () => {
  it('returns English progress labels by default', () => {
    const labels = getProgressLabels();
    expect(labels.stepIndicator).toBe('Step');
    expect(labels.ofText).toBe('of');
    expect(labels.completedText).toBe('completed');
  });

  it('returns Arabic progress labels for ar locale', () => {
    const labels = getProgressLabels('ar');
    expect(labels.stepIndicator).toBe('الخطوة');
    expect(labels.ofText).toBe('من');
  });

  it('returns Hebrew progress labels for he locale', () => {
    const labels = getProgressLabels('he');
    expect(labels.stepIndicator).toBe('שלב');
    expect(labels.ofText).toBe('מתוך');
  });

  it('returns all required progress label fields', () => {
    const labels = getProgressLabels('en');
    expect(labels).toHaveProperty('stepIndicator');
    expect(labels).toHaveProperty('ofText');
    expect(labels).toHaveProperty('completedText');
    expect(labels).toHaveProperty('remainingText');
    expect(labels).toHaveProperty('percentageText');
  });
});

describe('Onboarding Labels — getNavigationLabels', () => {
  it('returns English navigation labels by default', () => {
    const labels = getNavigationLabels();
    expect(labels.next).toBe('Next');
    expect(labels.back).toBe('Back');
    expect(labels.finish).toBe('Finish');
  });

  it('returns Arabic navigation labels for ar locale', () => {
    const labels = getNavigationLabels('ar');
    expect(labels.next).toBe('التالي');
    expect(labels.back).toBe('رجوع');
    expect(labels.finish).toBe('إنهاء');
  });

  it('returns all required navigation labels', () => {
    const labels = getNavigationLabels('en');
    expect(labels).toHaveProperty('next');
    expect(labels).toHaveProperty('back');
    expect(labels).toHaveProperty('finish');
    expect(labels).toHaveProperty('saveAndContinue');
    expect(labels).toHaveProperty('exit');
  });
});

describe('Onboarding Labels — getErrorLabels', () => {
  it('returns English error labels by default', () => {
    const labels = getErrorLabels();
    expect(labels.generic).toContain('went wrong');
    expect(labels.requiredField).toContain('required');
  });

  it('returns Arabic error labels for ar locale', () => {
    const labels = getErrorLabels('ar');
    expect(labels.generic).toContain('خطأ');
  });

  it('returns all required error labels', () => {
    const labels = getErrorLabels('en');
    expect(labels).toHaveProperty('generic');
    expect(labels).toHaveProperty('requiredField');
    expect(labels).toHaveProperty('invalidConfiguration');
    expect(labels).toHaveProperty('networkError');
  });
});

describe('Onboarding Labels — isRTLLocale', () => {
  it('returns true for Arabic locale', () => {
    expect(isRTLLocale('ar')).toBe(true);
    expect(isRTLLocale('ar-SA')).toBe(true);
    expect(isRTLLocale('ar-EG')).toBe(true);
  });

  it('returns true for Hebrew locale', () => {
    expect(isRTLLocale('he')).toBe(true);
    expect(isRTLLocale('he-IL')).toBe(true);
  });

  it('returns true for Urdu locale', () => {
    expect(isRTLLocale('ur')).toBe(true);
  });

  it('returns true for Farsi locale', () => {
    expect(isRTLLocale('fa')).toBe(true);
  });

  it('returns false for English locale', () => {
    expect(isRTLLocale('en')).toBe(false);
    expect(isRTLLocale('en-US')).toBe(false);
    expect(isRTLLocale('en-GB')).toBe(false);
  });

  it('returns false for French locale', () => {
    expect(isRTLLocale('fr')).toBe(false);
  });

  it('returns false for Spanish locale', () => {
    expect(isRTLLocale('es')).toBe(false);
  });

  it('returns false for German locale', () => {
    expect(isRTLLocale('de')).toBe(false);
  });
});

describe('Onboarding Labels — getStepIndicator', () => {
  it('returns formatted step indicator for English', () => {
    const indicator = getStepIndicator(2, 6, 'en');
    expect(indicator).toBe('Step 2 of 6');
  });

  it('returns RTL-formatted step indicator for Arabic', () => {
    const indicator = getStepIndicator(2, 6, 'ar');
    expect(indicator).toContain('6');
    expect(indicator).toContain('2');
    expect(indicator).toContain('الخطوة');
    expect(indicator).toContain('من');
  });

  it('returns RTL-formatted step indicator for Hebrew', () => {
    const indicator = getStepIndicator(3, 6, 'he');
    expect(indicator).toContain('שלב');
    expect(indicator).toContain('מתוך');
  });

  it('returns LTR format for French', () => {
    const indicator = getStepIndicator(1, 6, 'fr');
    expect(indicator).toBe('Étape 1 sur 6');
  });

  it('uses default locale when not specified', () => {
    const indicator = getStepIndicator(1, 6);
    expect(indicator).toBe('Step 1 of 6');
  });
});

describe('Onboarding Labels — getProgressPercentage', () => {
  it('returns formatted percentage for English', () => {
    const text = getProgressPercentage(50, 'en');
    expect(text).toBe('50% complete');
  });

  it('returns formatted percentage for Arabic', () => {
    const text = getProgressPercentage(75, 'ar');
    expect(text).toContain('75%');
    expect(text).toContain('مكتمل');
  });

  it('returns formatted percentage for Hebrew', () => {
    const text = getProgressPercentage(100, 'he');
    expect(text).toContain('100%');
    expect(text).toContain('הושלם');
  });

  it('uses default locale when not specified', () => {
    const text = getProgressPercentage(25);
    expect(text).toBe('25% complete');
  });
});

describe('Onboarding Labels — getSupportedLocales', () => {
  it('returns array of supported locales', () => {
    const locales = getSupportedLocales();
    expect(locales.length).toBeGreaterThan(0);
  });

  it('includes English locale', () => {
    const locales = getSupportedLocales();
    const english = locales.find((l) => l.code === 'en');
    expect(english).toBeDefined();
    expect(english?.name).toBe('English');
    expect(english?.isRTL).toBe(false);
  });

  it('includes Arabic locale with RTL flag', () => {
    const locales = getSupportedLocales();
    const arabic = locales.find((l) => l.code === 'ar');
    expect(arabic).toBeDefined();
    expect(arabic?.isRTL).toBe(true);
  });

  it('includes Hebrew locale with RTL flag', () => {
    const locales = getSupportedLocales();
    const hebrew = locales.find((l) => l.code === 'he');
    expect(hebrew).toBeDefined();
    expect(hebrew?.isRTL).toBe(true);
  });

  it('each locale has required properties', () => {
    const locales = getSupportedLocales();
    for (const locale of locales) {
      expect(locale).toHaveProperty('code');
      expect(locale).toHaveProperty('name');
      expect(locale).toHaveProperty('isRTL');
      expect(typeof locale.isRTL).toBe('boolean');
    }
  });
});
