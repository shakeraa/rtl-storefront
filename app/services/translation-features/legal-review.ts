/**
 * Legal Review Service
 * Validates legal terminology, required phrases, and disclaimers in translations
 * Supports: Arabic (ar), Hebrew (he), English (en)
 * 
 * @module translation-features/legal-review
 */

export type LegalContentType = 'terms_of_service' | 'privacy_policy' | 'refund_policy' | 'cookie_policy' | 'shipping_policy';
export type DisclaimerType = 'financial' | 'medical' | 'affiliate' | 'copyright' | 'warranty' | 'general';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface LegalTerminologyIssue {
  type: 'warranty' | 'liability' | 'binding' | 'indemnification' | 'termination' | 'intellectual_property';
  message: string;
  severity: IssueSeverity;
  problematicText: string;
  suggestion: string;
  position?: number;
}

export interface RequiredPhraseCheck {
  present: string[];
  missing: string[];
  isComplete: boolean;
  complianceScore: number;
}

export interface DisclaimerVerification {
  valid: boolean;
  required: boolean;
  message: string;
  suggestedDisclaimer?: string;
  missingElements?: string[];
}

export interface ConsumerProtection {
  coolingOffPeriod: number;
  rightToWithdraw: boolean;
  priceTransparency: boolean;
  contactRequirements: string[];
}

export interface DataPrivacy {
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  requiredClauses: string[];
  dataRetentionPeriod?: string;
}

export interface LegalRequirements {
  locale: string;
  jurisdiction: string;
  requiredElements: string[];
  prohibitedTerms: string[];
  consumerProtection: ConsumerProtection;
  dataPrivacy: DataPrivacy;
  mandatoryDisclaimers: DisclaimerType[];
}

export interface ContentToVerify {
  text: string;
  type: DisclaimerType;
  hasDisclaimers: boolean;
}

