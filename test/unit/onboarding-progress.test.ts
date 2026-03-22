import { describe, it, expect } from 'vitest';
import {
  getDefaultSteps,
  getProgressDetails,
  getCurrentStepNumber,
  getCompletedSteps,
  getRemainingSteps,
  isFirstStep,
  isLastStep,
  canSkipStep,
  updateStepStatus,
  markStepInProgress,
  getStepById,
  areRequiredStepsCompleted,
  getStepOrderIndex,
  compareSteps,
  isStepBefore,
  isStepAfter,
  getStepSummary,
} from '../../app/services/onboarding/steps';
import type { OnboardingStep } from '../../app/services/onboarding/types';

describe('Onboarding Progress — getProgressDetails', () => {
  it('returns correct counts for new onboarding', () => {
    const steps = getDefaultSteps();
    const details = getProgressDetails(steps);
    expect(details.total).toBe(6);
    expect(details.completed).toBe(0);
    expect(details.skipped).toBe(0);
    expect(details.remaining).toBe(6);
    expect(details.inProgress).toBe(0);
    expect(details.percentage).toBe(0);
  });

  it('returns correct counts when some steps completed', () => {
    const steps = getDefaultSteps().map((s, index) => ({
      ...s,
      status: index < 3 ? ('completed' as const) : s.status,
    }));
    const details = getProgressDetails(steps);
    expect(details.total).toBe(6);
    expect(details.completed).toBe(3);
    expect(details.remaining).toBe(3);
    expect(details.percentage).toBe(50);
  });

  it('counts skipped steps toward progress', () => {
    const steps = getDefaultSteps().map((s, index) => ({
      ...s,
      status: index < 2 ? ('skipped' as const) : s.status,
    }));
    const details = getProgressDetails(steps);
    expect(details.skipped).toBe(2);
    expect(details.percentage).toBe(33);
  });

  it('counts in-progress steps correctly', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'in_progress' };
    const details = getProgressDetails(steps);
    expect(details.inProgress).toBe(1);
  });

  it('returns 100% when all steps completed', () => {
    const steps = getDefaultSteps().map((s) => ({
      ...s,
      status: 'completed' as const,
    }));
    const details = getProgressDetails(steps);
    expect(details.percentage).toBe(100);
    expect(details.remaining).toBe(0);
  });
});

describe('Onboarding Progress — getCurrentStepNumber', () => {
  it('returns 1 for welcome step', () => {
    const steps = getDefaultSteps();
    expect(getCurrentStepNumber(steps, 'welcome')).toBe(1);
  });

  it('returns 6 for completion step', () => {
    const steps = getDefaultSteps();
    expect(getCurrentStepNumber(steps, 'completion')).toBe(6);
  });

  it('returns correct number for middle steps', () => {
    const steps = getDefaultSteps();
    expect(getCurrentStepNumber(steps, 'ai_provider_setup')).toBe(3);
    expect(getCurrentStepNumber(steps, 'first_translation')).toBe(4);
  });
});

describe('Onboarding Progress — getCompletedSteps', () => {
  it('returns empty array when no steps completed', () => {
    const steps = getDefaultSteps();
    expect(getCompletedSteps(steps)).toHaveLength(0);
  });

  it('returns only completed steps', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'completed' };
    steps[1] = { ...steps[1], status: 'completed' };
    steps[2] = { ...steps[2], status: 'in_progress' };
    const completed = getCompletedSteps(steps);
    expect(completed).toHaveLength(2);
    expect(completed.every((s) => s.status === 'completed')).toBe(true);
  });

  it('does not include skipped steps', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'completed' };
    steps[1] = { ...steps[1], status: 'skipped' };
    const completed = getCompletedSteps(steps);
    expect(completed).toHaveLength(1);
    expect(completed[0].id).toBe('welcome');
  });
});

describe('Onboarding Progress — getRemainingSteps', () => {
  it('returns all steps when none completed', () => {
    const steps = getDefaultSteps();
    expect(getRemainingSteps(steps)).toHaveLength(6);
  });

  it('excludes completed steps', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'completed' };
    steps[1] = { ...steps[1], status: 'completed' };
    expect(getRemainingSteps(steps)).toHaveLength(4);
  });

  it('excludes skipped steps', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'skipped' };
    expect(getRemainingSteps(steps)).toHaveLength(5);
  });

  it('includes in_progress steps', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'in_progress' };
    const remaining = getRemainingSteps(steps);
    expect(remaining.some((s) => s.id === 'welcome')).toBe(true);
  });
});

