import type {
  CompletionChecklistItem,
  OnboardingCompletionData,
  OnboardingStep,
  OnboardingStepId,
  OnboardingStatus,
} from "./types";

/**
 * Default onboarding step definitions.
 */
export function getDefaultSteps(): OnboardingStep[] {
  return [
    {
      id: "welcome",
      title: "Welcome to RTL Storefront",
      description: "Learn how RTL Storefront helps you reach MENA markets with AI-powered translation and RTL support.",
      order: 0,
      status: "not_started",
    },
    {
      id: "language_selection",
      title: "Select Your Languages",
      description: "Choose your store's source language and the target languages you want to translate to.",
      order: 1,
      status: "not_started",
    },
    {
      id: "ai_provider_setup",
      title: "Configure AI Translation",
      description: "Set up your preferred AI translation provider (OpenAI, DeepL, or Google Translate).",
      order: 2,
      status: "not_started",
    },
    {
      id: "first_translation",
      title: "Your First Translation",
      description: "See AI translation in action with a sample from your store.",
      order: 3,
      status: "not_started",
    },
    {
      id: "storefront_preview",
      title: "Preview Your Storefront",
      description: "See how your store looks in the target language with RTL layout adjustments.",
      order: 4,
      status: "not_started",
    },
    {
      id: "completion",
      title: "You're All Set!",
      description: "Review your setup and start translating your store.",
      order: 5,
      status: "not_started",
    },
  ];
}

/**
 * Get the next step after the current one.
 */
export function getNextStep(currentStepId: OnboardingStepId): OnboardingStepId | null {
  const order: OnboardingStepId[] = [
    "welcome",
    "language_selection",
    "ai_provider_setup",
    "first_translation",
    "storefront_preview",
    "completion",
  ];

  const currentIndex = order.indexOf(currentStepId);
  if (currentIndex === -1 || currentIndex === order.length - 1) {
    return null;
  }
  return order[currentIndex + 1];
}

/**
 * Get the previous step before the current one.
 */
export function getPreviousStep(currentStepId: OnboardingStepId): OnboardingStepId | null {
  const order: OnboardingStepId[] = [
    "welcome",
    "language_selection",
    "ai_provider_setup",
    "first_translation",
    "storefront_preview",
    "completion",
  ];

  const currentIndex = order.indexOf(currentStepId);
  if (currentIndex <= 0) {
    return null;
  }
  return order[currentIndex - 1];
}

/**
 * Calculate onboarding progress percentage.
 */
export function calculateProgress(steps: OnboardingStep[]): number {
  const completed = steps.filter(
    (s) => s.status === "completed" || s.status === "skipped",
  ).length;
  return Math.round((completed / steps.length) * 100);
}

/**
 * Get detailed progress information.
 */
export function getProgressDetails(steps: OnboardingStep[]): {
  total: number;
  completed: number;
  skipped: number;
  remaining: number;
  inProgress: number;
  percentage: number;
} {
  const total = steps.length;
  const completed = steps.filter((s) => s.status === "completed").length;
  const skipped = steps.filter((s) => s.status === "skipped").length;
  const inProgress = steps.filter((s) => s.status === "in_progress").length;
  const remaining = total - completed - skipped;
  const percentage = Math.round(((completed + skipped) / total) * 100);

  return { total, completed, skipped, remaining, inProgress, percentage };
}

/**
 * Get the current step number (1-indexed).
 */
export function getCurrentStepNumber(
  steps: OnboardingStep[],
  currentStepId: OnboardingStepId,
): number {
  const index = steps.findIndex((s) => s.id === currentStepId);
  return index === -1 ? 1 : index + 1;
}

/**
 * Get completed steps.
 */
export function getCompletedSteps(steps: OnboardingStep[]): OnboardingStep[] {
  return steps.filter((s) => s.status === "completed");
}

/**
 * Get remaining steps.
 */
export function getRemainingSteps(steps: OnboardingStep[]): OnboardingStep[] {
  return steps.filter((s) => s.status !== "completed" && s.status !== "skipped");
}

/**
 * Check if a step is the first step.
 */
export function isFirstStep(stepId: OnboardingStepId): boolean {
  return stepId === "welcome";
}

/**
 * Check if a step is the last step.
 */