// Legal terminology patterns by category and locale
export const LEGAL_TERMINOLOGY: Record<string, Record<string, {
  problematic: string[];
  suggestions: Record<string, string>;
  severity: IssueSeverity;
}>> = {
  warranty: {
    en: {
      problematic: ['guarantee forever', 'unlimited warranty', 'lifetime guarantee', 'promise forever', 'guaranteed for life'],
      suggestions: {
        'guarantee forever': 'Use specific time periods (e.g., "2-year warranty")',
        'unlimited warranty': 'Define warranty limitations clearly',
        'lifetime guarantee': 'Specify what "lifetime" means',
        'promise forever': 'Use time-limited commitments',
        'guaranteed for life': 'Define "life" period explicitly',
      },
      severity: 'high',
    },
    ar: {
      problematic: ['ضمان مدى الحياة', 'ضمان غير محدود', 'ضمان أبدي', 'نضمن إلى الأبد'],
      suggestions: {
        'ضمان مدى الحياة': 'استخدم فترات زمنية محددة (مثال: "ضمان سنتين")',
        'ضمان غير محدود': 'حدد قيود الضمان بوضوح',
        'ضمان أبدي': 'حدد معنى "الأبد"',
        'نضمن إلى الأبد': 'استخدم التزامات محددة بوقت',
      },
      severity: 'high',
    },
    he: {
      problematic: ['אחריות לכל החיים', 'אחריות בלתי מוגבלת', 'אחריות לנצח', 'אנו מתחייבים לתמיד'],
      suggestions: {
        'אחריות לכל החיים': 'השתמש בתקופות זמן מוגדרות (למשל: "אחריות לשנתיים")',
        'אחריות בלתי מוגבלת': 'הגדר מגבלות אחריות בבהירות',
        'אחריות לנצח': 'פרט מה פירוש "לנצח"',
        'אנו מתחייבים לתמיד': 'השתמש בהתחייבויות מוגבלות בזמן',
      },
      severity: 'high',
    },
  },
  liability: {
    en: {
      problematic: ['fully responsible for all', 'unlimited liability', 'accept all liability', 'no liability limits', 'liable for everything'],
      suggestions: {
        'fully responsible for all': 'Include limitation of liability clause',
        'unlimited liability': 'Set reasonable liability caps',
        'accept all liability': 'Define liability limitations',
        'no liability limits': 'Include liability limitations',
        'liable for everything': 'Specify liability scope and limits',
      },
      severity: 'critical',
    },
    ar: {
      problematic: ['مسؤولون بالكامل عن كل', 'مسؤولية غير محدودة', 'نقبل كل المسؤولية', 'لا حدود للمسؤولية', 'مسؤولون عن كل شيء'],
      suggestions: {
        'مسؤولون بالكامل عن كل': 'قم بتضمين بند تحديد المسؤولية',
        'مسؤولية غير محدودة': 'حدد سقفاً معقولاً للمسؤولية',
        'نقبل كل المسؤولية': 'حدد قيود المسؤولية',
        'لا حدود للمسؤولية': 'قم بتضمين قيود المسؤولية',
        'مسؤولون عن كل شيء': 'حدد نطاق وقيود المسؤولية',
      },
      severity: 'critical',
    },
    he: {
      problematic: ['אחראים באופן מלא לכל', 'אחריות בלתי מוגבלת', 'מקבלים את כל האחריות', 'אין מגבלות אחריות', 'אחראים לכל דבר'],
      suggestions: {
        'אחראים באופן מלא לכל': 'כלול סעיף הגבלת אחריות',
        'אחריות בלתי מוגבלת': 'קבע תקרות אחריות סבירות',
        'מקבלים את כל האחריות': 'הגדר מגבלות אחריות',
        'אין מגבלות אחריות': 'כלול מגבלות אחריות',
        'אחראים לכל דבר': 'פרט היקף ומגבלות אחריות',
      },
      severity: 'critical',
    },
  },
  binding: {
    en: {
      problematic: ['not legally binding', 'not binding on us', 'non-binding agreement', 'informal only'],
      suggestions: {
        'not legally binding': 'Clarify binding nature of agreement',
        'not binding on us': 'Specify mutual obligations',
        'non-binding agreement': 'Define which terms are binding',
        'informal only': 'Clarify legal status of document',
      },
      severity: 'high',
    },
    ar: {
      problematic: ['غير ملزم قانونياً', 'غير ملزم لنا', 'اتفاق غير ملزم', 'غير رسمي فقط'],
      suggestions: {
        'غير ملزم قانونياً': 'وضح الطبيعة الملزمة للاتفاقية',
        'غير ملزم لنا': 'حدد الالتزامات المتبادلة',
        'اتفاق غير ملزم': 'حدد أي الشروط ملزمة',
        'غير رسمي فقط': 'وضح الوضع القانوني للمستند',
      },
      severity: 'high',
    },
    he: {
      problematic: ['אינו מחייב משפטית', 'אינו מחייב אותנו', 'הסכם לא מחייב', 'לא רשמי בלבד'],
      suggestions: {
        'אינו מחייב משפטית': 'הבהר את אופי ההתחייבות של ההסכם',
        'אינו מחייב אותנו': 'פרט התחייבויות הדדיות',
        'הסכם לא מחייב': 'הגדר אילו תנאים מחייבים',
        'לא רשמי בלבד': 'הבהר את הסטטוס המשפטי של המסמך',
      },
      severity: 'high',
    },
  },
  indemnification: {
    en: {
      problematic: ['you must defend us', 'you pay all costs', 'unlimited indemnity', 'indemnify against everything'],
      suggestions: {
        'you must defend us': 'Specify reasonable indemnification scope',
        'you pay all costs': 'Define cost limitations',
        'unlimited indemnity': 'Set indemnification limits',
        'indemnify against everything': 'Clarify indemnification scope',
      },
      severity: 'medium',
    },
    ar: {
      problematic: ['يجب عليك الدفاع عنا', 'تدفع جميع التكاليف', 'تعويض غير محدود', 'تتعهد بالتعويض عن كل شيء'],
      suggestions: {
        'يجب عليك الدفاع عنا': 'حدد نطاق التعويض المعقول',
        'تدفع جميع التكاليف': 'حدد قيود التكاليف',
        'تعويض غير محدود': 'ضع حدوداً للتعويض',
        'تتعهد بالتعويض عن كل شيء': 'وضح نطاق التعويض',
      },
      severity: 'medium',
    },
    he: {
      problematic: ['עליך להגן עלינו', 'אתה משלם את כל העלויות', 'פיצוי בלתי מוגבל', 'מתחייב לפצות על הכל'],
      suggestions: {
        'עליך להגן עלינו': 'פרט היקף פיצוי סביר',
        'אתה משלם את כל העלויות': 'הגדר מגבלות עלויות',
        'פיצוי בלתי מוגבל': 'קבע מגבלות פיצוי',
        'מתחייב לפצות על הכל': 'הבהר את היקף הפיצוי',
      },
      severity: 'medium',
    },
  },
  termination: {
    en: {
      problematic: ['terminate without notice', 'cancel immediately without reason', 'end without warning', 'stop at any time for any reason'],
      suggestions: {
        'terminate without notice': 'Specify reasonable notice period',
        'cancel immediately without reason': 'Define termination grounds',
        'end without warning': 'Provide notice requirements',
        'stop at any time for any reason': 'Clarify termination conditions',
      },
      severity: 'medium',
    },
    ar: {
      problematic: ['إنهاء دون إشعار', 'إلغاء فورياً دون سبب', 'إنهاء دون تحذير', 'إيقاف في أي وقت لأي سبب'],
      suggestions: {
        'إنهاء دون إشعار': 'حدد فترة إشعار معقولة',
        'إلغاء فورياً دون سبب': 'حدد أسباب الإنهاء',
        'إنهاء دون تحذير': 'حدد متطلبات الإشعار',
        'إيقاف في أي وقت لأي سبب': 'وضح شروط الإنهاء',
      },
      severity: 'medium',
    },
    he: {
      problematic: ['לסיים ללא הודעה', 'לבטל מיד ללא סיבה', 'להפסיק ללא אזהרה', 'לעצור בכל עת מכל סיבה'],
      suggestions: {
        'לסיים ללא הודעה': 'פרט תקופת הודעה סבירה',
        'לבטל מיד ללא סיבה': 'הגדר בסיסי סיום',
        'להפסיק ללא אזהרה': 'פרט דרישות הודעה',
        'לעצור בכל עת מכל סיבה': 'הבהר תנאי סיום',
      },
      severity: 'medium',
    },
  },
  intellectual_property: {
    en: {
      problematic: ['we own everything you create', 'all your content belongs to us', 'unlimited rights to your data', 'perpetual ownership of user content'],
      suggestions: {
        'we own everything you create': 'Specify limited license scope',
        'all your content belongs to us': 'Define ownership boundaries',
        'unlimited rights to your data': 'Limit data usage rights',
        'perpetual ownership of user content': 'Clarify user content licensing',
      },
      severity: 'medium',
    },
    ar: {
      problematic: ['نملك كل ما تنشئه', 'كل محتواك ينتمي إلينا', 'حقوق غير محدودة لبياناتك', 'ملكية دائمة لمحتوى المستخدم'],
      suggestions: {
        'نملك كل ما تنشئه': 'حدد نطاق الترخيص المحدود',
        'كل محتواك ينتمي إلينا': 'حدد حدود الملكية',
        'حقوق غير محدودة لبياناتك': 'حدد حقوق استخدام البيانات',
        'ملكية دائمة لمحتوى المستخدم': 'وضح ترخيص محتوى المستخدم',
      },
      severity: 'medium',
    },
    he: {
      problematic: ['אנו הבעלים של כל מה שאתה יוצר', 'כל התוכן שלך שייך לנו', 'זכויות בלתי מוגבלות לנתונים שלך', 'בעלות תמידית בתוכן משתמשים'],
      suggestions: {
        'אנו הבעלים של כל מה שאתה יוצר': 'פרט היקף רישיון מוגבל',
        'כל התוכן שלך שייך לנו': 'הגדר גבולות בעלות',
        'זכויות בלתי מוגבלות לנתונים שלך': 'הגבל זכויות שימוש בנתונים',
        'בעלות תמידית בתוכן משתמשים': 'הבהר רישוי תוכן משתמשים',
      },
      severity: 'medium',
    },
  },
};

