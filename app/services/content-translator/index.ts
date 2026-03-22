/**
 * Content Translation Service
 * Unified service for translating all Shopify content types
 * Covers: Products, Collections, Pages, Blogs, Navigation, Theme, Email, Cart, Checkout
 */

export interface TranslatableField {
  key: string;
  value: string;
  maxLength?: number;
  html?: boolean;
}

export interface TranslationContext {
  shopId: string;
  locale: string;
  sourceLocale: string;
  autoTranslate?: boolean;
}

export interface TranslationResult {
  key: string;
  original: string;
  translated: string;
  status: 'translated' | 'pending' | 'error';
  error?: string;
}

// Product Content
export interface ProductContent {
  title: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  variants: Array<{
    title: string;
    sku?: string;
    option1?: string;
    option2?: string;
    option3?: string;
  }>;
  options: Array<{
    name: string;
    values: string[];
  }>;
  metafields?: Record<string, string>;
}

// Collection Content
export interface CollectionContent {
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrderLabel?: string;
}

// Page Content
export interface PageContent {
  title: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Blog Content
export interface BlogArticleContent {
  title: string;
  content: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// Navigation Content
export interface NavigationContent {
  menuItems: Array<{
    title: string;
    url: string;
    items?: Array<{ title: string; url: string }>;
  }>;
  linkTitles: Record<string, string>;
}

// Theme Content
export interface ThemeContent {
  sectionHeaders: Record<string, string>;
  buttonLabels: Record<string, string>;
  formLabels: Record<string, string>;
  placeholders: Record<string, string>;
  errorMessages: Record<string, string>;
  successMessages: Record<string, string>;
  notifications: Record<string, string>;
}

// Email Content
export interface EmailContent {
  subject: string;
  body: string;
  previewText?: string;
  buttonText?: string;
  footerText?: string;
}

// Cart & Checkout Content
export interface CartContent {
  lineItemProperties: Record<string, string>;
  giftMessage?: string;
  specialInstructions?: string;
}

export interface CheckoutContent {
  shippingMethods: Record<string, string>;
  paymentMethods: Record<string, string>;
  billingLabels: Record<string, string>;
  termsAndConditions?: string;
}

// Gift Card Content
export interface GiftCardContent {
  title: string;
  description: string;
  emailSubject?: string;
  emailBody?: string;
}

// Discount Content
export interface DiscountContent {
  codeLabel: string;
  description: string;
  successMessage?: string;
  errorMessage?: string;
}

// Customer Content
export interface CustomerContent {
  addressLabels: Record<string, string>;
  orderStatusLabels: Record<string, string>;
  accountTabLabels: Record<string, string>;
}

// Search Content
export interface SearchContent {
  placeholder: string;
  resultsLabel: string;
  filterLabels: Record<string, string>;
}

// Filter Content
export interface FilterContent {
  availabilityLabels: Record<string, string>;
  priceRangeLabel: string;
}

// Pagination Content
export interface PaginationContent {
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
}

// Breadcrumb Content
export interface BreadcrumbContent {
  homeLabel: string;
  separator: string;
}

// Social Content
export interface SocialContent {
  shareButtons: Record<string, string>;
  linkTitles: Record<string, string>;
}

// FAQ Content
export interface FAQContent {
  questions: Array<{ question: string; answer: string }>;
}

// Announcement Content
export interface AnnouncementContent {
  text: string;
}

// Newsletter Content
export interface NewsletterContent {
  placeholder: string;
  buttonLabel: string;
  successMessage: string;
  privacyText?: string;
}

// Popup Content
export interface PopupContent {
  title: string;
  content: string;
  buttonText?: string;
  dismissText?: string;
}

// Size Chart Content
export interface SizeChartContent {
  title: string;
  headers: string[];
  rows: string[][];
  notes?: string;
}

/**
 * Main Content Translator Class
 */
export class ContentTranslator {
  constructor(private context: TranslationContext) {}

  async translateProduct(content: ProductContent): Promise<Partial<ProductContent>> {
    return {
      title: `[${this.context.locale}] ${content.title}`,
      description: `[${this.context.locale}] ${content.description}`,
      vendor: content.vendor,
      productType: `[${this.context.locale}] ${content.productType}`,
      tags: content.tags.map(t => `[${this.context.locale}] ${t}`),
    };
  }