export function isLastStep(stepId: OnboardingStepId): boolean {
  return stepId === "completion";
}

/**
 * Check if a step can be skipped.
 */
export function canSkipStep(stepId: OnboardingStepId): boolean {
  // Required steps cannot be skipped
  const requiredSteps: OnboardingStepId[] = ["language_selection", "ai_provider_setup"];
  return !requiredSteps.includes(stepId);
}

/**
 * Update step status.
 */
export function updateStepStatus(
  steps: OnboardingStep[],
  stepId: OnboardingStepId,
  status: OnboardingStatus,
): OnboardingStep[] {
  return steps.map((step) => {
    if (step.id === stepId) {
      return { ...step, status };
    }
    return step;
  });
}

/**
 * Mark a step as in progress.
 */
export function markStepInProgress(
  steps: OnboardingStep[],
  stepId: OnboardingStepId,
): OnboardingStep[] {
  return updateStepStatus(steps, stepId, "in_progress");
}

/**
 * Get step by ID.
 */
export function getStepById(
  steps: OnboardingStep[],
  stepId: OnboardingStepId,
): OnboardingStep | undefined {
  return steps.find((s) => s.id === stepId);
}

/**
 * Check if all required steps are completed.
 */
export function areRequiredStepsCompleted(steps: OnboardingStep[]): boolean {
  const requiredSteps: OnboardingStepId[] = ["language_selection", "ai_provider_setup"];
  return requiredSteps.every(
    (requiredId) => steps.find((s) => s.id === requiredId)?.status === "completed",
  );
}

/**
 * Build the completion checklist based on onboarding state.
 */
export function buildCompletionChecklist(
  steps: OnboardingStep[],
): OnboardingCompletionData {
  const checklist: CompletionChecklistItem[] = [
    {
      id: "languages_configured",
      label: "Languages selected",
      completed: steps.find((s) => s.id === "language_selection")?.status === "completed",
      required: true,
    },
    {
      id: "ai_provider_configured",
      label: "AI translation provider configured",
      completed: steps.find((s) => s.id === "ai_provider_setup")?.status === "completed",
      required: true,
    },
    {
      id: "first_translation_done",
      label: "First translation completed",
      completed: steps.find((s) => s.id === "first_translation")?.status === "completed",
      required: false,
    },
    {
      id: "storefront_previewed",
      label: "Storefront preview reviewed",
      completed: steps.find((s) => s.id === "storefront_preview")?.status === "completed",
      required: false,
    },
  ];

  const allRequiredComplete = checklist
    .filter((item) => item.required)
    .every((item) => item.completed);

  return { checklist, allRequiredComplete };
}

/**
 * Get step order index.
 */
export function getStepOrderIndex(stepId: OnboardingStepId): number {
  const order: OnboardingStepId[] = [
    "welcome",
    "language_selection",
    "ai_provider_setup",
    "first_translation",
    "storefront_preview",
    "completion",
  ];
  return order.indexOf(stepId);
}

/**
 * Compare two steps to determine which comes first.
 * Returns negative if stepA comes before stepB, positive if after, 0 if same.
 */
export function compareSteps(stepA: OnboardingStepId, stepB: OnboardingStepId): number {
  return getStepOrderIndex(stepA) - getStepOrderIndex(stepB);
}

/**
 * Check if a step comes before another.
 */
export function isStepBefore(currentStepId: OnboardingStepId, targetStepId: OnboardingStepId): boolean {
  return compareSteps(currentStepId, targetStepId) < 0;
}

/**
 * Check if a step comes after another.
 */
export function isStepAfter(currentStepId: OnboardingStepId, targetStepId: OnboardingStepId): boolean {
  return compareSteps(currentStepId, targetStepId) > 0;
}

/**
 * Get step summary for display.
 */
export function getStepSummary(steps: OnboardingStep[]): {
  id: string;
  title: string;
  status: OnboardingStatus;
  isRequired: boolean;
}[] {
  const requiredSteps: OnboardingStepId[] = ["language_selection", "ai_provider_setup"];
  
  return steps.map((step) => ({
    id: step.id,
    title: step.title,
    status: step.status,
    isRequired: requiredSteps.includes(step.id),
  }));
}
