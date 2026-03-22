/**
 * Medical Disclaimer Translation Service
 * T0343: Translation - Medical Disclaimer
 *
 * Provides medical disclaimers, health content warnings,
 * and professional consultation notices in multiple locales (ar, he, en).
 */

export type SupportedLocale = 'ar' | 'he' | 'en';
export type DisclaimerType = 
  | 'general' 
  | 'product' 
  | 'supplement' 
  | 'device' 
  | 'emergency' 
  | 'consult-doctor'
  | 'not-medical-advice'
  | 'fda-not-evaluated';

export type WarningLevel = 'info' | 'warning' | 'critical';
export type MedicalClaimType = 'treatment' | 'cure' | 'prevention' | 'diagnosis' | 'guarantee';

export interface MedicalDisclaimer {
  type: DisclaimerType;
  locale: SupportedLocale;
  title: string;
  content: string;
  shortVersion: string;
  warningLevel: WarningLevel;
  requiresAcknowledgment: boolean;
}

export interface HealthWarningLabel {
  id: string;
  label: string;
  description: string;
  icon?: string;
  color: string;
}

export interface MedicalContentValidation {
  isValid: boolean;
  issues: MedicalContentIssue[];
  requiresDisclaimer: boolean;
  recommendedDisclaimers: DisclaimerType[];
}

export interface MedicalContentIssue {
  type: 'missing_disclaimer' | 'unverified_claim' | 'prohibited_content' | 'insufficient_warning';
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
}

export interface MedicalClaimCheck {
  hasMedicalClaims: boolean;
  detectedClaims: DetectedClaim[];
  riskLevel: 'low' | 'medium' | 'high';
  requiresRegulatoryReview: boolean;
}

export interface DetectedClaim {
  type: MedicalClaimType;
  text: string;
  position: number;
  confidence: number;
}

