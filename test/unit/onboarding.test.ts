import { describe, it, expect } from 'vitest';
import {
  createOnboardingState,
  completeStep,
  skipStep,
  goToStep,
  canComplete,
  resetOnboarding,
} from '../../app/services/onboarding/manager';
import {
  getDefaultSteps,
  getNextStep,
  getPreviousStep,
  calculateProgress,
  buildCompletionChecklist,
} from '../../app/services/onboarding/steps';

describe('Onboarding — createOnboardingState', () => {
  it('creates state with 6 steps', () => {
    const state = createOnboardingState('test-shop');
    expect(state.steps).toHaveLength(6);
  });

  it('sets currentStep to "welcome"', () => {
    const state = createOnboardingState('test-shop');
    expect(state.currentStep).toBe('welcome');
  });

  it('sets isComplete to false', () => {
    const state = createOnboardingState('test-shop');
    expect(state.isComplete).toBe(false);
  });

  it('records the shop name', () => {
    const state = createOnboardingState('test-shop');
    expect(state.shop).toBe('test-shop');
  });

  it('sets a startedAt timestamp', () => {
    const state = createOnboardingState('test-shop');
    expect(state.startedAt).toBeDefined();
    expect(typeof state.startedAt).toBe('string');
  });
});

describe('Onboarding — getDefaultSteps', () => {
  it('returns 6 steps', () => {
    const steps = getDefaultSteps();
    expect(steps).toHaveLength(6);
  });

  it('returns steps in the correct order', () => {
    const steps = getDefaultSteps();
    const ids = steps.map((s) => s.id);
    expect(ids).toEqual([
      'welcome',
      'language_selection',
      'ai_provider_setup',
      'first_translation',
      'storefront_preview',
      'completion',
    ]);
  });

  it('all steps start with status "not_started"', () => {
    const steps = getDefaultSteps();
    expect(steps.every((s) => s.status === 'not_started')).toBe(true);
  });
});

describe('Onboarding — completeStep', () => {
  it('marks a step as completed', () => {
    const state = createOnboardingState('test-shop');
    const updated = completeStep(state, 'welcome');
    const welcomeStep = updated.steps.find((s) => s.id === 'welcome');
    expect(welcomeStep?.status).toBe('completed');
  });

  it('advances currentStep to the next step', () => {
    const state = createOnboardingState('test-shop');
    const updated = completeStep(state, 'welcome');
    expect(updated.currentStep).toBe('language_selection');
  });

  it('sets completedAt on the completed step', () => {
    const state = createOnboardingState('test-shop');
    const updated = completeStep(state, 'welcome');
    const welcomeStep = updated.steps.find((s) => s.id === 'welcome');
    expect(welcomeStep?.completedAt).toBeDefined();
  });

  it('sets isComplete to true when all steps are completed', () => {
    let state = createOnboardingState('test-shop');
    const stepIds = state.steps.map((s) => s.id);
    for (const id of stepIds) {
      state = completeStep(state, id);
    }
    expect(state.isComplete).toBe(true);
    expect(state.completedAt).toBeDefined();
  });
});

describe('Onboarding — skipStep', () => {
  it('marks a step as skipped', () => {
    const state = createOnboardingState('test-shop');
    const updated = skipStep(state, 'welcome');
    const welcomeStep = updated.steps.find((s) => s.id === 'welcome');
    expect(welcomeStep?.status).toBe('skipped');
  });

  it('advances currentStep to the next step', () => {
    const state = createOnboardingState('test-shop');
    const updated = skipStep(state, 'welcome');
    expect(updated.currentStep).toBe('language_selection');
  });
});

describe('Onboarding — goToStep', () => {
  it('navigates to a specific step', () => {
    const state = createOnboardingState('test-shop');
    const updated = goToStep(state, 'ai_provider_setup');
    expect(updated.currentStep).toBe('ai_provider_setup');
  });
});

describe('Onboarding — getNextStep', () => {
  it('returns "language_selection" after "welcome"', () => {
    expect(getNextStep('welcome')).toBe('language_selection');
  });

  it('returns null after "completion" (last step)', () => {
    expect(getNextStep('completion')).toBeNull();
  });

  it('returns "ai_provider_setup" after "language_selection"', () => {
    expect(getNextStep('language_selection')).toBe('ai_provider_setup');
  });
});

describe('Onboarding — getPreviousStep', () => {
  it('returns "welcome" before "language_selection"', () => {
    expect(getPreviousStep('language_selection')).toBe('welcome');
  });

  it('returns null before "welcome" (first step)', () => {
    expect(getPreviousStep('welcome')).toBeNull();
  });
});

describe('Onboarding — calculateProgress', () => {
  it('returns 0 when no steps are completed', () => {
    const steps = getDefaultSteps();
    expect(calculateProgress(steps)).toBe(0);
  });

  it('returns 100 when all steps are completed', () => {
    const steps = getDefaultSteps().map((s) => ({ ...s, status: 'completed' as const }));
    expect(calculateProgress(steps)).toBe(100);
  });

  it('returns correct percentage for partial completion', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'completed' };
    steps[1] = { ...steps[1], status: 'completed' };
    steps[2] = { ...steps[2], status: 'skipped' };
    // 3 out of 6 = 50%
    expect(calculateProgress(steps)).toBe(50);
  });
});

describe('Onboarding — canComplete', () => {
  it('returns false when required steps are not completed', () => {
    const state = createOnboardingState('test-shop');
    expect(canComplete(state)).toBe(false);
  });

  it('returns true when all required steps are completed', () => {
    let state = createOnboardingState('test-shop');
    // Required steps: language_selection, ai_provider_setup
    state = completeStep(state, 'language_selection');
    state = completeStep(state, 'ai_provider_setup');
    expect(canComplete(state)).toBe(true);
  });
});

describe('Onboarding — buildCompletionChecklist', () => {
  it('returns a checklist with items', () => {
    const steps = getDefaultSteps();
    const { checklist } = buildCompletionChecklist(steps);
    expect(checklist.length).toBeGreaterThan(0);
  });

  it('contains required items', () => {
    const steps = getDefaultSteps();
    const { checklist } = buildCompletionChecklist(steps);
    const requiredItems = checklist.filter((item) => item.required);
    expect(requiredItems.length).toBeGreaterThan(0);
  });

  it('reports allRequiredComplete as false when required steps are incomplete', () => {
    const steps = getDefaultSteps();
    const { allRequiredComplete } = buildCompletionChecklist(steps);
    expect(allRequiredComplete).toBe(false);
  });

  it('reports allRequiredComplete as true when required steps are completed', () => {
    const steps = getDefaultSteps().map((s) => {
      if (s.id === 'language_selection' || s.id === 'ai_provider_setup') {
        return { ...s, status: 'completed' as const };
      }
      return s;
    });
    const { allRequiredComplete } = buildCompletionChecklist(steps);
    expect(allRequiredComplete).toBe(true);
  });
});

describe('Onboarding — resetOnboarding', () => {
  it('returns a fresh state with isComplete false', () => {
    const state = resetOnboarding('test-shop');
    expect(state.isComplete).toBe(false);
    expect(state.currentStep).toBe('welcome');
    expect(state.steps).toHaveLength(6);
    expect(state.steps.every((s) => s.status === 'not_started')).toBe(true);
  });
});