// Required phrases by content type and locale
export const REQUIRED_PHRASES: Record<LegalContentType, Record<string, string[]>> = {
  terms_of_service: {
    en: [
      'terms of service',
      'govern',
      'use',
      'agree',
      'modify',
      'terminate',
    ],
    ar: [
      'شروط الخدمة',
      'تحكم',
      'استخدام',
      'موافقة',
      'تعديل',
      'إنهاء',
    ],
    he: [
      'תנאי השירות',
      'חלים',
      'שימוש',
      'מסכים',
      'לשנות',
      'לסיים',
    ],
  },
  privacy_policy: {
    en: [
      'privacy policy',
      'personal data',
      'collect',
      'use',
      'protect',
      'rights',
      'access',
      'delete',
    ],
    ar: [
      'سياسة الخصوصية',
      'البيانات الشخصية',
      'جمع',
      'استخدام',
      'حماية',
      'حقوق',
      'الوصول',
      'حذف',
    ],
    he: [
      'מדיניות פרטיות',
      'נתונים אישיים',
      'לאסוף',
      'להשתמש',
      'להגן',
      'זכויות',
      'גישה',
      'למחוק',
    ],
  },
  refund_policy: {
    en: [
      'refund',
      'return',
      'days',
      'condition',
      'process',
      'non-refundable',
    ],
    ar: [
      'استرداد',
      'إرجاع',
      'أيام',
      'حالة',
      'معالجة',
      'غير قابل للاسترداد',
    ],
    he: [
      'החזר כספי',
      'להחזיר',
      'ימים',
      'מצב',
      'לעבד',
      'לא ניתן להחזר',
    ],
  },
  cookie_policy: {
    en: [
      'cookies',
      'use',
      'consent',
      'disable',
      'browser',
      'track',
    ],
    ar: [
      'ملفات تعريف الارتباط',
      'استخدام',
      'موافقة',
      'تعطيل',
      'المتصفح',
      'تتبع',
    ],
    he: [
      'עוגיות',
      'שימוש',
      'הסכמה',
      'להשבית',
      'דפדפן',
      'למעקב',
    ],
  },
  shipping_policy: {
    en: [
      'shipping',
      'delivery',
      'days',
      'cost',
      'address',
      'international',
    ],
    ar: [
      'الشحن',
      'التوصيل',
      'أيام',
      'التكلفة',
      'العنوان',
      'دولي',
    ],
    he: [
      'משלוח',
      'משלוח',
      'ימים',
      'עלות',
      'כתובת',
      'בינלאומי',
    ],
  },
};