  async translateCollection(content: CollectionContent): Promise<Partial<CollectionContent>> {
    return {
      title: `[${this.context.locale}] ${content.title}`,
      description: `[${this.context.locale}] ${content.description}`,
      seoTitle: content.seoTitle ? `[${this.context.locale}] ${content.seoTitle}` : undefined,
      seoDescription: content.seoDescription ? `[${this.context.locale}] ${content.seoDescription}` : undefined,
    };
  }

  async translatePage(content: PageContent): Promise<Partial<PageContent>> {
    return {
      title: `[${this.context.locale}] ${content.title}`,
      content: `[${this.context.locale}] ${content.content}`,
      seoTitle: content.seoTitle ? `[${this.context.locale}] ${content.seoTitle}` : undefined,
      seoDescription: content.seoDescription ? `[${this.context.locale}] ${content.seoDescription}` : undefined,
    };
  }

  async translateBlogArticle(content: BlogArticleContent): Promise<Partial<BlogArticleContent>> {
    return {
      title: `[${this.context.locale}] ${content.title}`,
      content: `[${this.context.locale}] ${content.content}`,
      excerpt: content.excerpt ? `[${this.context.locale}] ${content.excerpt}` : undefined,
    };
  }

  async translateNavigation(content: NavigationContent): Promise<NavigationContent> {
    return {
      menuItems: content.menuItems.map(item => ({
        ...item,
        title: `[${this.context.locale}] ${item.title}`,
        items: item.items?.map(sub => ({
          ...sub,
          title: `[${this.context.locale}] ${sub.title}`,
        })),
      })),
      linkTitles: Object.fromEntries(
        Object.entries(content.linkTitles).map(([k, v]) => [k, `[${this.context.locale}] ${v}`])
      ),
    };
  }

  async translateTheme(content: ThemeContent): Promise<ThemeContent> {
    const translateObj = (obj: Record<string, string>) =>
      Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, `[${this.context.locale}] ${v}`]));

