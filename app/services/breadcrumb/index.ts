/**
 * Breadcrumb Schema Translation Service
 * T0075: SEO - Breadcrumb Schema Translation
 */

export interface BreadcrumbItem {
  name: string;
  nameAr?: string;
  nameHe?: string;
  item: string;
  position: number;
}

export interface TranslatedBreadcrumb {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

// Common breadcrumb translations
export const BREADCRUMB_TRANSLATIONS: Record<string, Record<string, string>> = {
  'Home': { ar: 'الرئيسية', he: 'בית', fr: 'Accueil', de: 'Startseite' },
  'Products': { ar: 'المنتجات', he: 'מוצרים', fr: 'Produits', de: 'Produkte' },
  'Collections': { ar: 'المجموعات', he: 'אוספים', fr: 'Collections', de: 'Kollektionen' },
  'Pages': { ar: 'الصفحات', he: 'דפים', fr: 'Pages', de: 'Seiten' },
  'Blog': { ar: 'المدونة', he: 'בלוג', fr: 'Blog', de: 'Blog' },
  'Search': { ar: 'بحث', he: 'חיפוש', fr: 'Recherche', de: 'Suche' },
  'Cart': { ar: 'عربة التسوق', he: 'עגלה', fr: 'Panier', de: 'Warenkorb' },
  'Checkout': { ar: 'الدفع', he: 'תשלום', fr: 'Paiement', de: 'Kasse' },
  'Account': { ar: 'الحساب', he: 'חשבון', fr: 'Compte', de: 'Konto' },
  'Contact': { ar: 'اتصل بنا', he: 'צור קשר', fr: 'Contact', de: 'Kontakt' },
  'About': { ar: 'عن الشركة', he: 'אודות', fr: 'À propos', de: 'Über uns' },
  'FAQ': { ar: 'الأسئلة الشائعة', he: 'שאלות נפוצות', fr: 'FAQ', de: 'FAQ' },
};

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  locale: 'en' | 'ar' | 'he' = 'en'
): TranslatedBreadcrumb {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: getTranslatedBreadcrumbName(item, locale),
      item: item.item,
    })),
  };
}

/**
 * Get translated breadcrumb name
 */
export function getTranslatedBreadcrumbName(
  item: BreadcrumbItem,
  locale: 'en' | 'ar' | 'he'
): string {
  if (locale === 'ar' && item.nameAr) {
    return item.nameAr;
  }
  if (locale === 'he' && item.nameHe) {
    return item.nameHe;
  }
  
  // Check common translations
  const commonTranslation = BREADCRUMB_TRANSLATIONS[item.name]?.[locale];
  if (commonTranslation) {
    return commonTranslation;
  }
  
  return item.name;
}

/**
 * Generate breadcrumb items for a product page
 */
export function generateProductBreadcrumbs(
  product: { title: string; titleAr?: string; collection?: string; collectionAr?: string },
  locale: 'en' | 'ar' | 'he' = 'en'
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
    { name: 'Products', nameAr: 'المنتجات', item: '/products', position: 2 },
  ];

  if (product.collection) {
    items.push({
      name: product.collection,
      nameAr: product.collectionAr,
      item: `/collections/${product.collection.toLowerCase().replace(/\s+/g, '-')}`,
      position: 3,
    });
    items.push({
      name: product.title,
      nameAr: product.titleAr,
      item: '#',
      position: 4,
    });
  } else {
    items.push({
      name: product.title,
      nameAr: product.titleAr,
      item: '#',
      position: 3,
    });
  }

  return items;
}

/**
 * Generate breadcrumb items for a collection page
 */
export function generateCollectionBreadcrumbs(
  collection: { title: string; titleAr?: string },
  locale: 'en' | 'ar' | 'he' = 'en'
): BreadcrumbItem[] {
  return [
    { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
    { name: 'Collections', nameAr: 'المجموعات', item: '/collections', position: 2 },
    { name: collection.title, nameAr: collection.titleAr, item: '#', position: 3 },
  ];
}

/**
 * Generate breadcrumb items for a page
 */
export function generatePageBreadcrumbs(
  page: { title: string; titleAr?: string },
  locale: 'en' | 'ar' | 'he' = 'en'
): BreadcrumbItem[] {
  return [
    { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
    { name: page.title, nameAr: page.titleAr, item: '#', position: 2 },
  ];
}

/**
 * Render breadcrumb navigation HTML
 */
export function renderBreadcrumbNav(
  items: BreadcrumbItem[],
  locale: 'en' | 'ar' | 'he' = 'en',
  separator: string = '/'
): string {
  const isRTL = locale === 'ar' || locale === 'he';
  
  const html = items.map((item, index) => {
    const name = getTranslatedBreadcrumbName(item, locale);
    const isLast = index === items.length - 1;
    
    if (isLast) {
      return `<span class="breadcrumb__current" aria-current="page">${name}</span>`;
    }
    
    return `<a href="${item.item}" class="breadcrumb__link">${name}</a>`;
  }).join(` <span class="breadcrumb__separator">${separator}</span> `);

  return `
    <nav aria-label="Breadcrumb" class="breadcrumb" dir="${isRTL ? 'rtl' : 'ltr'}">
      <ol class="breadcrumb__list">
        ${items.map((item, index) => {
          const name = getTranslatedBreadcrumbName(item, locale);
          const isLast = index === items.length - 1;
          return `
            <li class="breadcrumb__item">
              ${isLast 
                ? `<span aria-current="page">${name}</span>`
                : `<a href="${item.item}">${name}</a>`
              }
            </li>
          `;
        }).join('')}
      </ol>
    </nav>
  `;
}

/**
 * Add custom breadcrumb translation
 */
export function addBreadcrumbTranslation(
  key: string,
  translations: Record<string, string>
): void {
  BREADCRUMB_TRANSLATIONS[key] = { ...BREADCRUMB_TRANSLATIONS[key], ...translations };
}

/**
 * Get breadcrumb path for a URL
 */
export function getBreadcrumbPath(
  url: string,
  locale: 'en' | 'ar' | 'he' = 'en'
): BreadcrumbItem[] {
  const parts = url.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [
    { name: 'Home', nameAr: 'الرئيسية', item: '/', position: 1 },
  ];

  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    currentPath += `/${part}`;
    
    const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    items.push({
      name,
      item: currentPath,
      position: i + 2,
    });
  }

  return items;
}