// Disclaimer templates by type and locale
export const DISCLAIMER_TEMPLATES: Record<DisclaimerType, Record<string, string>> = {
  financial: {
    en: 'Past performance does not guarantee future results. All investments carry risk. Consult a qualified financial advisor before making investment decisions.',
    ar: 'الأداء السابق لا يضمن النتائج المستقبلية. جميع الاستثمارات تنطوي على مخاطر. استشر مستشاراً مالياً مؤهلاً قبل اتخاذ قرارات الاستثمار.',
    he: 'ביצועים קודמים אינם מבטיחים תוצאות עתידיות. כל ההשקעות כרוכות בסיכון. התייעץ עם יועץ פיננסי מוסמך לפני קבלת החלטות השקעה.',
  },
  medical: {
    en: 'This information is for educational purposes only and does not constitute medical advice. Consult a qualified healthcare provider for medical concerns.',
    ar: 'هذه المعلومات لأغراض تعليمية فقط ولا تشكل نصيحة طبية. استشر مقدم رعاية صحية مؤهل للحصول على المشورة الطبية.',
    he: 'מידע זה הוא למטרות חינוכיות בלבד ואינו מהווה ייעוץ רפואי. התייעץ עם ספק בריאות מוסמך לגבי בעיות רפואיות.',
  },
  affiliate: {
    en: 'This post contains affiliate links. We may earn a commission if you make a purchase through these links at no additional cost to you.',
    ar: 'يحتوي هذا المنشور على روابط تابعة. قد نربح عمولة إذا قمت بإجراء عملية شراء من خلال هذه الروابط دون تكلفة إضافية عليك.',
    he: 'פוסט זה מכיל קישורי שותפים. אנו עשויים לקבל עמלה אם תבצע רכישה באמצעות קישורים אלה ללא עלות נוספת עבורך.',
  },
  copyright: {
    en: '© {year} All rights reserved. No part of this publication may be reproduced without prior written permission.',
    ar: '© {year} جميع الحقوق محفوظة. لا يجوز إعادة إنتاج أي جزء من هذا المنشور دون إذن كتابي مسبق.',
    he: '© {year} כל הזכויות שמורות. אין לשכפל חלק מפרסום זה ללא רשות בכתב מראש.',
  },
  warranty: {
    en: 'This product is provided "as is" without warranties of any kind, either express or implied. See full warranty terms for details.',
    ar: 'يتم توفير هذا المنتج "كما هو" دون ضمانات من أي نوع، صريحة أو ضمنية. راجع شروط الضمان الكاملة للحصول على التفاصيل.',
    he: 'מוצר זה מסופק "כפי שהוא" ללא אחריות מכל סוג שהוא, מפורשת או משתמעת. ראה תנאי האחריות המלאים לפרטים.',
  },
  general: {
    en: 'The information provided is for general informational purposes only. We make no representations or warranties of any kind about the completeness or accuracy of this information.',
    ar: 'المعلومات المقدمة هي لأغراض إعلامية عامة فقط. نحن لا نقدم أي تعهدات أو ضمانات من أي نوع حول اكتمال أو دقة هذه المعلومات.',
    he: 'המידע המסופק הוא למטרות אינפורמטיביות כלליות בלבד. איננו מספקים הצהרות או אחריות מכל סוג שהוא לגבי שלמות או דיוק מידע זה.',
  },
};

