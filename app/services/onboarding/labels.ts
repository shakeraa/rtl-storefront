import type { OnboardingStepId } from "./types";

export type SupportedLocale = "en" | "ar" | "he" | "fr" | "es" | "de";

export interface StepLabels {
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  skipAction: string;
  helpText?: string;
}

export interface ProgressLabels {
  stepIndicator: string;
  ofText: string;
  completedText: string;
  remainingText: string;
  percentageText: string;
}

export interface OnboardingLabels {
  welcomeMessage: string;
  completionMessage: string;
  completionTitle: string;
  progress: ProgressLabels;
  steps: Record<OnboardingStepId, StepLabels>;
  navigation: {
    next: string;
    back: string;
    finish: string;
    saveAndContinue: string;
    exit: string;
  };
  errors: {
    generic: string;
    requiredField: string;
    invalidConfiguration: string;
    networkError: string;
  };
}

const labels: Record<SupportedLocale, OnboardingLabels> = {
  en: {
    welcomeMessage:
      "Welcome to RTL Storefront! Let's get your store ready for MENA markets with AI-powered translation and RTL support.",
    completionMessage:
      "Congratulations! Your store is now configured for RTL and multilingual support. Start reaching new markets today!",
    completionTitle: "You're All Set!",
    progress: {
      stepIndicator: "Step",
      ofText: "of",
      completedText: "completed",
      remainingText: "remaining",
      percentageText: "complete",
    },
    steps: {
      welcome: {
        title: "Welcome to RTL Storefront",
        description:
          "Learn how RTL Storefront helps you reach MENA markets with AI-powered translation and RTL support.",
        primaryAction: "Get Started",
        secondaryAction: "Learn More",
        skipAction: "Skip Tour",
        helpText: "This wizard will guide you through the setup process",
      },
      language_selection: {
        title: "Select Your Languages",
        description:
          "Choose your store's source language and the target languages you want to translate to.",
        primaryAction: "Continue",
        secondaryAction: "Back",
        skipAction: "Skip",
        helpText: "You can add more languages later in settings",
      },
      ai_provider_setup: {
        title: "Configure AI Translation",
        description:
          "Set up your preferred AI translation provider (OpenAI, DeepL, or Google Translate).",
        primaryAction: "Save & Continue",
        secondaryAction: "Back",
        skipAction: "Configure Later",
        helpText: "Your API keys are encrypted and stored securely",
      },
      first_translation: {
        title: "Your First Translation",
        description: "See AI translation in action with a sample from your store.",
        primaryAction: "Translate Sample",
        secondaryAction: "Back",
        skipAction: "Skip Preview",
        helpText: "This helps verify your AI provider configuration",
      },
      storefront_preview: {
        title: "Preview Your Storefront",
        description:
          "See how your store looks in the target language with RTL layout adjustments.",
        primaryAction: "Continue",
        secondaryAction: "Back",
        skipAction: "Skip Preview",
        helpText: "Preview shows RTL layout with translated content",
      },
      completion: {
        title: "You're All Set!",
        description: "Review your setup and start translating your store.",
        primaryAction: "Start Translating",
        secondaryAction: "Review Settings",
        skipAction: "Close",
        helpText: "You can always return to this wizard from settings",
      },
    },
    navigation: {
      next: "Next",
      back: "Back",
      finish: "Finish",
      saveAndContinue: "Save & Continue",
      exit: "Exit Setup",
    },
    errors: {
      generic: "Something went wrong. Please try again.",
      requiredField: "This field is required",
      invalidConfiguration: "Please check your configuration",
      networkError: "Network error. Please check your connection.",
    },
  },
  ar: {
    welcomeMessage:
      "مرحباً بك في RTL Storefront! دعنا نجهز متجرك لأسواق الشرق الأوسط وشمال أفريقيا مع الترجمة المدعومة بالذكاء الاصطناعي ودعم RTL.",
    completionMessage:
      "تهانينا! تم تكوين متجرك الآن لدعم RTL والتعدد اللغوي. ابدأ في الوصول إلى أسواق جديدة اليوم!",
    completionTitle: "كل شيء جاهز!",
    progress: {
      stepIndicator: "الخطوة",
      ofText: "من",
      completedText: "مكتمل",
      remainingText: "متبقي",
      percentageText: "مكتمل",
    },
    steps: {
      welcome: {
        title: "مرحباً بك في RTL Storefront",
        description:
          "تعرف على كيفية مساعدة RTL Storefront في الوصول إلى أسواق الشرق الأوسط وشمال أفريقيا مع الترجمة المدعومة بالذكاء الاصطناعي ودعم RTL.",
        primaryAction: "البدء",
        secondaryAction: "تعرف أكثر",
        skipAction: "تخطي الجولة",
        helpText: "سيرشدك هذا المعالج خلال عملية الإعداد",
      },
      language_selection: {
        title: "اختيار اللغات",
        description: "اختر لغة المصدر في متجرك واللغات المستهدفة التي تريد الترجمة إليها.",
        primaryAction: "متابعة",
        secondaryAction: "رجوع",
        skipAction: "تخطي",
        helpText: "يمكنك إضافة المزيد من اللغات لاحقاً في الإعدادات",
      },
      ai_provider_setup: {
        title: "تكوين الترجمة بالذكاء الاصطناعي",
        description:
          "قم بإعداد مزود الترجمة بالذكاء الاصطناعي المفضل لديك (OpenAI أو DeepL أو Google Translate).",
        primaryAction: "حفظ ومتابعة",
        secondaryAction: "رجوع",
        skipAction: "التكوين لاحقاً",
        helpText: "مفاتيح API الخاصة بك مشفرة ومخزنة بشكل آمن",
      },
      first_translation: {
        title: "أول ترجمة لك",
        description: "شاهد الترجمة بالذكاء الاصطناعي أثناء العمل مع عينة من متجرك.",
        primaryAction: "ترجمة العينة",
        secondaryAction: "رجوع",
        skipAction: "تخطي المعاينة",
        helpText: "يساعد هذا في التحقق من تكوين مزود الذكاء الاصطناعي",
      },
      storefront_preview: {
        title: "معاينة واجهة المتجر",
        description: "شاهد كيف يبدو متجرك باللغة المستهدفة مع تعديلات تخطيط RTL.",
        primaryAction: "متابعة",
        secondaryAction: "رجوع",
        skipAction: "تخطي المعاينة",
        helpText: "تعرض المعاينة تخطيط RTL مع المحتوى المترجم",
      },
      completion: {
        title: "كل شيء جاهز!",
        description: "راجع إعداداتك وابدأ في ترجمة متجرك.",
        primaryAction: "بدء الترجمة",
        secondaryAction: "مراجعة الإعدادات",
        skipAction: "إغلاق",
        helpText: "يمكنك دائماً العودة إلى هذا المعالج من الإعدادات",
      },
    },
    navigation: {
      next: "التالي",
      back: "رجوع",
      finish: "إنهاء",
      saveAndContinue: "حفظ ومتابعة",
      exit: "خروج من الإعداد",
    },
    errors: {
      generic: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      requiredField: "هذا الحقل مطلوب",
      invalidConfiguration: "يرجى التحقق من التكوين",
      networkError: "خطأ في الشبكة. يرجى التحقق من الاتصال.",
    },
  },
  he: {
    welcomeMessage:
      "ברוכים הבאים ל-RTL Storefront! בואו נכין את החנות שלכם לשווקי MENA עם תרגום מופעל בינה מלאכותית ותמיכה ב-RTL.",
    completionMessage:
      "מזל טוב! החנות שלך מוגדרת כעת לתמיכה ב-RTL ורב-לשוני. התחל להגיע לשווקים חדשים היום!",
    completionTitle: "הכל מוכן!",
    progress: {
      stepIndicator: "שלב",
      ofText: "מתוך",
      completedText: "הושלם",
      remainingText: "נותרו",
      percentageText: "הושלם",
    },
    steps: {
      welcome: {
        title: "ברוכים הבאים ל-RTL Storefront",
        description:
          "למדו כיצד RTL Storefront עוזר להגיע לשווקי MENA עם תרגום מופעל בינה מלאכותית ותמיכה ב-RTL.",
        primaryAction: "מתחילים",
        secondaryAction: "למידע נוסף",
        skipAction: "דלגו על הסיור",
        helpText: "אשף זה ידריך אתכם בתהליך ההגדרה",
      },
      language_selection: {
        title: "בחרו שפות",
        description: "בחרו את שפת המקור של החנות ואת השפות היעד שאליהן תרצו לתרגם.",
        primaryAction: "המשך",
        secondaryAction: "חזרה",
        skipAction: "דלג",
        helpText: "ניתן להוסיף שפות נוספות מאוחר יותר בהגדרות",
      },
      ai_provider_setup: {
        title: "הגדרת תרגום AI",
        description: "הגדר את ספק תרגום ה-AI המועדף עליך (OpenAI, DeepL, או Google Translate).",
        primaryAction: "שמור והמשך",
        secondaryAction: "חזרה",
        skipAction: "הגדר מאוחר יותר",
        helpText: "מפתחות ה-API שלך מוצפנים ונשמרים בצורה מאובטחת",
      },
      first_translation: {
        title: "התרגום הראשון שלך",
        description: "ראה את תרגום ה-AI בפעולה עם דוגמה מהחנות שלך.",
        primaryAction: "תרגם דוגמה",
        secondaryAction: "חזרה",
        skipAction: "דלג על התצוגה המקדימה",
        helpText: "זה עוזר לאמת את תצורת ספק ה-AI שלך",
      },
      storefront_preview: {
        title: "תצוגה מקדימה של החנות",
        description: "ראה איך החנות שלך נראית בשפת היעד עם התאמות פריסת RTL.",
        primaryAction: "המשך",
        secondaryAction: "חזרה",
        skipAction: "דלג על התצוגה המקדימה",
        helpText: "תצוגה מקדימה מציגה פריסת RTL עם תוכן מתורגם",
      },
      completion: {
        title: "הכל מוכן!",
        description: "סקור את ההגדרות והתחל לתרגם את החנות שלך.",
        primaryAction: "התחל לתרגם",
        secondaryAction: "סקור הגדרות",
        skipAction: "סגור",
        helpText: "תמיד תוכל לחזור לאשף זה מההגדרות",
      },
    },
    navigation: {
      next: "הבא",
      back: "חזרה",
      finish: "סיום",
      saveAndContinue: "שמור והמשך",
      exit: "יציאה מההגדרה",
    },
    errors: {
      generic: "משהו השתבש. אנא נסה שוב.",
      requiredField: "שדה זה נדרש",
      invalidConfiguration: "אנא בדוק את התצורה שלך",
      networkError: "שגיאת רשת. אנא בדוק את החיבור שלך.",
    },
  },
  fr: {
    welcomeMessage:
      "Bienvenue dans RTL Storefront ! Préparons votre boutique pour les marchés MENA avec la traduction IA et le support RTL.",
    completionMessage:
      "Félicitations ! Votre boutique est maintenant configurée pour RTL et le multilingue. Commencez à atteindre de nouveaux marchés dès aujourd'hui !",
    completionTitle: "Tout est prêt !",
    progress: {
      stepIndicator: "Étape",
      ofText: "sur",
      completedText: "terminé",
      remainingText: "restant",
      percentageText: "terminé",
    },
    steps: {
      welcome: {
        title: "Bienvenue dans RTL Storefront",
        description:
          "Découvrez comment RTL Storefront vous aide à atteindre les marchés MENA avec la traduction IA et le support RTL.",
        primaryAction: "Commencer",
        secondaryAction: "En savoir plus",
        skipAction: "Passer la visite",
        helpText: "Cet assistant vous guidera tout au long du processus de configuration",
      },
      language_selection: {
        title: "Sélectionner les langues",
        description:
          "Choisissez la langue source de votre boutique et les langues cibles vers lesquelles vous souhaitez traduire.",
        primaryAction: "Continuer",
        secondaryAction: "Retour",
        skipAction: "Passer",
        helpText: "Vous pouvez ajouter d'autres langues plus tard dans les paramètres",
      },
      ai_provider_setup: {
        title: "Configurer la traduction IA",
        description:
          "Configurez votre fournisseur de traduction IA préféré (OpenAI, DeepL ou Google Translate).",
        primaryAction: "Enregistrer et continuer",
        secondaryAction: "Retour",
        skipAction: "Configurer plus tard",
        helpText: "Vos clés API sont chiffrées et stockées en toute sécurité",
      },
      first_translation: {
        title: "Votre première traduction",
        description: "Voir la traduction IA en action avec un échantillon de votre boutique.",
        primaryAction: "Traduire l'échantillon",
        secondaryAction: "Retour",
        skipAction: "Passer l'aperçu",
        helpText: "Cela permet de vérifier la configuration de votre fournisseur d'IA",
      },
      storefront_preview: {
        title: "Aperçu de la boutique",
        description: "Découvrez l'apparence de votre boutique dans la langue cible avec les ajustements de mise en page RTL.",
        primaryAction: "Continuer",
        secondaryAction: "Retour",
        skipAction: "Passer l'aperçu",
        helpText: "L'aperçu montre la mise en page RTL avec le contenu traduit",
      },
      completion: {
        title: "Tout est prêt !",
        description: "Vérifiez votre configuration et commencez à traduire votre boutique.",
        primaryAction: "Commencer la traduction",
        secondaryAction: "Vérifier les paramètres",
        skipAction: "Fermer",
        helpText: "Vous pouvez toujours revenir à cet assistant depuis les paramètres",
      },
    },
    navigation: {
      next: "Suivant",
      back: "Retour",
      finish: "Terminer",
      saveAndContinue: "Enregistrer et continuer",
      exit: "Quitter la configuration",
    },
    errors: {
      generic: "Une erreur s'est produite. Veuillez réessayer.",
      requiredField: "Ce champ est obligatoire",
      invalidConfiguration: "Veuillez vérifier votre configuration",
      networkError: "Erreur réseau. Veuillez vérifier votre connexion.",
    },
  },
  es: {
    welcomeMessage:
      "¡Bienvenido a RTL Storefront! Preparemos tu tienda para los mercados de MENA con traducción impulsada por IA y soporte RTL.",
    completionMessage:
      "¡Felicitaciones! Tu tienda ahora está configurada para RTL y soporte multilingüe. ¡Comienza a llegar a nuevos mercados hoy!",
    completionTitle: "¡Todo listo!",
    progress: {
      stepIndicator: "Paso",
      ofText: "de",
      completedText: "completado",
      remainingText: "restante",
      percentageText: "completado",
    },
    steps: {
      welcome: {
        title: "Bienvenido a RTL Storefront",
        description:
          "Aprende cómo RTL Storefront te ayuda a llegar a los mercados de MENA con traducción impulsada por IA y soporte RTL.",
        primaryAction: "Comenzar",
        secondaryAction: "Más información",
        skipAction: "Omitir tour",
        helpText: "Este asistente te guiará a través del proceso de configuración",
      },
      language_selection: {
        title: "Seleccionar idiomas",
        description:
          "Elige el idioma de origen de tu tienda y los idiomas de destino a los que deseas traducir.",
        primaryAction: "Continuar",
        secondaryAction: "Atrás",
        skipAction: "Omitir",
        helpText: "Puedes agregar más idiomas más tarde en la configuración",
      },
      ai_provider_setup: {
        title: "Configurar traducción IA",
        description:
          "Configura tu proveedor de traducción IA preferido (OpenAI, DeepL o Google Translate).",
        primaryAction: "Guardar y continuar",
        secondaryAction: "Atrás",
        skipAction: "Configurar más tarde",
        helpText: "Tus claves API están encriptadas y almacenadas de forma segura",
      },
      first_translation: {
        title: "Tu primera traducción",
        description: "Ve la traducción IA en acción con una muestra de tu tienda.",
        primaryAction: "Traducir muestra",
        secondaryAction: "Atrás",
        skipAction: "Omitir vista previa",
        helpText: "Esto ayuda a verificar la configuración de tu proveedor de IA",
      },
      storefront_preview: {
        title: "Vista previa de la tienda",
        description:
          "Ve cómo se ve tu tienda en el idioma de destino con ajustes de diseño RTL.",
        primaryAction: "Continuar",
        secondaryAction: "Atrás",
        skipAction: "Omitir vista previa",
        helpText: "La vista previa muestra el diseño RTL con contenido traducido",
      },
      completion: {
        title: "¡Todo listo!",
        description: "Revisa tu configuración y comienza a traducir tu tienda.",
        primaryAction: "Comenzar a traducir",
        secondaryAction: "Revisar configuración",
        skipAction: "Cerrar",
        helpText: "Siempre puedes volver a este asistente desde la configuración",
      },
    },
    navigation: {
      next: "Siguiente",
      back: "Atrás",
      finish: "Finalizar",
      saveAndContinue: "Guardar y continuar",
      exit: "Salir de la configuración",
    },
    errors: {
      generic: "Algo salió mal. Por favor, inténtalo de nuevo.",
      requiredField: "Este campo es obligatorio",
      invalidConfiguration: "Por favor, verifica tu configuración",
      networkError: "Error de red. Por favor, verifica tu conexión.",
    },
  },
  de: {
    welcomeMessage:
      "Willkommen bei RTL Storefront! Bereiten wir Ihren Shop für MENA-Märkte mit KI-gestützter Übersetzung und RTL-Unterstützung vor.",
    completionMessage:
      "Herzlichen Glückwunsch! Ihr Shop ist jetzt für RTL und mehrsprachige Unterstützung konfiguriert. Beginnen Sie noch heute, neue Märkte zu erreichen!",
    completionTitle: "Alles bereit!",
    progress: {
      stepIndicator: "Schritt",
      ofText: "von",
      completedText: "abgeschlossen",
      remainingText: "verbleibend",
      percentageText: "abgeschlossen",
    },
    steps: {
      welcome: {
        title: "Willkommen bei RTL Storefront",
        description:
          "Erfahren Sie, wie RTL Storefront Ihnen hilft, MENA-Märkte mit KI-gestützter Übersetzung und RTL-Unterstützung zu erreichen.",
        primaryAction: "Los geht's",
        secondaryAction: "Mehr erfahren",
        skipAction: "Tour überspringen",
        helpText: "Dieser Assistent führt Sie durch den Einrichtungsprozess",
      },
      language_selection: {
        title: "Sprachen auswählen",
        description:
          "Wählen Sie die Ausgangssprache Ihres Shops und die Zielsprachen, in die Sie übersetzen möchten.",
        primaryAction: "Weiter",
        secondaryAction: "Zurück",
        skipAction: "Überspringen",
        helpText: "Sie können später weitere Sprachen in den Einstellungen hinzufügen",
      },
      ai_provider_setup: {
        title: "KI-Übersetzung konfigurieren",
        description:
          "Richten Sie Ihren bevorzugten KI-Übersetzungsanbieter ein (OpenAI, DeepL oder Google Translate).",
        primaryAction: "Speichern & Weiter",
        secondaryAction: "Zurück",
        skipAction: "Später konfigurieren",
        helpText: "Ihre API-Schlüssel werden verschlüsselt und sicher gespeichert",
      },
      first_translation: {
        title: "Ihre erste Übersetzung",
        description: "Sehen Sie die KI-Übersetzung in Aktion mit einer Probe aus Ihrem Shop.",
        primaryAction: "Probe übersetzen",
        secondaryAction: "Zurück",
        skipAction: "Vorschau überspringen",
        helpText: "Dies hilft bei der Überprüfung Ihrer KI-Anbieter-Konfiguration",
      },
      storefront_preview: {
        title: "Shop-Vorschau",
        description:
          "Sehen Sie, wie Ihr Shop in der Zielsprache mit RTL-Layout-Anpassungen aussieht.",
        primaryAction: "Weiter",
        secondaryAction: "Zurück",
        skipAction: "Vorschau überspringen",
        helpText: "Die Vorschau zeigt das RTL-Layout mit übersetztem Inhalt",
      },
      completion: {
        title: "Alles bereit!",
        description: "Überprüfen Sie Ihre Einrichtung und beginnen Sie mit der Übersetzung Ihres Shops.",
        primaryAction: "Mit Übersetzung beginnen",
        secondaryAction: "Einstellungen überprüfen",
        skipAction: "Schließen",
        helpText: "Sie können jederzeit zu diesem Assistenten über die Einstellungen zurückkehren",
      },
    },
    navigation: {
      next: "Weiter",
      back: "Zurück",
      finish: "Fertigstellen",
      saveAndContinue: "Speichern & Weiter",
      exit: "Einrichtung beenden",
    },
    errors: {
      generic: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
      requiredField: "Dieses Feld ist erforderlich",
      invalidConfiguration: "Bitte überprüfen Sie Ihre Konfiguration",
      networkError: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
    },
  },
};

