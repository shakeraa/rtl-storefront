import type {
  OnboardingState,
  OnboardingStepId,
  OnboardingStatus,
} from "./types";
import { buildCompletionChecklist, getDefaultSteps, getNextStep } from "./steps";

/**
 * Create a new onboarding state for a shop.
 */
export function createOnboardingState(shop: string): OnboardingState {
  return {
    shop,
    currentStep: "welcome",
    steps: getDefaultSteps(),
    startedAt: new Date().toISOString(),
    isComplete: false,
  };
}

/**
 * Mark a step as completed and advance to the next step.
 */
export function completeStep(
  state: OnboardingState,
  stepId: OnboardingStepId,
  data?: Record<string, unknown>,
): OnboardingState {
  const updatedSteps = state.steps.map((step) => {
    if (step.id === stepId) {
      return {
        ...step,
        status: "completed" as OnboardingStatus,
        completedAt: new Date().toISOString(),
        data: data ?? step.data,
      };
    }
    return step;
  });

  const nextStep = getNextStep(stepId);
  const allComplete = updatedSteps.every(
    (s) => s.status === "completed" || s.status === "skipped",
  );

  return {
    ...state,
    steps: updatedSteps,
    currentStep: nextStep ?? stepId,
    isComplete: allComplete,
    completedAt: allComplete ? new Date().toISOString() : undefined,
  };
}

/**
 * Skip a step and advance to the next.
 */
export function skipStep(
  state: OnboardingState,
  stepId: OnboardingStepId,
): OnboardingState {
  const updatedSteps = state.steps.map((step) => {
    if (step.id === stepId) {
      return { ...step, status: "skipped" as OnboardingStatus };
    }
    return step;
  });

  const nextStep = getNextStep(stepId);

  return {
    ...state,
    steps: updatedSteps,
    currentStep: nextStep ?? stepId,
  };
}

/**
 * Navigate to a specific step (for going back).
 */
export function goToStep(
  state: OnboardingState,
  stepId: OnboardingStepId,
): OnboardingState {
  return { ...state, currentStep: stepId };
}

/**
 * Check if onboarding is ready for completion.
 * All required steps must be completed.
 */
export function canComplete(state: OnboardingState): boolean {
  const { allRequiredComplete } = buildCompletionChecklist(state.steps);
  return allRequiredComplete;
}

/**
 * Get the current step details from state.
 */
export function getCurrentStep(state: OnboardingState) {
  return state.steps.find((s) => s.id === state.currentStep) ?? state.steps[0];
}

/**
 * Reset onboarding to the beginning.
 */
export function resetOnboarding(shop: string): OnboardingState {
  return createOnboardingState(shop);
}