// Content types that require disclaimers
const DISCLAIMER_REQUIRED_TYPES: DisclaimerType[] = ['financial', 'medical', 'affiliate'];

// Disclaimer indicators by type and locale
const DISCLAIMER_INDICATORS: Record<DisclaimerType, Record<string, string[]>> = {
  financial: {
    en: ['past performance', 'not guarantee', 'investment advice', 'financial advisor', 'risk of loss', 'consult professional'],
    ar: ['الأداء السابق', 'لا يضمن', 'نصيحة استثمارية', 'مستشار مالي', 'خطر الخسارة', 'استشارة مهنية'],
    he: ['ביצועים קודמים', 'אינם מבטיחים', 'ייעוץ השקעות', 'יועץ פיננסי', 'סיכון הפסד', 'התייעצות מקצועית'],
  },
  medical: {
    en: ['not medical advice', 'consult doctor', 'healthcare provider', 'educational purposes', 'not substitute'],
    ar: ['ليس نصيحة طبية', 'استشر طبيباً', 'مقدم رعاية صحية', 'أغراض تعليمية', 'لا يغني'],
    he: ['אינו ייעוץ רפואי', 'התייעץ עם רופא', 'ספק בריאות', 'מטרות חינוכיות', 'אינו תחליף'],
  },
  affiliate: {
    en: ['affiliate links', 'earn commission', 'affiliate disclosure', 'partner links', 'sponsored'],
    ar: ['روابط تابعة', 'ربح عمولة', 'إفصاح تابع', 'روابط شريكة', 'مُمول'],
    he: ['קישורי שותפים', 'קבל עמלה', 'גילוי שותפים', 'קישורים ממומנים', 'בחסות'],
  },
  copyright: {
    en: ['©', 'all rights reserved', 'copyright'],
    ar: ['©', 'جميع الحقوق محفوظة', 'حقوق النشر'],
    he: ['©', 'כל הזכויות שמורות', 'זכויות יוצרים'],
  },
  warranty: {
    en: ['as is', 'no warranty', 'disclaimer of warranty', 'without warranty'],
    ar: ['كما هو', 'لا ضمان', 'إخلاء مسؤولية عن الضمان', 'بدون ضمان'],
    he: ['כפי שהוא', 'ללא אחריות', 'ויתור על אחריות', 'בלי אחריות'],
  },
  general: {
    en: ['informational purposes', 'not constitute', 'no representation', 'as available'],
    ar: ['أغراض إعلامية', 'لا يشكل', 'لا يمثل', 'حسب التوفر'],
    he: ['מטרות אינפורמטיביות', 'אינו מהווה', 'אין ייצוג', 'כפי שזמין'],
  },
};

/**
 * Validates legal terminology in the given text
 * Checks for problematic terms and suggests alternatives
 * 
 * @param text - The text to validate
 * @param locale - The locale (ar, he, en)
 * @returns Array of terminology issues found
 */