/**
 * Get the default locale for fallback
 */
function getDefaultLocale(): SupportedLocale {
  return "en";
}

/**
 * Normalize locale string to supported locale
 */
function normalizeLocale(locale: string): SupportedLocale {
  const normalized = locale.split("-")[0].toLowerCase();
  if (normalized in labels) {
    return normalized as SupportedLocale;
  }
  return getDefaultLocale();
}

/**
 * Get all onboarding steps with localized labels
 */
export function getOnboardingSteps(locale: string = "en"): {
  id: string;
  order: number;
  labels: StepLabels;
}[] {
  const normalizedLocale = normalizeLocale(locale);
  const localeLabels = labels[normalizedLocale];
  const stepOrder: OnboardingStepId[] = [
    "welcome",
    "language_selection",
    "ai_provider_setup",
    "first_translation",
    "storefront_preview",
    "completion",
  ];

  return stepOrder.map((stepId, index) => ({
    id: stepId,
    order: index,
    labels: localeLabels.steps[stepId],
  }));
}

/**
 * Get labels for a specific step
 */
export function getStepLabels(stepId: OnboardingStepId, locale: string = "en"): StepLabels {
  const normalizedLocale = normalizeLocale(locale);
  return labels[normalizedLocale].steps[stepId];
}

/**
 * Get the welcome message for the onboarding wizard
 */