describe('Onboarding Progress — isFirstStep', () => {
  it('returns true for welcome step', () => {
    expect(isFirstStep('welcome')).toBe(true);
  });

  it('returns false for other steps', () => {
    expect(isFirstStep('language_selection')).toBe(false);
    expect(isFirstStep('completion')).toBe(false);
  });
});

describe('Onboarding Progress — isLastStep', () => {
  it('returns true for completion step', () => {
    expect(isLastStep('completion')).toBe(true);
  });

  it('returns false for other steps', () => {
    expect(isLastStep('welcome')).toBe(false);
    expect(isLastStep('first_translation')).toBe(false);
  });
});

describe('Onboarding Progress — canSkipStep', () => {
  it('returns false for language_selection (required)', () => {
    expect(canSkipStep('language_selection')).toBe(false);
  });

  it('returns false for ai_provider_setup (required)', () => {
    expect(canSkipStep('ai_provider_setup')).toBe(false);
  });

  it('returns true for welcome step', () => {
    expect(canSkipStep('welcome')).toBe(true);
  });

  it('returns true for first_translation step', () => {
    expect(canSkipStep('first_translation')).toBe(true);
  });

  it('returns true for storefront_preview step', () => {
    expect(canSkipStep('storefront_preview')).toBe(true);
  });

  it('returns true for completion step', () => {
    expect(canSkipStep('completion')).toBe(true);
  });
});

describe('Onboarding Progress — updateStepStatus', () => {
  it('updates the status of specified step', () => {
    const steps = getDefaultSteps();
    const updated = updateStepStatus(steps, 'welcome', 'completed');
    expect(updated[0].status).toBe('completed');
  });

  it('does not modify other steps', () => {
    const steps = getDefaultSteps();
    const updated = updateStepStatus(steps, 'welcome', 'completed');
    expect(updated[1].status).toBe('not_started');
    expect(updated[2].status).toBe('not_started');
  });

  it('returns new array without mutating original', () => {
    const steps = getDefaultSteps();
    const updated = updateStepStatus(steps, 'welcome', 'completed');
    expect(steps[0].status).toBe('not_started');
    expect(updated).not.toBe(steps);
  });
});

describe('Onboarding Progress — markStepInProgress', () => {
  it('marks step as in_progress', () => {
    const steps = getDefaultSteps();
    const updated = markStepInProgress(steps, 'language_selection');
    expect(updated[1].status).toBe('in_progress');
  });

  it('uses updateStepStatus internally', () => {
    const steps = getDefaultSteps();
    const updated = markStepInProgress(steps, 'welcome');
    expect(updated[0].status).toBe('in_progress');
  });
});

describe('Onboarding Progress — getStepById', () => {
  it('returns step when found', () => {
    const steps = getDefaultSteps();
    const step = getStepById(steps, 'welcome');
    expect(step).toBeDefined();
    expect(step?.id).toBe('welcome');
  });

  it('returns undefined when not found', () => {
    const steps = getDefaultSteps();
    const step = getStepById(steps, 'nonexistent' as any);
    expect(step).toBeUndefined();
  });

  it('returns correct step for each ID', () => {
    const steps = getDefaultSteps();
    expect(getStepById(steps, 'language_selection')?.title).toBe('Select Your Languages');
    expect(getStepById(steps, 'ai_provider_setup')?.title).toBe('Configure AI Translation');
  });
});

describe('Onboarding Progress — areRequiredStepsCompleted', () => {
  it('returns false when no steps completed', () => {
    const steps = getDefaultSteps();
    expect(areRequiredStepsCompleted(steps)).toBe(false);
  });

  it('returns false when only one required step completed', () => {
    const steps = getDefaultSteps();
    steps[1] = { ...steps[1], status: 'completed' };
    expect(areRequiredStepsCompleted(steps)).toBe(false);
  });

  it('returns true when all required steps completed', () => {
    const steps = getDefaultSteps();
    steps[1] = { ...steps[1], status: 'completed' };
    steps[2] = { ...steps[2], status: 'completed' };
    expect(areRequiredStepsCompleted(steps)).toBe(true);
  });

  it('ignores non-required steps', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'completed' };
    steps[3] = { ...steps[3], status: 'completed' };
    expect(areRequiredStepsCompleted(steps)).toBe(false);
  });
});