    return {
      sectionHeaders: translateObj(content.sectionHeaders),
      buttonLabels: translateObj(content.buttonLabels),
      formLabels: translateObj(content.formLabels),
      placeholders: translateObj(content.placeholders),
      errorMessages: translateObj(content.errorMessages),
      successMessages: translateObj(content.successMessages),
      notifications: translateObj(content.notifications),
    };
  }

  async translateEmail(content: EmailContent): Promise<EmailContent> {
    return {
      subject: `[${this.context.locale}] ${content.subject}`,
      body: `[${this.context.locale}] ${content.body}`,
      previewText: content.previewText ? `[${this.context.locale}] ${content.previewText}` : undefined,
      buttonText: content.buttonText ? `[${this.context.locale}] ${content.buttonText}` : undefined,
      footerText: content.footerText ? `[${this.context.locale}] ${content.footerText}` : undefined,
    };
  }

  async translateCart(content: CartContent): Promise<CartContent> {
    return {
      lineItemProperties: Object.fromEntries(
        Object.entries(content.lineItemProperties).map(([k, v]) => [k, `[${this.context.locale}] ${v}`])
      ),
      giftMessage: content.giftMessage ? `[${this.context.locale}] ${content.giftMessage}` : undefined,
      specialInstructions: content.specialInstructions ? `[${this.context.locale}] ${content.specialInstructions}` : undefined,
    };
  }

  async translateCheckout(content: CheckoutContent): Promise<CheckoutContent> {
    const translateObj = (obj: Record<string, string>) =>
      Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, `[${this.context.locale}] ${v}`]));

    return {
      shippingMethods: translateObj(content.shippingMethods),
      paymentMethods: translateObj(content.paymentMethods),
      billingLabels: translateObj(content.billingLabels),
      termsAndConditions: content.termsAndConditions ? `[${this.context.locale}] ${content.termsAndConditions}` : undefined,
    };
  }

  async translateGiftCard(content: GiftCardContent): Promise<GiftCardContent> {
    return {
      title: `[${this.context.locale}] ${content.title}`,
      description: `[${this.context.locale}] ${content.description}`,
      emailSubject: content.emailSubject ? `[${this.context.locale}] ${content.emailSubject}` : undefined,
      emailBody: content.emailBody ? `[${this.context.locale}] ${content.emailBody}` : undefined,
    };
  }

  async translateDiscount(content: DiscountContent): Promise<DiscountContent> {
    return {
      codeLabel: `[${this.context.locale}] ${content.codeLabel}`,
      description: `[${this.context.locale}] ${content.description}`,
      successMessage: content.successMessage ? `[${this.context.locale}] ${content.successMessage}` : undefined,
      errorMessage: content.errorMessage ? `[${this.context.locale}] ${content.errorMessage}` : undefined,
    };
  }

  async translateCustomer(content: CustomerContent): Promise<CustomerContent> {
    const translateObj = (obj: Record<string, string>) =>
      Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, `[${this.context.locale}] ${v}`]));

    return {
      addressLabels: translateObj(content.addressLabels),
      orderStatusLabels: translateObj(content.orderStatusLabels),
      accountTabLabels: translateObj(content.accountTabLabels),
    };
  }

  async translateSearch(content: SearchContent): Promise<SearchContent> {
    return {
      placeholder: `[${this.context.locale}] ${content.placeholder}`,
      resultsLabel: `[${this.context.locale}] ${content.resultsLabel}`,
      filterLabels: Object.fromEntries(
        Object.entries(content.filterLabels).map(([k, v]) => [k, `[${this.context.locale}] ${v}`])
      ),
    };
  }

  async translateFilter(content: FilterContent): Promise<FilterContent> {
    return {
      availabilityLabels: Object.fromEntries(
        Object.entries(content.availabilityLabels).map(([k, v]) => [k, `[${this.context.locale}] ${v}`])
      ),
      priceRangeLabel: `[${this.context.locale}] ${content.priceRangeLabel}`,
    };
  }

  async translatePagination(content: PaginationContent): Promise<PaginationContent> {
    return {
      previousLabel: `[${this.context.locale}] ${content.previousLabel}`,
      nextLabel: `[${this.context.locale}] ${content.nextLabel}`,
      pageLabel: `[${this.context.locale}] ${content.pageLabel}`,
    };
  }

  async translateBreadcrumb(content: BreadcrumbContent): Promise<BreadcrumbContent> {
    return {
      homeLabel: `[${this.context.locale}] ${content.homeLabel}`,
      separator: content.separator,
    };
  }

  async translateSocial(content: SocialContent): Promise<SocialContent> {
    return {
      shareButtons: Object.fromEntries(
        Object.entries(content.shareButtons).map(([k, v]) => [k, `[${this.context.locale}] ${v}`])
      ),
      linkTitles: Object.fromEntries(
        Object.entries(content.linkTitles).map(([k, v]) => [k, `[${this.context.locale}] ${v}`])
      ),
    };
  }

  async translateFAQ(content: FAQContent): Promise<FAQContent> {
    return {
      questions: content.questions.map(q => ({
        question: `[${this.context.locale}] ${q.question}`,
        answer: `[${this.context.locale}] ${q.answer}`,
      })),
    };
  }

  async translateAnnouncement(content: AnnouncementContent): Promise<AnnouncementContent> {
    return {
      text: `[${this.context.locale}] ${content.text}`,
    };
  }

  async translateNewsletter(content: NewsletterContent): Promise<NewsletterContent> {
    return {
      placeholder: `[${this.context.locale}] ${content.placeholder}`,
      buttonLabel: `[${this.context.locale}] ${content.buttonLabel}`,
      successMessage: `[${this.context.locale}] ${content.successMessage}`,
      privacyText: content.privacyText ? `[${this.context.locale}] ${content.privacyText}` : undefined,
    };
  }

  async translatePopup(content: PopupContent): Promise<PopupContent> {
    return {
      title: `[${this.context.locale}] ${content.title}`,
      content: `[${this.context.locale}] ${content.content}`,
      buttonText: content.buttonText ? `[${this.context.locale}] ${content.buttonText}` : undefined,
      dismissText: content.dismissText ? `[${this.context.locale}] ${content.dismissText}` : undefined,
    };
  }

  async translateSizeChart(content: SizeChartContent): Promise<SizeChartContent> {
    return {
      title: `[${this.context.locale}] ${content.title}`,
      headers: content.headers.map(h => `[${this.context.locale}] ${h}`),
      rows: content.rows,
      notes: content.notes ? `[${this.context.locale}] ${content.notes}` : undefined,
    };
  }
}

export function createContentTranslator(context: TranslationContext): ContentTranslator {
  return new ContentTranslator(context);
}