export function getWelcomeMessage(locale: string = "en"): string {
  const normalizedLocale = normalizeLocale(locale);
  return labels[normalizedLocale].welcomeMessage;
}

/**
 * Get the completion message for the onboarding wizard
 */
export function getCompletionMessage(locale: string = "en"): string {
  const normalizedLocale = normalizeLocale(locale);
  return labels[normalizedLocale].completionMessage;
}

/**
 * Get the completion title
 */
export function getCompletionTitle(locale: string = "en"): string {
  const normalizedLocale = normalizeLocale(locale);
  return labels[normalizedLocale].completionTitle;
}

/**
 * Get progress labels
 */
export function getProgressLabels(locale: string = "en"): ProgressLabels {
  const normalizedLocale = normalizeLocale(locale);
  return labels[normalizedLocale].progress;
}

/**
 * Get navigation labels
 */
export function getNavigationLabels(locale: string = "en"): OnboardingLabels["navigation"] {
  const normalizedLocale = normalizeLocale(locale);
  return labels[normalizedLocale].navigation;
}

/**
 * Get error messages
 */
export function getErrorLabels(locale: string = "en"): OnboardingLabels["errors"] {
  const normalizedLocale = normalizeLocale(locale);
  return labels[normalizedLocale].errors;
}

/**
 * Check if a locale is RTL
 */