// Medical disclaimer templates for all supported locales
const MEDICAL_DISCLAIMERS: Record<DisclaimerType, Record<SupportedLocale, MedicalDisclaimer>> = {
  general: {
    ar: {
      type: 'general',
      locale: 'ar',
      title: 'إخلاء مسؤولية طبية',
      content: 'المعلومات المقدمة على هذا الموقع هي لأغراض إعلامية فقط ولا تشكل نصيحة طبية. لا يهدف المحتوى إلى تشخيص أو علاج أو منع أي مرض. يجب عليك دائماً استشارة مقدم الرعاية الصحية المؤهل قبل اتخاذ أي قرارات تتعلق بصحتك أو علاجك.',
      shortVersion: 'لأغراض إعلامية فقط - استشر طبيبك',
      warningLevel: 'info',
      requiresAcknowledgment: false,
    },
    he: {
      type: 'general',
      locale: 'he',
      title: 'כתב ויתור רפואי',
      content: 'המידע המסופק באתר זה הוא למטרות אינפורמטיביות בלבד ואינו מהווה ייעוץ רפואי. התוכן אינו מיועד לאבחון, טיפול או מניעה של מחלה כלשהי. עליך תמיד להתייעץ עם ספק שירותי הבריאות המוסמך שלך לפני קבלת החלטות הנוגעות לבריאותך או טיפולך.',
      shortVersion: 'למטרות אינפורמטיביות בלבד - התייעץ עם הרופא שלך',
      warningLevel: 'info',
      requiresAcknowledgment: false,
    },
    en: {
      type: 'general',
      locale: 'en',
      title: 'Medical Disclaimer',
      content: 'The information provided on this site is for informational purposes only and does not constitute medical advice. The content is not intended to diagnose, treat, or prevent any disease. You should always consult with your qualified healthcare provider before making any decisions regarding your health or treatment.',
      shortVersion: 'For informational purposes only - consult your doctor',
      warningLevel: 'info',
      requiresAcknowledgment: false,
    },
  },
  product: {
    ar: {
      type: 'product',
      locale: 'ar',
      title: 'إخلاء مسؤولية المنتج الطبي',
      content: 'هذا المنتج ليس دواءً ولا يغني عن الاستشارة الطبية. النتائج قد تختلف من شخص لآخر. يجب قراءة التعليمات بعناية والتوقف عن الاستخدام في حالة ظهور أعراض جانبية واستشارة الطبيب فوراً.',
      shortVersion: 'ليس دواءً - استشر الطبيب',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    he: {
      type: 'product',
      locale: 'he',
      title: 'כתב ויתור מוצר רפואי',
      content: 'מוצר זה אינו תרופה ואינו תחליף לייעוץ רפואי. התוצאות עשויות להשתנות מאדם לאדם. יש לקרוא את ההוראות בקפידה ולהפסיק את השימוש במקרה של תופעות לוואי ולפנות לרופא מיד.',
      shortVersion: 'אינו תרופה - התייעץ עם רופא',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    en: {
      type: 'product',
      locale: 'en',
      title: 'Medical Product Disclaimer',
      content: 'This product is not a medicine and does not replace medical consultation. Results may vary from person to person. Please read instructions carefully and discontinue use if side effects occur and consult a doctor immediately.',
      shortVersion: 'Not a medicine - consult your doctor',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
  },
  supplement: {
    ar: {
      type: 'supplement',
      locale: 'ar',
      title: 'تنبيه المكملات الغذائية',
      content: 'المكملات الغذائية لا تحل محل الغذاء المتنوع والمتوازن. يجب استشارة الطبيب قبل تناول المكملات خاصة للحوامل والمرضعات والأطفال ومن يتناولون أدوية موصوفة. لا تتجاوز الجرعة الموصى بها.',
      shortVersion: 'مكمل غذائي - استشر الطبيب',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    he: {
      type: 'supplement',
      locale: 'he',
      title: 'אזהרת תוספי תזונה',
      content: 'תוספי תזונה אינם תחליף לתזונה מגוונת ומאוזנת. יש להתייעץ עם רופא לפני נטילת תוספים, במיוחד לנשים בהריון ומניקות, ילדים, ומי שנוטל תרופות במרשם. אין לחרוג מהמינון המומלץ.',
      shortVersion: 'תוסף תזונה - התייעץ עם רופא',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    en: {
      type: 'supplement',
      locale: 'en',
      title: 'Dietary Supplement Warning',
      content: 'Dietary supplements are not a substitute for a varied and balanced diet. Consult a doctor before taking supplements, especially if pregnant, nursing, children, or taking prescription medications. Do not exceed the recommended dose.',
      shortVersion: 'Dietary supplement - consult your doctor',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
  },
  device: {
    ar: {
      type: 'device',
      locale: 'ar',
      title: 'تعليمات جهاز طبي',
      content: 'هذا الجهاز طبي مساعد ولا يغني عن الفحص الطبي. يجب استخدامه وفقاً للتعليمات المرفقة. في حالة وجود أعراض خطيرة، يرجى زيارة الطوارئ فوراً. احفظ الجهاز بعيداً عن متناول الأطفال.',
      shortVersion: 'جهاز مساعد - راجع التعليمات',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    he: {
      type: 'device',
      locale: 'he',
      title: 'הוראות מכשיר רפואי',
      content: 'מכשיר זה הוא מכשיר רפואי עזר ואינו תחליף לבדיקה רפואית. יש להשתמש בו בהתאם להוראות המצורפות. במקרה של תסמינים חמורים, יש לפנות לחדר המיון מיד. יש לשמור את המכשיר הרחק מהישג ידם של ילדים.',
      shortVersion: 'מכשיר עזר - עקוב אחר ההוראות',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    en: {
      type: 'device',
      locale: 'en',
      title: 'Medical Device Instructions',
      content: 'This device is an auxiliary medical device and does not replace medical examination. Use according to the attached instructions. In case of serious symptoms, please visit the emergency room immediately. Keep the device out of reach of children.',
      shortVersion: 'Auxiliary device - follow instructions',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
  },
  emergency: {
    ar: {
      type: 'emergency',
      locale: 'ar',
      title: 'تحذير طوارئ',
      content: 'في حالات الطوارئ الطبية، اتصل بالإسعاف فوراً. هذا الموقع والمنتجات لا تقدم رعاية طوارئ. للحالات المهددة للحياة، اتصل برقم الطوارئ المحلي أو توجه لأقرب قسم طوارئ.',
      shortVersion: 'اتصل بالإسعاف للحالات الطارئة',
      warningLevel: 'critical',
      requiresAcknowledgment: false,
    },
    he: {
      type: 'emergency',
      locale: 'he',
      content: 'במקרים של חירום רפואי, התקשר למד"א מיד. אתר זה והמוצרים אינם מספקים טיפול חירום. במקרים המסכנים חיים, התקשר למספר החירום המקומי או פנה למחלקת החירום הקרובה.',
      title: 'אזהרת חירום',
      shortVersion: 'התקשר למד"א למצבי חירום',
      warningLevel: 'critical',
      requiresAcknowledgment: false,
    },
    en: {
      type: 'emergency',
      locale: 'en',
      title: 'Emergency Warning',
      content: 'In cases of medical emergency, call emergency services immediately. This site and products do not provide emergency care. For life-threatening situations, call your local emergency number or go to the nearest emergency department.',
      shortVersion: 'Call emergency services for urgent cases',
      warningLevel: 'critical',
      requiresAcknowledgment: false,
    },
  },
  'consult-doctor': {
    ar: {
      type: 'consult-doctor',
      locale: 'ar',
      title: 'استشر الطبيب',
      content: 'يُنصح بشدة باستشارة الطبيب أو الصيدلي قبل استخدام هذا المنتج، خاصة إذا كنت تعاني من حالات طبية مزمنة، أو تتناول أدوية أخرى، أو لديك حساسية معروفة. لا تتجاهل النصائح الطبية المهنية.',
      shortVersion: 'استشر الطبيب قبل الاستخدام',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    he: {
      type: 'consult-doctor',
      locale: 'he',
      title: 'התייעץ עם רופא',
      content: 'מומלץ בחום להתייעץ עם רופא או רוקח לפני שימוש במוצר זה, במיוחד אם אתה סובל ממצבים רפואיים כרוניים, נוטל תרופות אחרות, או יש לך רגישות ידועה. אין להתעלם מעצות רפואיות מקצועיות.',
      shortVersion: 'התייעץ עם רופא לפני השימוש',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
    en: {
      type: 'consult-doctor',
      locale: 'en',
      title: 'Consult Your Doctor',
      content: 'It is strongly recommended to consult a doctor or pharmacist before using this product, especially if you have chronic medical conditions, are taking other medications, or have known allergies. Do not disregard professional medical advice.',
      shortVersion: 'Consult your doctor before use',
      warningLevel: 'warning',
      requiresAcknowledgment: true,
    },
  },
  'not-medical-advice': {
    ar: {
      type: 'not-medical-advice',
      locale: 'ar',
      title: 'ليس نصيحة طبية',
      content: 'المحتوى الوارد هنا لأغراض تعليمية وإعلامية فقط ولا يشكل نصيحة طبية أو توصية علاجية. المعلومات المقدمة لا تحل محل التشخيص أو العلاج من ممارس رعاية صحية مرخص.',
      shortVersion: 'للتعليم فقط - ليس نصيحة طبية',
      warningLevel: 'info',
      requiresAcknowledgment: false,
    },
    he: {
      type: 'not-medical-advice',
      locale: 'he',
      title: 'אינו ייעוץ רפואי',
      content: 'התוכן המופיע כאן הוא למטרות חינוכיות ואינפורמטיביות בלבד ואינו מהווה ייעוץ רפואי או המלצה טיפולית. המידע המסופק אינו תחליף לאבחון או טיפול על ידי מטפל בריאות מורשה.',
      shortVersion: 'למטרות חינוכיות בלבד - אינו ייעוץ רפואי',
      warningLevel: 'info',
      requiresAcknowledgment: false,
    },
    en: {
      type: 'not-medical-advice',
      locale: 'en',
      title: 'Not Medical Advice',
      content: 'The content herein is for educational and informational purposes only and does not constitute medical advice or treatment recommendation. The information provided does not replace diagnosis or treatment by a licensed healthcare practitioner.',
      shortVersion: 'For education only - not medical advice',
      warningLevel: 'info',
      requiresAcknowledgment: false,
    },
  },
  'fda-not-evaluated': {
    ar: {
      type: 'fda-not-evaluated',
      locale: 'ar',
      title: 'البيانات لم تقيمها هيئة الغذاء والدواء',
      content: 'البيانات المتعلقة بهذا المنتج لم تقيمها إدارة الغذاء والدواء. هذا المنتج غير مخصص لتشخيص أو علاج أو علاج أي مرض. النتائج الفردية قد تختلف.',
      shortVersion: 'لم يتم تقييمه من قبل FDA',
      warningLevel: 'warning',
      requiresAcknowledgment: false,
    },
    he: {
      type: 'fda-not-evaluated',
      locale: 'he',
      title: 'ההצהרות לא הוערכו על ידי ה-FDA',
      content: 'ההצהרות לגבי מוצר זה לא הוערכו על ידי מנהל המזון והתרופות. מוצר זה אינו מיועד לאבחון, טיפול או ריפוי מחלה כלשהי. התוצאות האישיות עשויות להשתנות.',
      shortVersion: 'לא הוערך על ידי ה-FDA',
      warningLevel: 'warning',
      requiresAcknowledgment: false,
    },
    en: {
      type: 'fda-not-evaluated',
      locale: 'en',
      title: 'Statements Not Evaluated by FDA',
      content: 'Statements regarding this product have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Individual results may vary.',
      shortVersion: 'Not evaluated by FDA',
      warningLevel: 'warning',
      requiresAcknowledgment: false,
    },
  },
};

// Health warning labels by locale
const HEALTH_WARNING_LABELS: Record<SupportedLocale, HealthWarningLabel[]> = {
  ar: [
    {
      id: 'keep-out-reach',
      label: 'يُحفظ بعيداً عن متناول الأطفال',
      description: 'يُحفظ في مكان آمن بعيداً عن الأطفال',
      icon: 'child-safety',
      color: '#ef4444',
    },
    {
      id: 'pregnancy-warning',
      label: 'يُنصح باستشارة الطبيب للحوامل',
      description: 'يجب استشارة الطبيب قبل الاستخدام أثناء الحمل',
      icon: 'pregnancy',
      color: '#f97316',
    },
    {
      id: 'allergy-alert',
      label: 'تحذير الحساسية',
      description: 'قد يسبب ردود فعل تحسسية',
      icon: 'alert-triangle',
      color: '#eab308',
    },
    {
      id: 'dosage-limit',
      label: 'لا تتجاوز الجرعة الموصى بها',
      description: 'الالتزام بالجرعة الموصى بها فقط',
      icon: 'pill',
      color: '#dc2626',
    },
    {
      id: 'prescription-interaction',
      label: 'تفاعل مع الأدوية الموصوفة',
      description: 'استشر الطبيب إذا كنت تتناول أدوية أخرى',
      icon: 'interaction',
      color: '#f97316',
    },
    {
      id: 'temperature-storage',
      label: 'يُحفظ في درجة حرارة مناسبة',
      description: 'يُحفظ بعيداً عن الحرارة والرطوبة',
      icon: 'thermometer',
      color: '#3b82f6',
    },
  ],
  he: [
    {
      id: 'keep-out-reach',
      label: 'לשמור הרחק מהישג ידם של ילדים',
      description: 'יש לשמור במקום בטוח הרחק מילדים',
      icon: 'child-safety',
      color: '#ef4444',
    },
    {
      id: 'pregnancy-warning',
      label: 'מומלץ להתייעץ עם רופא לנשים בהריון',
      description: 'יש להתייעץ עם רופא לפני השימוש בהריון',
      icon: 'pregnancy',
      color: '#f97316',
    },
    {
      id: 'allergy-alert',
      label: 'אזהרת אלרגיה',
      description: 'עלול לגרום תגובות אלרגיות',
      icon: 'alert-triangle',
      color: '#eab308',
    },
    {
      id: 'dosage-limit',
      label: 'אין לחרוג מהמינון המומלץ',
      description: 'להקפיד על המינון המומלץ בלבד',
      icon: 'pill',
      color: '#dc2626',
    },
    {
      id: 'prescription-interaction',
      label: 'אינטראקציה עם תרופות במרשם',
      description: 'התייעץ עם רופא אם אתה נוטל תרופות אחרות',
      icon: 'interaction',
      color: '#f97316',
    },
    {
      id: 'temperature-storage',
      label: 'לשמור בטמפרטורה מתאימה',
      description: 'יש לשמור הרחק מחום ולחות',
      icon: 'thermometer',
      color: '#3b82f6',
    },
  ],
  en: [
    {
      id: 'keep-out-reach',
      label: 'Keep out of reach of children',
      description: 'Store in a safe place away from children',
      icon: 'child-safety',
      color: '#ef4444',
    },
    {
      id: 'pregnancy-warning',
      label: 'Consult doctor if pregnant',
      description: 'Consult a doctor before use during pregnancy',
      icon: 'pregnancy',
      color: '#f97316',
    },
    {
      id: 'allergy-alert',
      label: 'Allergy Alert',
      description: 'May cause allergic reactions',
      icon: 'alert-triangle',
      color: '#eab308',
    },
    {
      id: 'dosage-limit',
      label: 'Do not exceed recommended dose',
      description: 'Follow recommended dosage only',
      icon: 'pill',
      color: '#dc2626',
    },
    {
      id: 'prescription-interaction',
      label: 'May interact with prescription drugs',
      description: 'Consult doctor if taking other medications',
      icon: 'interaction',
      color: '#f97316',
    },
    {
      id: 'temperature-storage',
      label: 'Store at proper temperature',
      description: 'Keep away from heat and moisture',
      icon: 'thermometer',
      color: '#3b82f6',
    },
  ],
};

// Medical claim detection patterns by locale
const MEDICAL_CLAIM_PATTERNS: Record<SupportedLocale, Record<MedicalClaimType, RegExp[]>> = {
  ar: {
    treatment: [
      /يعالج|علاج|شفاء|يُعالج|علاجي/g,
      /يُساعد في علاج|يُحسّن حالة|يُخفف من/g,
    ],
    cure: [
      /يشفي|شفاء تام|قضاء على|يُزيل|يُنهي/g,
      /علاج نهائي|حل نهائي|شفاء كامل/g,
    ],
    prevention: [
      /يحمي من|وقاية|يمنع|يُقي|حماية/g,
      /يُقلل من خطر|يُبعد خطر|يُجنبك/g,
    ],
    diagnosis: [
      /يُشخص|كشف|تشخيص|فحص|يُحدد/g,
      /يُكشف عن|اكتشاف|تحديد/g,
    ],
    guarantee: [
      /ضمان|مضمون|نتائج مضمونة|100%/g,
      /يضمن|يؤكد|وعد|نتائج مؤكدة/g,
    ],
  },
  he: {
    treatment: [
      /מטפל|טיפול|ריפוי|מסייע|טיפולי/g,
      /מסייע בטיפול|משפר את מצב|מקל על/g,
    ],
    cure: [
      /מרפא|ריפוי מלא|מסיים|מסיר|מחסל/g,
      /טיפול סופי|פתרון סופי|ריפוי שלם/g,
    ],
    prevention: [
      /מגן מפני|מניעה|מונע|שומר|הגנה/g,
      /מפחית סיכון|מרחיק סיכון|מונע/g,
    ],
    diagnosis: [
      /מאבחן|אבחון|בדיקה|זיהוי|קביעה/g,
      /מגלה|גילוי|קביעת/g,
    ],
    guarantee: [
      /אחריות|מובטח|תוצאות מובטחות|100%/g,
      /מבטיח|מאשר|הבטחה|תוצאות ודאיות/g,
    ],
  },
  en: {
    treatment: [
      /treat|treatment|therapy|therapeutic|helps? (with|treat)/gi,
      /relieves?|alleviates?|reduces? symptoms?/gi,
    ],
    cure: [
      /cure|cures|complete cure|eliminates?|eradicates?/gi,
      /heals?|healing|full recovery|permanent solution/gi,
    ],
    prevention: [
      /prevents?|preventive|protection|protects?/gi,
      /reduces? risk|guards against|shields?/gi,
    ],
    diagnosis: [
      /diagnos(?:is|es|e)|detect(?:s|ion)|identifies?/gi,
      /screen(?:s|ing)|recognizes?|determines?/gi,
    ],
    guarantee: [
      /guarantees?|guaranteed|100%|promises?/gi,
      /assured|assurance|certain|sure/gi,
    ],
  },
};

// Prohibited medical content patterns
const PROHIBITED_CONTENT_PATTERNS: Record<SupportedLocale, RegExp[]> = {
  ar: [
    /وعد الشفاء|شفاء مضمون|نتائج مضمونة 100%|شفاء فوري/,
    /بديل عن الدواء|أفضل من الدواء|لا حاجة للطبيب/,
    /علاج كل الأمراض|شفاء جميع الأمراض|دواء شامل/,
  ],
  he: [
    /הבטחת ריפוי|ריפוי מובטח|תוצאות מובטחות 100%|ריפוי מיידי/,
    /תחליף לתרופה|טוב יותר מתרופה|אין צורך ברופא/,
    /טיפול לכל המחלות|ריפוי כל המחלות|תרופה כוללת/,
  ],
  en: [
    /promise.*cure|guaranteed cure|100% guaranteed|instant cure/i,
    /replacement for medicine|better than medicine|no need for doctor/i,
    /cure all diseases|cure everything|universal cure/i,
  ],
};

// Medical keywords that trigger disclaimer requirements
const MEDICAL_KEYWORDS: Record<SupportedLocale, string[]> = {
  ar: [
    'طبيب', 'علاج', 'دواء', 'صحة', 'مرض', 'ألم', 'أعراض', 'تشخيص',
    'صيدلي', 'مستشفى', 'طوارئ', 'جرعة', 'وصفة طبية', 'مكمل غذائي',
    'جهاز طبي', 'فحص', 'تحليل', 'جراحة', 'علاج طبيعي',
  ],
  he: [
    'רופא', 'טיפול', 'תרופה', 'בריאות', 'מחלה', 'כאב', 'תסמינים', 'אבחון',
    'רוקח', 'בית חולים', 'חירום', 'מינון', 'מרשם', 'תוסף תזונה',
    'מכשיר רפואי', 'בדיקה', 'ניתוח', 'פיזיותרפיה',
  ],
  en: [
    'doctor', 'treatment', 'medicine', 'health', 'disease', 'pain', 'symptoms', 'diagnosis',
    'pharmacist', 'hospital', 'emergency', 'dosage', 'prescription', 'supplement',
    'medical device', 'examination', 'surgery', 'physical therapy',
  ],
};

/**
 * Get medical disclaimer for a specific locale and type
 */
export function getMedicalDisclaimer(
  locale: SupportedLocale,
  type: DisclaimerType
): MedicalDisclaimer {
  const disclaimer = MEDICAL_DISCLAIMERS[type]?.[locale];
  if (!disclaimer) {
    // Fallback to English if locale/type not found
    return MEDICAL_DISCLAIMERS[type]?.en || MEDICAL_DISCLAIMERS.general.en;
  }
  return disclaimer;
}

/**
 * Get all available disclaimer types
 */
export function getAvailableDisclaimerTypes(): DisclaimerType[] {
  return Object.keys(MEDICAL_DISCLAIMERS) as DisclaimerType[];
}

/**
 * Get supported locales
 */
export function getSupportedLocales(): SupportedLocale[] {
  return ['ar', 'he', 'en'];
}

/**
 * Validate medical content for required disclaimers and prohibited content
 */
export function validateMedicalContent(
  content: string,
  locale: SupportedLocale
): MedicalContentValidation {
  const issues: MedicalContentIssue[] = [];
  const recommendedDisclaimers: DisclaimerType[] = [];

  // Check for medical keywords to determine if disclaimers are needed
  const hasMedicalContent = MEDICAL_KEYWORDS[locale].some(keyword =>
    content.toLowerCase().includes(keyword.toLowerCase())
  );

  // Check for prohibited content
  const prohibitedPatterns = PROHIBITED_CONTENT_PATTERNS[locale];
  for (const pattern of prohibitedPatterns) {
    if (pattern.test(content)) {
      issues.push({
        type: 'prohibited_content',
        severity: 'error',
        message: 'Content contains prohibited medical claims',
        location: 'content',
      });
    }
  }

  // Check for medical claims that require disclaimers
  const claimCheck = checkMedicalClaims(content, locale);
  if (claimCheck.hasMedicalClaims) {
    // Add recommended disclaimers based on claim types
    const hasTreatmentClaim = claimCheck.detectedClaims.some(c => c.type === 'treatment');
    const hasCureClaim = claimCheck.detectedClaims.some(c => c.type === 'cure');
    const hasGuaranteeClaim = claimCheck.detectedClaims.some(c => c.type === 'guarantee');

    if (hasTreatmentClaim || hasCureClaim) {
      recommendedDisclaimers.push('general', 'not-medical-advice');
    }
    if (hasGuaranteeClaim) {
      issues.push({
        type: 'unverified_claim',
        severity: 'warning',
        message: 'Guarantee claims require additional verification',
      });
    }
  }

  // Determine if disclaimers are required
  const requiresDisclaimer = hasMedicalContent || claimCheck.hasMedicalClaims;

  // Check for insufficient warnings on high-risk content
  if (claimCheck.riskLevel === 'high' && !content.includes('consult')) {
    issues.push({
      type: 'insufficient_warning',
      severity: 'warning',
      message: 'High-risk medical content should include consultation warning',
    });
    recommendedDisclaimers.push('consult-doctor');
  }

  // If has medical content but no disclaimers mentioned, recommend them
  if (hasMedicalContent && !content.toLowerCase().includes('disclaimer')) {
    recommendedDisclaimers.push('general');
  }

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    requiresDisclaimer,
    recommendedDisclaimers: [...new Set(recommendedDisclaimers)],
  };
}

/**
 * Check content for medical claims
 */
export function checkMedicalClaims(
  content: string,
  locale: SupportedLocale
): MedicalClaimCheck {
  const detectedClaims: DetectedClaim[] = [];
  const patterns = MEDICAL_CLAIM_PATTERNS[locale];

  for (const [claimType, typePatterns] of Object.entries(patterns)) {
    for (const pattern of typePatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          detectedClaims.push({
            type: claimType as MedicalClaimType,
            text: match[0],
            position: match.index,
            confidence: 0.85, // Base confidence for regex matches
          });
        }
      }
    }
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const hasCure = detectedClaims.some(c => c.type === 'cure');
  const hasGuarantee = detectedClaims.some(c => c.type === 'guarantee');
  const claimCount = detectedClaims.length;

  if (hasCure || hasGuarantee) {
    riskLevel = 'high';
  } else if (claimCount >= 3) {
    riskLevel = 'high';
  } else if (claimCount >= 1) {
    riskLevel = 'medium';
  }

  // Check if requires regulatory review
  const requiresRegulatoryReview = hasCure || hasGuarantee || claimCount >= 5;

  return {
    hasMedicalClaims: detectedClaims.length > 0,
    detectedClaims,
    riskLevel,
    requiresRegulatoryReview,
  };
}

/**
 * Get health warning labels for a locale
 */
export function getHealthWarningLabels(locale: SupportedLocale): HealthWarningLabel[] {
  return HEALTH_WARNING_LABELS[locale] || HEALTH_WARNING_LABELS.en;
}

/**
 * Get specific health warning label by ID
 */
export function getHealthWarningLabel(
  locale: SupportedLocale,
  labelId: string
): HealthWarningLabel | undefined {
  const labels = getHealthWarningLabels(locale);
  return labels.find(label => label.id === labelId);
}

/**
 * Get disclaimer text for quick display
 */
export function getDisclaimerText(
  locale: SupportedLocale,
  type: DisclaimerType,
  version: 'full' | 'short' = 'short'
): string {
  const disclaimer = getMedicalDisclaimer(locale, type);
  return version === 'short' ? disclaimer.shortVersion : disclaimer.content;
}

/**
 * Check if content needs emergency disclaimer
 */
export function needsEmergencyDisclaimer(content: string, locale: SupportedLocale): boolean {
  const emergencyKeywords: Record<SupportedLocale, string[]> = {
    ar: ['طوارئ', 'إسعاف', 'حالة حرجة', 'خطر', 'حياة أو موت', 'فوراً'],
    he: ['חירום', 'מד"א', 'מצב קריטי', 'סכנה', 'חיים ומוות', 'מיידי'],
    en: ['emergency', 'urgent', 'critical condition', 'life threatening', 'immediately', '911'],
  };

  const keywords = emergencyKeywords[locale];
  const contentLower = content.toLowerCase();
  return keywords.some(keyword => contentLower.includes(keyword.toLowerCase()));
}

/**
 * Get appropriate disclaimers for product type
 */
export function getProductDisclaimers(
  productType: 'supplement' | 'device' | 'general' | 'medication',
  locale: SupportedLocale
): MedicalDisclaimer[] {
  const disclaimers: MedicalDisclaimer[] = [];

  // Always include general disclaimer
  disclaimers.push(getMedicalDisclaimer(locale, 'general'));

  // Add product-specific disclaimers
  switch (productType) {
    case 'supplement':
      disclaimers.push(getMedicalDisclaimer(locale, 'supplement'));
      disclaimers.push(getMedicalDisclaimer(locale, 'consult-doctor'));
      break;
    case 'device':
      disclaimers.push(getMedicalDisclaimer(locale, 'device'));
      break;
    case 'medication':
      disclaimers.push(getMedicalDisclaimer(locale, 'consult-doctor'));
      disclaimers.push(getMedicalDisclaimer(locale, 'not-medical-advice'));
      break;
    case 'general':
    default:
      disclaimers.push(getMedicalDisclaimer(locale, 'product'));
      break;
  }

  return disclaimers;
}

/**
 * Format disclaimer for display with proper RTL handling
 */
export function formatDisclaimerForDisplay(
  disclaimer: MedicalDisclaimer,
  options: { showTitle?: boolean; showIcon?: boolean } = {}
): {
  text: string;
  title: string;
  isRTL: boolean;
  warningLevel: WarningLevel;
} {
  const { showTitle = true } = options;
  const isRTL = disclaimer.locale === 'ar' || disclaimer.locale === 'he';

  return {
    text: disclaimer.content,
    title: showTitle ? disclaimer.title : '',
    isRTL,
    warningLevel: disclaimer.warningLevel,
  };
}

/**
 * Get all medical disclaimers for a locale
 */
export function getAllMedicalDisclaimers(locale: SupportedLocale): MedicalDisclaimer[] {
  return (Object.keys(MEDICAL_DISCLAIMERS) as DisclaimerType[]).map(
    type => getMedicalDisclaimer(locale, type)
  );
}

/**
 * Validate locale support
 */
export function isLocaleSupported(locale: string): locale is SupportedLocale {
  return ['ar', 'he', 'en'].includes(locale);
}

/**
 * Get disclaimer requirements for content type
 */
export function getDisclaimerRequirements(
  contentType: 'product-description' | 'marketing' | 'educational' | 'packaging'
): {
  requiredTypes: DisclaimerType[];
  requiresAcknowledgment: boolean;
  minWarningLevel: WarningLevel;
} {
  switch (contentType) {
    case 'packaging':
      return {
        requiredTypes: ['general', 'consult-doctor'],
        requiresAcknowledgment: true,
        minWarningLevel: 'warning',
      };
    case 'marketing':
      return {
        requiredTypes: ['general', 'not-medical-advice'],
        requiresAcknowledgment: false,
        minWarningLevel: 'info',
      };
    case 'educational':
      return {
        requiredTypes: ['not-medical-advice'],
        requiresAcknowledgment: false,
        minWarningLevel: 'info',
      };
    case 'product-description':
    default:
      return {
        requiredTypes: ['general', 'product'],
        requiresAcknowledgment: true,
        minWarningLevel: 'warning',
      };
  }
}
