/**
 * Material Localization Service
 * Provides localized material names, descriptions, and care instructions
 * Supports Arabic (ar), Hebrew (he), and English (en) locales
 */

export type Locale = 'ar' | 'he' | 'en';
export type Material = keyof typeof materialsData;

export interface MaterialInfo {
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  careInstructions: Record<Locale, string[]>;
}

export const materialsData = {
  cotton: {
    name: {
      en: 'Cotton',
      ar: 'قطن',
      he: 'כותנה',
    },
    description: {
      en: 'Natural fiber known for breathability and softness. Ideal for everyday wear.',
      ar: 'ألياف طبيعية معروفة بقدرتها على التنفس ونعومتها. مثالية للارتداء اليومي.',
      he: 'סיב טבעי הידוע בנשימתיות ורכות. אידיאלי ללבוש יומיומי.',
    },
    careInstructions: {
      en: [
        'Machine wash warm (40°C)',
        'Tumble dry medium',
        'Iron on medium heat',
        'Do not bleach',
      ],
      ar: [
        'اغسل في الغسالة بالماء الدافئ (40 درجة مئوية)',
        'جفف في مجفف على درجة حرارة متوسطة',
        'كوي على درجة حرارة متوسطة',
        'لا تستخدم مبيض',
      ],
      he: [
        'לכבס במכונה במים חמימים (40°C)',
        'לייבש במייבש על חום בינוני',
        'לגהץ על חום בינוני',
        'אל תשתמשו בכלור',
      ],
    },
  },
  silk: {
    name: {
      en: 'Silk',
      ar: 'حرير',
      he: 'משי',
    },
    description: {
      en: 'Luxurious natural protein fiber with a smooth, shiny texture.',
      ar: 'ليف بروتيني طبيعي فاخر بملمس ناعم ولامع.',
      he: 'סיב חלבון טבעי יוקרתי עם מרקם חלק ומבריק.',
    },
    careInstructions: {
      en: [
        'Dry clean recommended',
        'Hand wash cold if necessary',
        'Do not wring',
        'Iron on low heat with cloth',
      ],
      ar: [
        'يفضل التنظيف الجاف',
        'اغسل باليد بالماء البارد عند الضرورة',
        'لا تعصر',
        'كوي على نار هادئة مع استخدام قطعة قماش',
      ],
      he: [
        'ניקוי יבש מומלץ',
        'לכבס ביד במים קרים במקרה הצורך',
        'אל תסחטו',
        'לגהץ על חום נמוך עם בד',
      ],
    },
  },
  leather: {
    name: {
      en: 'Leather',
      ar: 'جلد',
      he: 'עור',
    },
    description: {
      en: 'Durable natural material made from animal hide. Ages beautifully with proper care.',
      ar: 'مادة طبيعية متينة مصنوعة من جلد الحيوانات. يتقدم في العمر بشكل جميل مع العناية المناسبة.',
      he: 'חומר טבעי עמיד העשוי מעור בעלי חיים. מזדקן ביופי עם טיפול נכון.',
    },
    careInstructions: {
      en: [
        'Wipe with damp cloth',
        'Use leather conditioner regularly',
        'Keep away from direct heat',
        'Store in cool, dry place',
      ],
      ar: [
        'امسح بقطعة قماش مبللة',
        'استخدم منظف الجلد بانتظام',
        'احتفظ بعيداً عن الحرارة المباشرة',
        'خزن في مكان بارد وجاف',
      ],
      he: [
        'לנגב במטלת עור לחה',
        'להשתמש במרכך עור באופן קבוע',
        'להרחיק ממקור חום ישיר',
        'לאחסן במקום קריר ויבש',
      ],
    },
  },
  polyester: {
    name: {
      en: 'Polyester',
      ar: 'بوليستر',
      he: 'פוליאסטר',
    },
    description: {
      en: 'Synthetic fiber known for durability, wrinkle resistance, and easy care.',
      ar: 'ليف صناعي معروف بمتانته ومقاومته للتجاع وسهولة العناية.',
      he: 'סיב סינתטי הידוע בעמידותו, עמידות בקמטים וטיפול קל.',
    },
    careInstructions: {
      en: [
        'Machine wash warm',
        'Tumble dry low',
        'No ironing needed',
        'Do not use fabric softener',
      ],
      ar: [
        'اغسل في الغسالة بالماء الدافئ',
        'جفف في مجفف على حرارة منخفضة',
        'لا يحتاج للكي',
        'لا تستخدم منعم الأقمشة',
      ],
      he: [
        'לכבס במכונה במים חמימים',
        'לייבש במייבש על חום נמוך',
        'אין צורך בגיהוץ',
        'אל תשתמשו במרכך בדים',
      ],
    },
  },
  wool: {
    name: {
      en: 'Wool',
      ar: 'صوف',
      he: 'צמר',
    },
    description: {
      en: 'Natural fiber from sheep, excellent insulation and moisture wicking properties.',
      ar: 'ليف طبيعي من الأغنام، خصائص عازلة ممتازة وامتصاص للرطوبة.',
      he: 'סיב טבעי מכבשים, בידוד מעולה ותכונות ספיגת לחות.',
    },
    careInstructions: {
      en: [
        'Hand wash cold or dry clean',
        'Lay flat to dry',
        'Do not tumble dry',
        'Store with cedar blocks',
      ],
      ar: [
        'اغسل باليد بالماء البارد أو التنظيف الجاف',
        'ضع مسطحاً للتجفيف',
        'لا تجفف في المجفف',
        'خزن مع قطع الأرز',
      ],
      he: [
        'לכבס ביד במים קרים או ניקוי יבש',
        'לייבש בשכיבה',
        'אל תייבשו במייבש',
        'לאחסן עם גושי ארז',
      ],
    },
  },
  linen: {
    name: {
      en: 'Linen',
      ar: 'كتان',
      he: 'פשתן',
    },
    description: {
      en: 'Natural fiber from flax plant, highly breathable and perfect for warm weather.',
      ar: 'ليف طبيعي من نبات الكتان، قابل للتنفس بشكل كبير ومثالي للطقس الدافئ.',
      he: 'סיב טבעי מצמח הפשתה, נושם מאוד ומושלם למזג אוויר חם.',
    },
    careInstructions: {
      en: [
        'Machine wash cold',
        'Tumble dry low or line dry',
        'Iron while damp',
        'Do not bleach',
      ],
      ar: [
        'اغسل في الغسالة بالماء البارد',
        'جفف في مجفف على حرارة منخفضة أو بالهواء',
        'كوي وهو رطب',
        'لا تستخدم مبيض',
      ],
      he: [
        'לכבס במכונה במים קרים',
        'לייבש במייבש על חום נמוך או על חבל',
        'לגהץ כשלח',
        'אל תשתמשו בכלור',
      ],
    },
  },
  cashmere: {
    name: {
      en: 'Cashmere',
      ar: 'كشمير',
      he: 'קשמיר',
    },
    description: {
      en: 'Luxurious soft wool from cashmere goats. Lightweight yet incredibly warm.',
      ar: 'صوف ناعم فاخر من ماعز الكشمير. خفيف الوزن لكنه دافئ بشكل لا يصدق.',
      he: 'צמר רך יוקרתי מעזי קשמיר. קל משקל אך חם להפליא.',
    },
    careInstructions: {
      en: [
        'Dry clean only',
        'Fold, do not hang',
        'Store in breathable bag',
        'Use cashmere comb for pilling',
      ],
      ar: [
        'التنظيف الجاف فقط',
        'اطوِ، لا تعلق',
        'خزن في كيس قابل للتنفس',
        'استخدم مشط الكشمير للكرات',
      ],
      he: [
        'ניקוי יבש בלבד',
        'לקפל, לא לתלות',
        'לאחסן בשקית נושמת',
        'להשתמש במסרק קשמיר לכדוריות',
      ],
    },
  },
  velvet: {
    name: {
      en: 'Velvet',
      ar: 'مخمل',
      he: 'קטיפה',
    },
    description: {
      en: 'Soft woven fabric with a dense pile, known for its rich texture and sheen.',
      ar: 'قماش نسيج ناعم بكثافة عالية، معروف بملمسه الغني ولمعانه.',
      he: 'בד ארוג רך עם ערימה צפופה, ידוע במרקם העשיר והברק שלו.',
    },
    careInstructions: {
      en: [
        'Dry clean recommended',
        'Brush gently with soft brush',
        'Steam to remove wrinkles',
        'Store flat or rolled',
      ],
      ar: [
        'يفضل التنظيف الجاف',
        'نظف بلطف بفرشاة ناعمة',
        'استخدم البخار لإزالة التجاعيد',
        'خزن مسطحاً أو ملفوفاً',
      ],
      he: [
        'ניקוי יבש מומלץ',
        'להבריש בעדינות עם מברשת רכה',
        'לבשל כדי להסיר קמטים',
        'לאחסן שטוח או מגולגל',
      ],
    },
  },
  denim: {
    name: {
      en: 'Denim',
      ar: 'دنيم',
      he: 'דנים',
    },
    description: {
      en: 'Sturdy cotton twill fabric, durable and versatile for casual wear.',
      ar: 'قماش قطني قوي بتقنية التويل، متين ومتعدد الاستخدامات للملابس العادية.',
      he: 'בד כותנה חזק בסריגת טוויל, עמיד ורב-תכליתי ללבוש יומיומי.',
    },
    careInstructions: {
      en: [
        'Turn inside out before washing',
        'Machine wash cold',
        'Wash separately first few times',
        'Tumble dry low or line dry',
      ],
      ar: [
        'اقلب من الداخل للخارج قبل الغسيل',
        'اغسل في الغسالة بالماء البارد',
        'اغسل بشكل منفصل في المرات الأولى',
        'جفف في مجفف على حرارة منخفضة أو بالهواء',
      ],
      he: [
        'להפוך לצד הפנימי לפני הכביסה',
        'לכבס במכונה במים קרים',
        'לכבס בנפרד בכמה הפעמים הראשונות',
        'לייבש במייבש על חום נמוך או על חבל',
      ],
    },
  },
  suede: {
    name: {
      en: 'Suede',
      ar: 'شمواه',
      he: 'זמש',
    },
    description: {
      en: 'Soft leather with a napped finish, elegant and luxurious texture.',
      ar: 'جلد ناعم بلمسة نهائية مخملية، ملمس أنيق وفاخر.',
      he: 'עור רך עם גימור מחוספס, מרקם אלגנטי ויוקרתי.',
    },
    careInstructions: {
      en: [
        'Brush regularly with suede brush',
        'Use waterproofing spray',
        'Air dry away from heat',
        'Store with shoe trees',
      ],
      ar: [
        'نظف بانتظام بفرشاة الشمواه',
        'استخدم بخاخ مقاوم للماء',
        'جفف بالهواء بعيداً عن الحرارة',
        'خزن مع قواعد الأحذية',
      ],
      he: [
        'להבריש באופן קבוע עם מברשת זמש',
        'להשתמש בספריי עמיד במים',
        'לייבש באוויר הרחק ממקור חום',
        'לאחסן עם עצי נעליים',
      ],
    },
  },
  rayon: {
    name: {
      en: 'Rayon',
      ar: 'رايون',
      he: 'ריון',
    },
    description: {
      en: 'Semi-synthetic fiber made from cellulose, soft and breathable like cotton.',
      ar: 'ليف شبه صناعي مصنوع من السليلوز، ناعم وقابل للتنفس مثل القطن.',
      he: 'סיב חצי סינתטי העשוי מתאית, רך ונושם כמו כותנה.',
    },
    careInstructions: {
      en: [
        'Hand wash or delicate cycle',
        'Do not wring',
        'Lay flat to dry',
        'Iron on low heat',
      ],
      ar: [
        'اغسل باليد أو ببرنامج الرقيقة',
        'لا تعصر',
        'ضع مسطحاً للتجفيف',
        'كوي على حرارة منخفضة',
      ],
      he: [
        'לכבס ביד או במחזור עדין',
        'אל תסחטו',
        'לייבש בשכיבה',
        'לגהץ על חום נמוך',
      ],
    },
  },
  nylon: {
    name: {
      en: 'Nylon',
      ar: 'نايلون',
      he: 'ניילון',
    },
    description: {
      en: 'Synthetic polymer known for strength, elasticity, and quick-drying properties.',
      ar: 'بوليمر صناعي معروف بقوته ومرونته وخصائصه السريعة الجفاف.',
      he: 'פולימר סינתטי הידוע בחוזקו, אלסטיותו ותכונות ייבוש מהיר.',
    },
    careInstructions: {
      en: [
        'Machine wash warm',
        'Tumble dry low',
        'Do not use bleach',
        'Iron on low if needed',
      ],
      ar: [
        'اغسل في الغسالة بالماء الدافئ',
        'جفف في مجفف على حرارة منخفضة',
        'لا تستخدم مبيض',
        'كوي على حرارة منخفضة عند الضرورة',
      ],
      he: [
        'לכבס במכונה במים חמימים',
        'לייבש במייבש על חום נמוך',
        'אל תשתמשו בכלור',
        'לגהץ על חום נמוך במקרה הצורך',
      ],
    },
  },
  spandex: {
    name: {
      en: 'Spandex',
      ar: 'سباندكس',
      he: 'ספנדקס',
    },
    description: {
      en: 'Synthetic fiber known for exceptional elasticity, often blended with other fabrics.',
      ar: 'ليف صناعي معروف بمرونته الاستثنائية، غالباً ما يمزج مع الأقمشة الأخرى.',
      he: 'סיב סינתטי הידוע באלסטיותו היוצאת מן הכלל, לרוב משולב עם בדים אחרים.',
    },
    careInstructions: {
      en: [
        'Hand wash or delicate cycle',
        'Do not use fabric softener',
        'Air dry flat',
        'Do not iron',
      ],
      ar: [
        'اغسل باليد أو ببرنامج الرقيقة',
        'لا تستخدم منعم الأقمشة',
        'جفف بالهواء بشكل مسطح',
        'لا تكوي',
      ],
      he: [
        'לכבס ביד או במחזור עדין',
        'אל תשתמשו במרכך בדים',
        'לייבש באוויר בשכיבה',
        'אל תגהצו',
      ],
    },
  },
  acrylic: {
    name: {
      en: 'Acrylic',
      ar: 'أكريليك',
      he: 'אקריליק',
    },
    description: {
      en: 'Synthetic alternative to wool, lightweight and warm with easy care.',
      ar: 'بديل صناعي للصوف، خفيف الوزن ودافئ وسهل العناية.',
      he: 'חלופה סינתטית לצמר, קל משקל וחם עם טיפול קל.',
    },
    careInstructions: {
      en: [
        'Machine wash warm',
        'Tumble dry low',
        'Do not iron',
        'Wash with like colors',
      ],
      ar: [
        'اغسل في الغسالة بالماء الدافئ',
        'جفف في مجفف على حرارة منخفضة',
        'لا تكوي',
        'اغسل مع الألوان المتشابهة',
      ],
      he: [
        'לכבס במכונה במים חמימים',
        'לייבש במייבש על חום נמוך',
        'אל תגהצו',
        'לכבס עם צבעים דומים',
      ],
    },
  },
  chiffon: {
    name: {
      en: 'Chiffon',
      ar: 'شيفون',
      he: 'שיפון',
    },
    description: {
      en: 'Lightweight sheer fabric with a soft drape, elegant for evening wear.',
      ar: 'قماش شفاف خفيف الوزن بسقوط ناعم، أنيق للملابس المسائية.',
      he: 'בד שקוף קל משקל עם נפילה רכה, אלגנטי לבלי ערב.',
    },
    careInstructions: {
      en: [
        'Hand wash cold',
        'Do not wring',
        'Hang to dry',
        'Steam iron on low',
      ],
      ar: [
        'اغسل باليد بالماء البارد',
        'لا تعصر',
        'علق للتجفيف',
        'كوي بالبخار على حرارة منخفضة',
      ],
      he: [
        'לכבס ביד במים קרים',
        'אל תסחטו',
        'לתלות לייבוש',
        'לגהץ בקיטור על חום נמוך',
      ],
    },
  },
  satin: {
    name: {
      en: 'Satin',
      ar: 'ساتان',
      he: 'סאטן',
    },
    description: {
      en: 'Smooth glossy fabric with a luxurious feel, perfect for formal occasions.',
      ar: 'قماش ناعم ولامع بلمسة فاخرة، مثالي للمناسبات الرسمية.',
      he: 'בד חלק ומבריק עם מגע יוקרתי, מושלם לאירועים פורמליים.',
    },
    careInstructions: {
      en: [
        'Hand wash or dry clean',
        'Do not wring',
        'Hang to dry away from sun',
        'Iron on reverse side',
      ],
      ar: [
        'اغسل باليد أو التنظيف الجاف',
        'لا تعصر',
        'علق للتجفيف بعيداً عن الشمس',
        'كوي من الجانب الخلفي',
      ],
      he: [
        'לכבס ביד או ניקוי יבש',
        'אל תסחטו',
        'לתלות לייבוש הרחק מהשמש',
        'לגהץ מצד ההפוך',
      ],
    },
  },
  corduroy: {
    name: {
      en: 'Corduroy',
      ar: 'كوردروي',
      he: 'קורדרוי',
    },
    description: {
      en: 'Ridged fabric with distinctive parallel cords, durable and warm.',
      ar: 'قماش مضلع بأوتار موازية مميزة، متين ودافئ.',
      he: 'בד מחורץ עם חבלים מקבילים אופייניים, עמיד וחם.',
    },
    careInstructions: {
      en: [
        'Turn inside out to wash',
        'Machine wash cold',
        'Tumble dry low',
        'Iron inside out on low',
      ],
      ar: [
        'اقلب من الداخل للخارج للغسيل',
        'اغسل في الغسالة بالماء البارد',
        'جفف في مجفف على حرارة منخفضة',
        'كوي من الداخل للخارج على حرارة منخفضة',
      ],
      he: [
        'להפוך לצד הפנימי לכביסה',
        'לכבס במכונה במים קרים',
        'לייבש במייבש על חום נמוך',
        'לגהץ מצד הפנימי על חום נמוך',
      ],
    },
  },
  tweed: {
    name: {
      en: 'Tweed',
      ar: 'تويد',
      he: 'טוויד',
    },
    description: {
      en: 'Rough woven wool fabric with colorful flecks, classic and durable.',
      ar: 'قماش صوفي خشن منسوج ببقع ملونة، كلاسيكي ومتين.',
      he: 'בד צמר גס ארוג עם כתמים צבעוניים, קלאסי ועמיד.',
    },
    careInstructions: {
      en: [
        'Dry clean recommended',
        'Brush to remove surface dirt',
        'Air out after wearing',
        'Store with moth repellent',
      ],
      ar: [
        'يفضل التنظيف الجاف',
        'نظف لإزالة الأوساخ السطحية',
        'هوِّن بعد الارتداء',
        'خزن مع مبيد العث',
      ],
      he: [
        'ניקוי יבש מומלץ',
        'להבריש להסרת לכלוך משטחי',
        'לאוורר לאחר הלבישה',
        'לאחסן עם דוחה עש',
      ],
    },
  },
  canvas: {
    name: {
      en: 'Canvas',
      ar: 'كانفاس',
      he: 'קנבס',
    },
    description: {
      en: 'Heavy-duty plain weave fabric, extremely durable for bags and outerwear.',
      ar: 'قماش نسيج عادي ثقيل التحمل، متين للغاية للحقائب والملابس الخارجية.',
      he: 'בד אריגה פשוטה כבד, עמיד ביותר לתיקים ולבוש חיצוני.',
    },
    careInstructions: {
      en: [
        'Machine wash cold',
        'Air dry recommended',
        'Iron on high if needed',
        'Use starch for stiffness',
      ],
      ar: [
        'اغسل في الغسالة بالماء البارد',
        'التجفيف بالهواء مستحسن',
        'كوي على حرارة عالية عند الضرورة',
        'استخدم النشا للصلابة',
      ],
      he: [
        'לכבס במכונה במים קרים',
        'ייבוש באוויר מומלץ',
        'לגהץ על חום גבוה במקרה הצורך',
        'להשתמש בעמילן לקשיחות',
      ],
    },
  },
  fleece: {
    name: {
      en: 'Fleece',
      ar: 'فليس',
      he: 'פליז',
    },
    description: {
      en: 'Synthetic insulating fabric, soft and warm, perfect for activewear.',
      ar: 'قماش عازل صناعي، ناعم ودافئ، مثالي للملابس الرياضية.',
      he: 'בד בידוד סינתטי, רך וחם, מושלם לבגדי ספורט.',
    },
    careInstructions: {
      en: [
        'Machine wash cold',
        'Tumble dry low',
        'Do not iron',
        'Do not use fabric softener',
      ],
      ar: [
        'اغسل في الغسالة بالماء البارد',
        'جفف في مجفف على حرارة منخفضة',
        'لا تكوي',
        'لا تستخدم منعم الأقمشة',
      ],
      he: [
        'לכבס במכונה במים קרים',
        'לייבש במייבש על חום נמוך',
        'אל תגהצו',
        'אל תשתמשו במרכך בדים',
      ],
    },
  },
  mohair: {
    name: {
      en: 'Mohair',
      ar: 'موهير',
      he: 'מוהר',
    },
    description: {
      en: 'Silk-like fabric made from Angora goat hair, luxurious and warm.',
      ar: 'قماش يشبه الحرير مصنوع من شعر ماعز الأنغورا، فاخر ودافئ.',
      he: 'בד דמוי משי העשוי משערות עז אנגורה, יוקרתי וחם.',
    },
    careInstructions: {
      en: [
        'Dry clean only',
        'Do not machine wash',
        'Store folded with tissue paper',
        'Brush gently to restore pile',
      ],
      ar: [
        'التنظيف الجاف فقط',
        'لا تغسل في الغسالة',
        'خزن مطوياً مع ورق التواليت',
        'نظف بلطف لاستعادة الكثافة',
      ],
      he: [
        'ניקוי יבש בלבד',
        'אל תכבסו במכונה',
        'לאחסן מקופל עם נייר טישו',
        'להבריש בעדינות כדי לשחזר את הערימה',
      ],
    },
  },
} as const;