describe('Onboarding Progress — getStepOrderIndex', () => {
  it('returns 0 for welcome', () => {
    expect(getStepOrderIndex('welcome')).toBe(0);
  });

  it('returns 5 for completion', () => {
    expect(getStepOrderIndex('completion')).toBe(5);
  });

  it('returns correct indices for all steps', () => {
    expect(getStepOrderIndex('language_selection')).toBe(1);
    expect(getStepOrderIndex('ai_provider_setup')).toBe(2);
    expect(getStepOrderIndex('first_translation')).toBe(3);
    expect(getStepOrderIndex('storefront_preview')).toBe(4);
  });
});

describe('Onboarding Progress — compareSteps', () => {
  it('returns negative when first step comes before second', () => {
    expect(compareSteps('welcome', 'language_selection')).toBeLessThan(0);
    expect(compareSteps('ai_provider_setup', 'completion')).toBeLessThan(0);
  });

  it('returns positive when first step comes after second', () => {
    expect(compareSteps('completion', 'welcome')).toBeGreaterThan(0);
    expect(compareSteps('storefront_preview', 'language_selection')).toBeGreaterThan(0);
  });

  it('returns 0 when comparing same step', () => {
    expect(compareSteps('welcome', 'welcome')).toBe(0);
    expect(compareSteps('completion', 'completion')).toBe(0);
  });
});

describe('Onboarding Progress — isStepBefore', () => {
  it('returns true when step comes before target', () => {
    expect(isStepBefore('welcome', 'language_selection')).toBe(true);
    expect(isStepBefore('language_selection', 'completion')).toBe(true);
  });

  it('returns false when step comes after target', () => {
    expect(isStepBefore('completion', 'welcome')).toBe(false);
    expect(isStepBefore('ai_provider_setup', 'welcome')).toBe(false);
  });

  it('returns false when comparing same step', () => {
    expect(isStepBefore('welcome', 'welcome')).toBe(false);
  });
});

describe('Onboarding Progress — isStepAfter', () => {
  it('returns true when step comes after target', () => {
    expect(isStepAfter('language_selection', 'welcome')).toBe(true);
    expect(isStepAfter('completion', 'first_translation')).toBe(true);
  });

  it('returns false when step comes before target', () => {
    expect(isStepAfter('welcome', 'completion')).toBe(false);
    expect(isStepAfter('language_selection', 'ai_provider_setup')).toBe(false);
  });

  it('returns false when comparing same step', () => {
    expect(isStepAfter('completion', 'completion')).toBe(false);
  });
});

describe('Onboarding Progress — getStepSummary', () => {
  it('returns summary for all steps', () => {
    const steps = getDefaultSteps();
    const summary = getStepSummary(steps);
    expect(summary).toHaveLength(6);
  });

  it('includes required flag for required steps', () => {
    const steps = getDefaultSteps();
    const summary = getStepSummary(steps);
    const languageStep = summary.find((s) => s.id === 'language_selection');
    const aiStep = summary.find((s) => s.id === 'ai_provider_setup');
    const welcomeStep = summary.find((s) => s.id === 'welcome');

    expect(languageStep?.isRequired).toBe(true);
    expect(aiStep?.isRequired).toBe(true);
    expect(welcomeStep?.isRequired).toBe(false);
  });

  it('preserves step status in summary', () => {
    const steps = getDefaultSteps();
    steps[0] = { ...steps[0], status: 'completed' };
    steps[1] = { ...steps[1], status: 'in_progress' };
    const summary = getStepSummary(steps);

    expect(summary[0].status).toBe('completed');
    expect(summary[1].status).toBe('in_progress');
  });

  it('includes id and title for each step', () => {
    const steps = getDefaultSteps();
    const summary = getStepSummary(steps);
    for (const item of summary) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('isRequired');
    }
  });
});
