export type OnboardingStepId =
  | "welcome"
  | "language_selection"
  | "ai_provider_setup"
  | "first_translation"
  | "storefront_preview"
  | "completion";

export type OnboardingStatus = "not_started" | "in_progress" | "completed" | "skipped";

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  order: number;
  status: OnboardingStatus;
  completedAt?: string;
  data?: Record<string, unknown>;
}

export interface OnboardingState {
  shop: string;
  currentStep: OnboardingStepId;
  steps: OnboardingStep[];
  startedAt: string;
  completedAt?: string;
  isComplete: boolean;
}

export interface LanguageSelectionData {
  sourceLocale: string;
  targetLocales: string[];
  primaryTargetLocale: string;
}

export interface AIProviderSetupData {
  selectedProvider: string;
  apiKeyConfigured: boolean;
  testTranslationSuccessful: boolean;
}

export interface FirstTranslationData {
  sampleText: string;
  translatedText: string;
  sourceLocale: string;
  targetLocale: string;
  provider: string;
}

export interface CompletionChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingCompletionData {
  checklist: CompletionChecklistItem[];
  allRequiredComplete: boolean;
}