export function validateLegalTerminology(text: string, locale: string): LegalTerminologyIssue[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const issues: LegalTerminologyIssue[] = [];
  const normalizedText = text.toLowerCase();
  const normalizedLocale = locale.toLowerCase();
  
  // Use English as fallback if locale not supported
  const effectiveLocale = ['ar', 'he', 'en'].includes(normalizedLocale) ? normalizedLocale : 'en';

  for (const [category, localeData] of Object.entries(LEGAL_TERMINOLOGY)) {
    const data = localeData[effectiveLocale];
    if (!data) continue;

    for (const problematic of data.problematic) {
      const normalizedProblematic = problematic.toLowerCase();
      let position = normalizedText.indexOf(normalizedProblematic);
      
      // Check for whole word matches for short terms
      if (position !== -1) {
        // Also check word boundaries for more accuracy
        const regex = new RegExp(`\\b${normalizedProblematic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = text.match(regex);
        
        if (matches || position !== -1) {
          issues.push({
            type: category as LegalTerminologyIssue['type'],
            message: `Potentially problematic ${category} language detected`,
            severity: data.severity,
            problematicText: problematic,
            suggestion: data.suggestions[problematic] || 'Review this terminology',
            position: position !== -1 ? position : undefined,
          });
          break; // Only report once per category
        }
      }
    }
  }

  return issues;
}

/**
 * Checks if required legal phrases are present in the text
 * 
 * @param text - The text to check
 * @param locale - The locale (ar, he, en)
 * @param type - The type of legal content
 * @returns Object containing present/missing phrases and compliance score
 */
export function checkRequiredPhrases(text: string, locale: string, type: LegalContentType): RequiredPhraseCheck {
  if (!text || typeof text !== 'string') {
    return { present: [], missing: [], isComplete: false, complianceScore: 0 };
  }

  const normalizedText = text.toLowerCase();
  const normalizedLocale = locale.toLowerCase();
  
  // Use English as fallback if locale not supported
  const effectiveLocale = ['ar', 'he', 'en'].includes(normalizedLocale) ? normalizedLocale : 'en';

  const phrases = REQUIRED_PHRASES[type];
  if (!phrases || !phrases[effectiveLocale]) {
    return { present: [], missing: [], isComplete: false, complianceScore: 0 };
  }

  const requiredList = phrases[effectiveLocale];
  const present: string[] = [];
  const missing: string[] = [];

  for (const phrase of requiredList) {
    const normalizedPhrase = phrase.toLowerCase();
    if (normalizedText.includes(normalizedPhrase)) {
      present.push(phrase);
    } else {
      missing.push(phrase);
    }
  }

  const complianceScore = requiredList.length > 0
    ? Math.round((present.length / requiredList.length) * 100)
    : 0;

  return {
    present,
    missing,
    isComplete: missing.length === 0,
    complianceScore,
  };
}

/**
 * Verifies that appropriate disclaimers are present for the content type
 * 
 * @param content - The content to verify
 * @param locale - The locale (ar, he, en)
 * @returns Disclaimer verification result
 */
export function verifyDisclaimers(content: ContentToVerify, locale: string): DisclaimerVerification {
  const normalizedLocale = locale.toLowerCase();
  const effectiveLocale = ['ar', 'he', 'en'].includes(normalizedLocale) ? normalizedLocale : 'en';

  // Check if this content type requires disclaimers
  const requiresDisclaimer = DISCLAIMER_REQUIRED_TYPES.includes(content.type);

  if (!requiresDisclaimer) {
    return {
      valid: true,
      required: false,
      message: 'No disclaimer required for this content type',
    };
  }

  if (content.hasDisclaimers) {
    // Verify the disclaimers are appropriate
    const indicators = DISCLAIMER_INDICATORS[content.type]?.[effectiveLocale] || [];
    const normalizedText = content.text.toLowerCase();
    
    let hasValidDisclaimer = false;
    const missingElements: string[] = [];

    for (const indicator of indicators) {
      if (normalizedText.includes(indicator.toLowerCase())) {
        hasValidDisclaimer = true;
        break;
      }
    }

    // Check minimum disclaimer indicators
    for (const indicator of indicators.slice(0, 2)) {
      if (!normalizedText.includes(indicator.toLowerCase())) {
        missingElements.push(indicator);
      }
    }

    if (hasValidDisclaimer) {
      return {
        valid: true,
        required: true,
        message: 'Appropriate disclaimer detected',
        missingElements: missingElements.length > 0 ? missingElements : undefined,
      };
    }
  }

  // No valid disclaimer found
  const suggestedDisclaimer = DISCLAIMER_TEMPLATES[content.type]?.[effectiveLocale] || 
    DISCLAIMER_TEMPLATES[content.type]?.['en'];

  return {
    valid: false,
    required: true,
    message: `Missing required ${content.type} disclaimer`,
    suggestedDisclaimer,
    missingElements: DISCLAIMER_INDICATORS[content.type]?.[effectiveLocale]?.slice(0, 3),
  };
}

/**
 * Gets legal requirements for a specific locale
 * 
 * @param locale - The locale (ar, he, en)
 * @returns Legal requirements for the locale
 */
export function getLegalRequirements(locale: string): LegalRequirements {
  const normalizedLocale = locale.toLowerCase();
  
  // Default to English requirements for unsupported locales
  const effectiveLocale = ['ar', 'he', 'en'].includes(normalizedLocale) ? normalizedLocale : 'en';

  const baseRequirements: Record<string, LegalRequirements> = {
    en: {
      locale: 'en',
      jurisdiction: 'General Common Law / US Federal',
      requiredElements: [
        'Clear terms of service acceptance mechanism',
        'Privacy policy with data collection details',
        'Refund/return policy disclosure',
        'Contact information for legal notices',
        'Intellectual property rights statement',
        'Limitation of liability clause',
        'Governing law and jurisdiction clause',
        'Dispute resolution mechanism',
      ],
      prohibitedTerms: [
        'Unlimited liability clauses',
        'Perpetual binding agreements without opt-out',
        'Waiver of statutory consumer rights',
        'Unilateral modification without notice clauses',
      ],
      consumerProtection: {
        coolingOffPeriod: 14,
        rightToWithdraw: true,
        priceTransparency: true,
        contactRequirements: ['email', 'physical address', 'phone'],
      },
      dataPrivacy: {
        gdprCompliant: true,
        ccpaCompliant: true,
        requiredClauses: [
          'Data collection purpose',
          'Data retention period',
          'User rights (access, delete, portability)',
          'Third-party sharing disclosure',
          'Cookie usage disclosure',
          'Security measures description',
        ],
        dataRetentionPeriod: 'As long as necessary for business purposes or as required by law',
      },
      mandatoryDisclaimers: ['financial', 'medical', 'affiliate'],
    },
    ar: {
      locale: 'ar',
      jurisdiction: 'GCC / Middle East Regional',
      requiredElements: [
        'Terms in Arabic language',
        'Clear pricing in local currency',
        'Local contact information',
        'Sharia compliance statement (if applicable)',
        'Data protection under local regulations',
        'Refund policy compliant with local consumer law',
        'Dispute resolution in Arabic',
      ],
      prohibitedTerms: [
        'Terms that conflict with Sharia principles',
        'Unilateral jurisdiction clauses',
        'Hidden fee disclosures',
        'Unlimited liability in B2C transactions',
      ],
      consumerProtection: {
        coolingOffPeriod: 7,
        rightToWithdraw: true,
        priceTransparency: true,
        contactRequirements: ['email', 'phone', 'local address'],
      },
      dataPrivacy: {
        gdprCompliant: false,
        ccpaCompliant: false,
        requiredClauses: [
          'Data collection and processing details',
          'User consent mechanism',
          'Data sharing with third parties',
          'Security measures',
          'User rights under local law',
        ],
        dataRetentionPeriod: 'According to local business regulations',
      },
      mandatoryDisclaimers: ['financial', 'medical'],
    },
    he: {
      locale: 'he',
      jurisdiction: 'Israel - Israeli Law',
      requiredElements: [
        'Terms in Hebrew or English',
        'Israeli Consumer Protection Law compliance',
        'Clear cancellation policy',
        'Israeli business registration details',
        'Data protection under Israeli Privacy Protection Law',
        'VATPayer registration (if applicable)',
      ],
      prohibitedTerms: [
        'Terms violating Israeli Consumer Protection Law',
        'Unfair contract terms',
        'Hidden automatic renewal clauses',
        'Excessive penalty clauses',
      ],
      consumerProtection: {
        coolingOffPeriod: 14,
        rightToWithdraw: true,
        priceTransparency: true,
        contactRequirements: ['email', 'Israeli address', 'phone'],
      },
      dataPrivacy: {
        gdprCompliant: true,
        ccpaCompliant: false,
        requiredClauses: [
          'Purpose of data collection',
          'Data subject rights under Israeli law',
          'Database registration details',
          'Security safeguards',
          'Cross-border transfer disclosure',
        ],
        dataRetentionPeriod: 'As required by Israeli Privacy Protection Law',
      },
      mandatoryDisclaimers: ['financial', 'medical', 'affiliate'],
    },
  };

  return baseRequirements[effectiveLocale];
}

// Export constants for testing and external use
export { DISCLAIMER_REQUIRED_TYPES, DISCLAIMER_INDICATORS };