export function isRTLLocale(locale: string): boolean {
  const rtlLocales = ["ar", "he", "ur", "fa"];
  const normalized = locale.split("-")[0].toLowerCase();
  return rtlLocales.includes(normalized);
}

/**
 * Get step indicator with proper formatting for RTL
 */
export function getStepIndicator(
  currentStep: number,
  totalSteps: number,
  locale: string = "en",
): string {
  const normalizedLocale = normalizeLocale(locale);
  const progressLabels = labels[normalizedLocale].progress;
  const isRTL = isRTLLocale(locale);

  if (isRTL) {
    return `${totalSteps} ${progressLabels.ofText} ${currentStep} ${progressLabels.stepIndicator}`;
  }
  return `${progressLabels.stepIndicator} ${currentStep} ${progressLabels.ofText} ${totalSteps}`;
}

/**
 * Get formatted progress percentage
 */
export function getProgressPercentage(percentage: number, locale: string = "en"): string {
  const normalizedLocale = normalizeLocale(locale);
  const progressLabels = labels[normalizedLocale].progress;
  return `${percentage}% ${progressLabels.percentageText}`;
}

/**
 * Get all supported locales
 */
export function getSupportedLocales(): { code: SupportedLocale; name: string; isRTL: boolean }[] {
  return [
    { code: "en", name: "English", isRTL: false },
    { code: "ar", name: "العربية", isRTL: true },
    { code: "he", name: "עברית", isRTL: true },
    { code: "fr", name: "Français", isRTL: false },
    { code: "es", name: "Español", isRTL: false },
    { code: "de", name: "Deutsch", isRTL: false },
  ];
}
