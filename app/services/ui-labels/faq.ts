/**
 * FAQ Labels and Translation Service
 * 
 * Provides localized labels for FAQ sections including UI elements,
 * common questions, answers, and category names.
 * Supports Arabic (ar), Hebrew (he), and English (en).
 */

export interface FaqLabels {
  frequentlyAskedQuestions: string;
  question: string;
  answer: string;
  helpful: string;
  notHelpful: string;
  readMore: string;
  collapse: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export interface FormattedFaqItem {
  question: string;
  answer: string;
  category: string;
  locale: string;
  direction: "rtl" | "ltr";
}

const FAQ_LABELS: Record<string, FaqLabels> = {
  en: {
    frequentlyAskedQuestions: "Frequently Asked Questions",
    question: "Question",
    answer: "Answer",
    helpful: "Helpful",
    notHelpful: "Not Helpful",
    readMore: "Read More",
    collapse: "Collapse",
  },
  ar: {
    frequentlyAskedQuestions: "الأسئلة الشائعة",
    question: "السؤال",
    answer: "الإجابة",
    helpful: "مفيد",
    notHelpful: "غير مفيد",
    readMore: "اقرأ المزيد",
    collapse: "طي",
  },
  he: {
    frequentlyAskedQuestions: "שאלות נפוצות",
    question: "שאלה",
    answer: "תשובה",
    helpful: "מועיל",
    notHelpful: "לא מועיל",
    readMore: "קרא עוד",
    collapse: "כווץ",
  },
};

const FAQ_CATEGORIES: Record<string, Record<string, { name: string; description: string }>> = {
  en: {
    shipping: { name: "Shipping & Delivery", description: "Information about shipping options, delivery times, and tracking" },
    returns: { name: "Returns & Refunds", description: "How to return items and get refunds" },
    payment: { name: "Payment Methods", description: "Accepted payment methods and billing questions" },
    sizing: { name: "Sizing & Fit", description: "Size guides and fitting information" },
    general: { name: "General Questions", description: "Common questions about our store and policies" },
  },
  ar: {
    shipping: { name: "الشحن والتوصيل", description: "معلومات حول خيارات الشحن وأوقات التوصيل والتتبع" },
    returns: { name: "الإرجاع والاسترداد", description: "كيفية إرجاع المنتجات والحصول على استرداد" },
    payment: { name: "طرق الدفع", description: "طرق الدفع المقبولة وأسئلة الفوترة" },
    sizing: { name: "المقاسات والتناسب", description: "أدلة المقاسات ومعلومات الملاءمة" },
    general: { name: "أسئلة عامة", description: "أسئلة شائعة حول متجرنا وسياساتنا" },
  },
  he: {
    shipping: { name: "משלוח ואספקה", description: "מידע על אפשרויות משלוח, זמני אספקה ומעקב" },
    returns: { name: "החזרות וזיכויים", description: "כיצד להחזיר פריטים ולקבל זיכויים" },
    payment: { name: "אמצעי תשלום", description: "אמצעי תשלום מקובלים ושאלות בנושא חיוב" },
    sizing: { name: "מידות והתאמה", description: "מדריכי מידות ומידע על התאמה" },
    general: { name: "שאלות כלליות", description: "שאלות נפוצות על החנות שלנו ומדיניותה" },
  },
};

const FAQ_ITEMS: Record<string, Record<string, FaqItem[]>> = {
  en: {
    shipping: [
      { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days delivery.", category: "shipping" },
      { question: "Do you ship internationally?", answer: "Yes, we ship to over 50 countries worldwide. International shipping times vary by location.", category: "shipping" },
    ],
    returns: [
      { question: "What is your return policy?", answer: "We offer a 30-day return policy for unused items in original packaging. Refunds are processed within 5-7 business days.", category: "returns" },
      { question: "How do I initiate a return?", answer: "Log into your account, go to order history, and select 'Return Item'. Print the prepaid shipping label and drop off at any authorized location.", category: "returns" },
    ],
    payment: [
      { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, Apple Pay, Google Pay, and regional payment methods like Tabby and Tamara.", category: "payment" },
      { question: "Is my payment information secure?", answer: "Yes, we use industry-standard SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers.", category: "payment" },
    ],
    sizing: [
      { question: "How do I find my size?", answer: "Refer to our detailed size chart with measurements. If you're between sizes, we recommend ordering the larger size for comfort.", category: "sizing" },
      { question: "Do sizes run small or large?", answer: "Our sizes generally run true to size. Check individual product descriptions for any specific fit notes.", category: "sizing" },
    ],
    general: [
      { question: "How can I contact customer support?", answer: "You can reach us via email at support@example.com, live chat on our website, or call our hotline Sunday-Thursday 9AM-6PM.", category: "general" },
      { question: "Do you offer gift wrapping?", answer: "Yes, gift wrapping is available for a small fee. You can select this option during checkout and add a personalized message.", category: "general" },
    ],
  },
  ar: {
    shipping: [
      { question: "كم يستغرق الشحن؟", answer: "الشحن القياسي يستغرق 3-5 أيام عمل. الشحن السريع متاح للتوصيل خلال 1-2 يوم عمل.", category: "shipping" },
      { question: "هل تشحنون دولياً؟", answer: "نعم، نشحن إلى أكثر من 50 دولة حول العالم. تختلف أوقات الشحن الدولي حسب الموقع.", category: "shipping" },
    ],
    returns: [
      { question: "ما هي سياسة الإرجاع لديكم؟", answer: "نقدم سياسة إرجاع لمدة 30 يوماً للمنتجات غير المستخدمة في عبوتها الأصلية. يتم معالجة المبالغ المستردة خلال 5-7 أيام عمل.", category: "returns" },
      { question: "كيف يمكنني بدء عملية إرجاع؟", answer: "سجل الدخول إلى حسابك، انتقل إلى سجل الطلبات، واختر 'إرجاع المنتج'. اطبع ملصق الشحن المدفوع مسبقاً وسلّمه في أي موقع معتمد.", category: "returns" },
    ],
    payment: [
      { question: "ما هي طرق الدفع التي تقبلونها؟", answer: "نقبل جميع بطاقات الائتمان الرئيسية، باي بال، آبل باي، جوجل باي، وطرق الدفع المحلية مثل تابي وتمارا.", category: "payment" },
      { question: "هل معلومات الدفع الخاصة بي آمنة؟", answer: "نعم، نستخدم تشفير SSL القياسي في الصناعة ونلتزم بمعايير PCI DSS. لا يتم تخزين معلومات الدفع الخاصة بك على خوادمنا.", category: "payment" },
    ],
    sizing: [
      { question: "كيف أجد مقاسي؟", answer: "راجع دليل المقاسات المفصل مع القياسات. إذا كنت بين مقاسين، نوصي بطلب المقاس الأكبر للراحة.", category: "sizing" },
      { question: "هل المقاسات صغيرة أم كبيرة؟", answer: "مقاساتنا عموماً مطابقة للقياسات القياسية. تحقق من أوصاف المنتجات الفردية لأي ملاحظات محددة عن الملاءمة.", category: "sizing" },
    ],
    general: [
      { question: "كيف يمكنني التواصل مع دعم العملاء؟", answer: "يمكنك التواصل معنا عبر البريد الإلكتروني support@example.com، الدردشة المباشرة على موقعنا، أو الاتصال بخطنا الساخن من الأحد إلى الخميس 9ص-6م.", category: "general" },
      { question: "هل تقدمون خدمة تغليف الهدايا؟", answer: "نعم، خدمة تغليف الهدايا متاحة مقابل رسوم رمزية. يمكنك اختيار هذا الخيار أثناء إتمام الشراء وإضافة رسالة شخصية.", category: "general" },
    ],
  },
  he: {
    shipping: [
      { question: "כמה זמן לוקח המשלוח?", answer: "משלוח רגיל לוקח 3-5 ימי עסקים. משלוח אקספרס זמין למסירה תוך 1-2 ימי עסקים.", category: "shipping" },
      { question: "האם אתם משלחים בינלאומית?", answer: "כן, אנו שולחים ליותר מ-50 מדינות ברחבי העולם. זמני משלוח בינלאומיים משתנים לפי מיקום.", category: "shipping" },
    ],
    returns: [
      { question: "מהי מדיניות ההחזר שלכם?", answer: "אנו מציעים מדיניות החזר של 30 יום לפריטים שלא נעשה בהם שימוש באריזתם המקורית. זיכויים מעובדים תוך 5-7 ימי עסקים.", category: "returns" },
      { question: "כיצד אני יוזם החזרה?", answer: "התחבר לחשבונך, עבור להיסטוריית ההזמנות, ובחר 'החזר פריט'. הדפס את תווית המשלוח המשולמת מראש והשאר במיקום מורשה כלשהו.", category: "returns" },
    ],
    payment: [
      { question: "באילו אמצעי תשלום אתם מקבלים?", answer: "אנו מקבלים את כל כרטיסי האשראי הגדולים, PayPal, Apple Pay, Google Pay, ושיטות תשלום אזוריות כמו Tabby ו-Tamara.", category: "payment" },
      { question: "האם פרטי התשלום שלי מאובטחים?", answer: "כן, אנו משתמשים בהצפנת SSL סטנדרטית בתעשייה ועומדים בתקן PCI DSS. פרטי התשלום שלך אינם מאוחסנים בשרתים שלנו.", category: "payment" },
    ],
    sizing: [
      { question: "כיצד אני מוצא את המידה שלי?", answer: "עיין במדריך המידות המפורט שלנו עם מדידות. אם אתה בין מידות, אנו ממליצים להזמין את המידה הגדולה יותר לנוחות.", category: "sizing" },
      { question: "האם המידות קטנות או גדולות?", answer: "המידות שלנו בדרך כלל תקינות. בדוק תיאורי מוצר בודדים עבור כל הערות התאמה ספציפיות.", category: "sizing" },
    ],
    general: [
      { question: "כיצד אני יכול ליצור קשר עם התמיכה?", answer: "תוכל להשיג אותנו באימייל support@example.com, צ'אט חי באתר שלנו, או להתקשר לקו החם שלנו יום א'-ה' 9:00-18:00.", category: "general" },
      { question: "האם אתם מציעים עטיפת מתנות?", answer: "כן, עטיפת מתנות זמינה בתשלום נמוך. תוכל לבחור באפשרות זו במהלך התשלום ולהוסיף הודעה אישית.", category: "general" },
    ],
  },
};

export function getFaqLabel(key: keyof FaqLabels, locale: string): string {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const labels = FAQ_LABELS[base] ?? FAQ_LABELS["en"];
  return labels[key];
}

export function formatFaqItem(question: string, answer: string, locale: string, category: string = "general"): FormattedFaqItem {
  const rawBase = locale.split("-")[0]?.toLowerCase() ?? "en";
  const supportedLocales = ["ar", "he", "en"];
  const base = supportedLocales.includes(rawBase) ? rawBase : "en";
  const isRtl = base === "ar" || base === "he";
  return { question, answer, category, locale: base, direction: isRtl ? "rtl" : "ltr" };
}

export function getFaqCategories(locale: string): FaqCategory[] {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const categories = FAQ_CATEGORIES[base] ?? FAQ_CATEGORIES["en"];
  return Object.entries(categories).map(([id, data]) => ({ id, name: data.name, description: data.description }));
}

export function getFaqItemsByCategory(category: string, locale: string): FaqItem[] {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const items = FAQ_ITEMS[base] ?? FAQ_ITEMS["en"];
  return items[category] ?? [];
}

export function getAllFaqItems(locale: string): FaqItem[] {
  const base = locale.split("-")[0]?.toLowerCase() ?? "en";
  const items = FAQ_ITEMS[base] ?? FAQ_ITEMS["en"];
  return Object.values(items).flat();
}

export function getFaqCategoryById(categoryId: string, locale: string): FaqCategory | null {
  const categories = getFaqCategories(locale);
  return categories.find((c) => c.id === categoryId) ?? null;
}
