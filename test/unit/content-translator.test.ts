import { describe, it, expect } from 'vitest';
import { ContentTranslator, createContentTranslator } from '../../app/services/content-translator';

const mockContext = {
  shopId: 'test-shop',
  locale: 'ar',
  sourceLocale: 'en',
};

describe('Content Translator', () => {
  const translator = new ContentTranslator(mockContext);

  describe('Product Translation', () => {
    it('translates product content', async () => {
      const content = {
        title: 'Test Product',
        description: 'A test product description',
        vendor: 'Test Vendor',
        productType: 'Electronics',
        tags: ['new', 'featured'],
        variants: [],
        options: [],
      };

      const result = await translator.translateProduct(content);
      expect(result.title).toContain('[ar]');
      expect(result.description).toContain('[ar]');
      expect(result.productType).toContain('[ar]');
    });
  });

  describe('Collection Translation', () => {
    it('translates collection content', async () => {
      const content = {
        title: 'Summer Collection',
        description: 'Best summer items',
        seoTitle: 'Summer 2024',
        seoDescription: 'Shop summer collection',
      };

      const result = await translator.translateCollection(content);
      expect(result.title).toContain('[ar]');
      expect(result.seoTitle).toContain('[ar]');
    });
  });

  describe('Page Translation', () => {
    it('translates page content', async () => {
      const content = {
        title: 'About Us',
        content: 'Welcome to our store',
        seoTitle: 'About Our Company',
        seoDescription: 'Learn about us',
      };

      const result = await translator.translatePage(content);
      expect(result.title).toContain('[ar]');
      expect(result.content).toContain('[ar]');
    });
  });

  describe('Blog Article Translation', () => {
    it('translates blog article', async () => {
      const content = {
        title: 'How to Style Your Home',
        content: 'Home styling tips...',
        excerpt: 'Quick tips',
      };

      const result = await translator.translateBlogArticle(content);
      expect(result.title).toContain('[ar]');
      expect(result.excerpt).toContain('[ar]');
    });
  });

  describe('Navigation Translation', () => {
    it('translates navigation menu', async () => {
      const content = {
        menuItems: [{ title: 'Home', url: '/', items: [{ title: 'Submenu', url: '/sub' }] }],
        linkTitles: { home: 'Home Page' },
      };

      const result = await translator.translateNavigation(content);
      expect(result.menuItems[0].title).toContain('[ar]');
      expect(result.menuItems[0].items?.[0].title).toContain('[ar]');
    });
  });

  describe('Theme Translation', () => {
    it('translates theme content', async () => {
      const content = {
        sectionHeaders: { header1: 'Welcome' },
        buttonLabels: { submit: 'Submit' },
        formLabels: { name: 'Name' },
        placeholders: { email: 'Enter email' },
        errorMessages: { required: 'Required' },
        successMessages: { saved: 'Saved' },
        notifications: { welcome: 'Welcome' },
      };

      const result = await translator.translateTheme(content);
      expect(result.buttonLabels.submit).toContain('[ar]');
      expect(result.formLabels.name).toContain('[ar]');
    });
  });

  describe('Email Translation', () => {
    it('translates email content', async () => {
      const content = {
        subject: 'Order Confirmation',
        body: 'Thank you for your order',
        previewText: 'Your order is confirmed',
        buttonText: 'View Order',
        footerText: 'Contact us',
      };

      const result = await translator.translateEmail(content);
      expect(result.subject).toContain('[ar]');
      expect(result.buttonText).toContain('[ar]');
    });
  });

  describe('Cart Translation', () => {
    it('translates cart content', async () => {
      const content = {
        lineItemProperties: { color: 'Blue', size: 'Large' },
        giftMessage: 'Happy Birthday!',
        specialInstructions: 'Handle with care',
      };

      const result = await translator.translateCart(content);
      expect(result.lineItemProperties.color).toContain('[ar]');
      expect(result.giftMessage).toContain('[ar]');
    });
  });

  describe('Checkout Translation', () => {
    it('translates checkout content', async () => {
      const content = {
        shippingMethods: { standard: 'Standard Shipping' },
        paymentMethods: { card: 'Credit Card' },
        billingLabels: { address: 'Billing Address' },
        termsAndConditions: 'Terms text',
      };

      const result = await translator.translateCheckout(content);
      expect(result.shippingMethods.standard).toContain('[ar]');
      expect(result.termsAndConditions).toContain('[ar]');
    });
  });

  describe('Gift Card Translation', () => {
    it('translates gift card content', async () => {
      const content = {
        title: 'Gift Card',
        description: 'Perfect gift',
        emailSubject: 'Your Gift Card',
        emailBody: 'Enjoy your gift',
      };

      const result = await translator.translateGiftCard(content);
      expect(result.title).toContain('[ar]');
      expect(result.emailSubject).toContain('[ar]');
    });
  });

  describe('Discount Translation', () => {
    it('translates discount content', async () => {
      const content = {
        codeLabel: 'Discount Code',
        description: '20% off',
        successMessage: 'Applied!',
        errorMessage: 'Invalid code',
      };

      const result = await translator.translateDiscount(content);
      expect(result.codeLabel).toContain('[ar]');
    });
  });

  describe('Customer Translation', () => {
    it('translates customer content', async () => {
      const content = {
        addressLabels: { street: 'Street' },
        orderStatusLabels: { pending: 'Pending' },
        accountTabLabels: { orders: 'Orders' },
      };

      const result = await translator.translateCustomer(content);
      expect(result.addressLabels.street).toContain('[ar]');
    });
  });

  describe('Search Translation', () => {
    it('translates search content', async () => {
      const content = {
        placeholder: 'Search products',
        resultsLabel: 'Results',
        filterLabels: { price: 'Price' },
      };

      const result = await translator.translateSearch(content);
      expect(result.placeholder).toContain('[ar]');
    });
  });

  describe('Filter Translation', () => {
    it('translates filter content', async () => {
      const content = {
        availabilityLabels: { inStock: 'In Stock' },
        priceRangeLabel: 'Price Range',
      };

      const result = await translator.translateFilter(content);
      expect(result.priceRangeLabel).toContain('[ar]');
    });
  });

  describe('Pagination Translation', () => {
    it('translates pagination content', async () => {
      const content = {
        previousLabel: 'Previous',
        nextLabel: 'Next',
        pageLabel: 'Page',
      };

      const result = await translator.translatePagination(content);
      expect(result.previousLabel).toContain('[ar]');
    });
  });

  describe('Breadcrumb Translation', () => {
    it('translates breadcrumb content', async () => {
      const content = {
        homeLabel: 'Home',
        separator: '>',
      };

      const result = await translator.translateBreadcrumb(content);
      expect(result.homeLabel).toContain('[ar]');
      expect(result.separator).toBe('>');
    });
  });

  describe('Social Translation', () => {
    it('translates social content', async () => {
      const content = {
        shareButtons: { facebook: 'Share' },
        linkTitles: { instagram: 'Instagram' },
      };

      const result = await translator.translateSocial(content);
      expect(result.shareButtons.facebook).toContain('[ar]');
    });
  });

  describe('FAQ Translation', () => {
    it('translates FAQ content', async () => {
      const content = {
        questions: [{ question: 'What is this?', answer: 'This is...' }],
      };

      const result = await translator.translateFAQ(content);
      expect(result.questions[0].question).toContain('[ar]');
    });
  });

  describe('Announcement Translation', () => {
    it('translates announcement', async () => {
      const content = { text: 'Sale starts now!' };
      const result = await translator.translateAnnouncement(content);
      expect(result.text).toContain('[ar]');
    });
  });

  describe('Newsletter Translation', () => {
    it('translates newsletter content', async () => {
      const content = {
        placeholder: 'Enter email',
        buttonLabel: 'Subscribe',
        successMessage: 'Subscribed!',
        privacyText: 'We respect privacy',
      };

      const result = await translator.translateNewsletter(content);
      expect(result.buttonLabel).toContain('[ar]');
    });
  });

  describe('Popup Translation', () => {
    it('translates popup content', async () => {
      const content = {
        title: 'Special Offer',
        content: 'Get 20% off',
        buttonText: 'Shop Now',
        dismissText: 'No thanks',
      };

      const result = await translator.translatePopup(content);
      expect(result.title).toContain('[ar]');
    });
  });

  describe('Size Chart Translation', () => {
    it('translates size chart', async () => {
      const content = {
        title: 'Size Chart',
        headers: ['Size', 'Chest'],
        rows: [['S', '36']],
        notes: 'Measurements in inches',
      };

      const result = await translator.translateSizeChart(content);
      expect(result.title).toContain('[ar]');
      expect(result.headers[0]).toContain('[ar]');
    });
  });

  describe('Factory Function', () => {
    it('creates translator with factory', () => {
      const t = createContentTranslator(mockContext);
      expect(t).toBeInstanceOf(ContentTranslator);
    });
  });
});