/**
 * Get localized material name
 * @param material - Material key
 * @param locale - Target locale (ar, he, en)
 * @returns Localized material name
 */
export function getMaterialName(material: Material, locale: Locale): string {
  const materialData = materialsData[material];
  if (!materialData) {
    return material;
  }
  return materialData.name[locale] || materialData.name.en;
}

/**
 * Get localized material description
 * @param material - Material key
 * @param locale - Target locale (ar, he, en)
 * @returns Localized material description
 */
export function getMaterialDescription(material: Material, locale: Locale): string {
  const materialData = materialsData[material];
  if (!materialData) {
    return '';
  }
  return materialData.description[locale] || materialData.description.en;
}

/**
 * Get localized care instructions for a material
 * @param material - Material key
 * @param locale - Target locale (ar, he, en)
 * @returns Array of localized care instructions
 */
export function getMaterialCareInstructions(material: Material, locale: Locale): string[] {
  const materialData = materialsData[material];
  if (!materialData) {
    return [];
  }
  return materialData.careInstructions[locale] || materialData.careInstructions.en;
}

/**
 * Get all available materials
 * @returns Array of material keys
 */
export function getAllMaterials(): Material[] {
  return Object.keys(materialsData) as Material[];
}

/**
 * Check if a material exists
 * @param material - Material key to check
 * @returns boolean
 */
