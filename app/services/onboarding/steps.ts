import type {
  CompletionChecklistItem,
  OnboardingCompletionData,
  OnboardingStep,
  OnboardingStepId,
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