export function isValidMaterial(material: string): material is Material {
  return material in materialsData;
}

/**
 * Get material info for all locales
 * @param material - Material key
 * @returns Complete material info or null if not found
 */
export function getMaterialInfo(material: Material): MaterialInfo | null {
  const materialData = materialsData[material];
  if (!materialData) {
    return null;
  }
  return materialData;
}

/**
 * Get supported locales
 * @returns Array of supported locale codes
 */
export function getSupportedLocales(): Locale[] {
  return ['ar', 'he', 'en'];
}

/**
 * Search materials by name (partial match)
 * @param query - Search query
 * @param locale - Locale to search in
 * @returns Array of matching material keys
 */
export function searchMaterials(query: string, locale: Locale): Material[] {
  const lowerQuery = query.toLowerCase();
  return (Object.keys(materialsData) as Material[]).filter((material) => {
    const name = materialsData[material].name[locale].toLowerCase();
    return name.includes(lowerQuery);
  });
}

/**
 * Get materials by category (natural vs synthetic)
 * @returns Object with natural and synthetic material arrays
 */
export function getMaterialsByCategory(): {
  natural: Material[];
  synthetic: Material[];
} {
  const natural: Material[] = [
    'cotton',
    'silk',
    'leather',
    'wool',
    'linen',
    'cashmere',
    'suede',
    'mohair',
  ];
  const synthetic: Material[] = [
    'polyester',
    'velvet',
    'denim',
    'rayon',
    'nylon',
    'spandex',
    'acrylic',
    'chiffon',
    'satin',
    'corduroy',
    'tweed',
    'canvas',
    'fleece',
  ];

  return { natural, synthetic };
}
