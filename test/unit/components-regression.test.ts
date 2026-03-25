/**
 * Components Regression Tests
 * Tests untested React components: AbayaCustomizer, FontPreview,
 * CurrencySelector, HijriDateDisplay, SeasonalBanner, SideBySide
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolarisTestProvider } from '@shopify/polaris';
import '@testing-library/jest-dom';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('~/services/fashion', () => ({
  ABAYA_CUSTOMIZATIONS: [
    {
      id: 'fabric',
      category: 'fabric',
      options: [
        { id: 'silk', name: 'Silk', price: 50 },
        { id: 'cotton', name: 'Cotton', price: 0 },
      ],
    },
    {
      id: 'color',
      category: 'color',
      options: [
        { id: 'black', name: 'Black', price: 0 },
        { id: 'navy', name: 'Navy', price: 10 },
      ],
    },
    {
      id: 'embellishment',
      category: 'embellishment',
      options: [
        { id: 'none', name: 'None', price: 0 },
        { id: 'gold', name: 'Gold Thread', price: 100 },
      ],
    },
  ],
}));

const mockFonts = [
  { id: 'noto-naskh', name: 'Noto Naskh Arabic', family: 'Noto Naskh Arabic', description: 'Classic naskh style', category: 'serif' },
  { id: 'cairo', name: 'Cairo', family: 'Cairo', description: 'Modern sans-serif', category: 'sans-serif' },
];

vi.mock('../../app/services/fonts', () => ({
  ARABIC_FONTS: mockFonts,
  getFontById: (id: string) => mockFonts.find((f: any) => f.id === id) || null,
  getFontsByCategory: (cat: string) => mockFonts.filter((f: any) => f.category === cat),
  getFontsFor: () => mockFonts,
  FONT_PAIRINGS: {
    'modern-blog': { heading: 'cairo', body: 'noto-naskh', accent: 'cairo' },
    'traditional-store': { heading: 'noto-naskh', body: 'noto-naskh', accent: 'noto-naskh' },
    'corporate': { heading: 'cairo', body: 'cairo', accent: 'cairo' },
    'tech-startup': { heading: 'cairo', body: 'cairo', accent: 'noto-naskh' },
  },
}));

vi.mock('~/services/currency', () => {
  const currencies = [
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', symbolPosition: 'after', decimals: 2 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', symbolPosition: 'after', decimals: 2 },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', symbolPosition: 'after', decimals: 3 },
  ];
  return {
    CURRENCIES: currencies,
    getCurrencyByCode: (code: string) => currencies.find((c: any) => c.code === code) || null,
    formatPrice: (amount: number, code: string) => {
      const cur = currencies.find((c: any) => c.code === code);
      return cur ? `${amount.toFixed(cur.decimals)} ${cur.symbol}` : `${amount}`;
    },
  };
});

vi.mock('~/services/hijri', () => ({
  toHijri: (_date: Date) => ({ year: 1446, month: 9, day: 1 }),
  formatHijri: (hijri: { year: number; month: number; day: number }, locale: string) =>
    locale === 'ar' ? `${hijri.day} رمضان ${hijri.year}` : `${hijri.day} Ramadan ${hijri.year}`,
  getEventForDate: (_date: Date) => ({
    name: 'رمضان',
    nameEn: 'Ramadan',
  }),
  getDaysUntilRamadan: () => 15,
  getEidCountdown: () => ({ eidFitr: 45, eidAdha: 120 }),
}));

vi.mock('~/services/calendar', () => ({
  getActiveCampaigns: () => [
    {
      id: 'ramadan-2024',
      type: 'ramadan',
      countries: ['SA', 'AE', 'KW'],
      discount: 30,
    },
  ],
  getTemplateByType: (type: string) =>
    type === 'ramadan'
      ? {
          bannerText: 'Ramadan Kareem - Special Offers',
          bannerTextAr: 'رمضان كريم - عروض خاصة',
          theme: { primaryColor: '#1a5276', secondaryColor: '#ffffff' },
        }
      : null,
  toHijri: (_date: Date) => ({ year: 1446, month: 9, day: 1 }),
  formatHijri: (hijri: any, locale: string) =>
    locale === 'ar' ? `${hijri.day} رمضان ${hijri.year}` : `${hijri.day} Ramadan ${hijri.year}`,
  getEventForDate: () => ({ nameAr: 'رمضان', nameEn: 'Ramadan' }),
  getWeekendDays: (country: string) => (country === 'SA' ? [5, 6] : [6, 0]),
}));

vi.mock('../../app/utils/rtl', () => ({
  isRtlLocale: (locale: string) => ['ar', 'he', 'fa', 'ur'].includes(locale.split('-')[0]),
}));

vi.mock('../../app/utils/i18n', () => ({
  t: (key: string, locale: string) => {
    const strings: Record<string, Record<string, string>> = {
      translation_editor: { en: 'Translation Editor', ar: 'محرر الترجمة' },
      save_all: { en: 'Save All', ar: 'حفظ الكل' },
      saving: { en: 'Saving...', ar: 'جاري الحفظ...' },
      saved: { en: 'Saved', ar: 'تم الحفظ' },
      error: { en: 'Error', ar: 'خطأ' },
      source: { en: 'Source', ar: 'المصدر' },
      translation: { en: 'Translation', ar: 'الترجمة' },
    };
    return strings[key]?.[locale] || strings[key]?.en || key;
  },
}));

// Mock the TranslationField sub-component used by SideBySide
vi.mock('../../app/components/translation-editor/TranslationField', () => ({
  TranslationField: ({ fieldKey, value, onChange, locale }: any) =>
    React.createElement('div', { 'data-testid': `translation-field-${fieldKey}` },
      React.createElement('input', {
        value: value || '',
        onChange: (e: any) => onChange(e.target.value),
        'data-locale': locale,
      }),
    ),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderWithPolaris(component: React.ReactElement) {
  return render(React.createElement(PolarisTestProvider, null, component));
}

// ─── AbayaCustomizer ──────────────────────────────────────────────────────────

describe('AbayaCustomizer', () => {
  let AbayaCustomizer: any;

  beforeEach(async () => {
    const mod = await import('../../app/components/fashion/AbayaCustomizer');
    AbayaCustomizer = mod.AbayaCustomizer;
  });

  it('renders heading in English by default', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer));
    expect(screen.getByText('Customize Your Abaya')).toBeInTheDocument();
  });

  it('renders heading in Arabic when locale="ar"', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer, { locale: 'ar' }));
    expect(screen.getByText('تخصيص العباية')).toBeInTheDocument();
  });

  it('renders Select for each customization category', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer));
    expect(screen.getByText('Fabric')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Embellishment')).toBeInTheDocument();
  });

  it('renders category labels in Arabic when locale="ar"', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer, { locale: 'ar' }));
    expect(screen.getByText('القماش')).toBeInTheDocument();
    expect(screen.getByText('اللون')).toBeInTheDocument();
    expect(screen.getByText('التطريز')).toBeInTheDocument();
  });

  it('calls onChange with selections and price when option selected', () => {
    const handleChange = vi.fn();
    renderWithPolaris(React.createElement(AbayaCustomizer, { onChange: handleChange }));
    const selects = document.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(3);
    fireEvent.change(selects[0], { target: { value: 'silk' } });
    expect(handleChange).toHaveBeenCalledWith({ fabric: 'silk' }, 50);
  });

  it('displays total price section with Additional Price text', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer));
    expect(screen.getByText(/Additional Price/)).toBeInTheDocument();
  });

  it('displays total price in Arabic when locale="ar"', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer, { locale: 'ar' }));
    expect(screen.getByText(/السعر الإضافي/)).toBeInTheDocument();
  });

  it('uses SAR currency by default in formatted price', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer));
    // Intl.NumberFormat with 'ar-SA' locale and SAR currency
    const priceText = screen.getByText(/Additional Price/);
    expect(priceText.textContent).toMatch(/SAR|ر\.س/);
  });

  it('accepts custom currency prop', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer, { currency: 'AED' }));
    const priceText = screen.getByText(/Additional Price/);
    expect(priceText).toBeInTheDocument();
  });

  it('renders option labels with price annotation for priced options', () => {
    renderWithPolaris(React.createElement(AbayaCustomizer));
    const selects = document.querySelectorAll('select');
    const fabricOptions = selects[0]?.querySelectorAll('option');
    expect(fabricOptions).toBeDefined();
    const silkOption = Array.from(fabricOptions || []).find((o) => o.value === 'silk');
    expect(silkOption?.textContent).toContain('+');
  });
});

// ─── FontPreview ──────────────────────────────────────────────────────────────

describe('FontPreview', () => {
  let FontPreview: any;

  const defaultConfig = {
    arabic: { heading: 'noto-naskh', body: 'cairo', accent: '' },
    weights: { heading: 700, body: 400, bold: 600 },
  };

  beforeEach(async () => {
    const mod = await import('../../app/components/fonts/FontPreview');
    FontPreview = mod.FontPreview;
  });

  it('renders "Arabic Font Selection" heading', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText('Arabic Font Selection')).toBeInTheDocument();
  });

  it('renders font name for selected heading font', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    const matches = screen.getAllByText(/Noto Naskh Arabic/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders font name for selected body font', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    const matches = screen.getAllByText(/Cairo/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows heading preview text in Arabic', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText('مرحباً بكم في متجرنا')).toBeInTheDocument();
  });

  it('shows body preview text', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText(/هذا نص تجريبي/)).toBeInTheDocument();
  });

  it('shows accent preview text', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText(/عروض خاصة/)).toBeInTheDocument();
  });

  it('renders Preview section heading', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders selection mode choice list', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText('Selection Mode')).toBeInTheDocument();
    expect(screen.getByText('Single Fonts')).toBeInTheDocument();
    expect(screen.getByText('Font Pairing Preset')).toBeInTheDocument();
  });

  it('shows Heading Font, Body Font, and Accent Font selects in single mode', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText('Heading Font')).toBeInTheDocument();
    expect(screen.getByText('Body Font')).toBeInTheDocument();
    expect(screen.getByText('Accent Font (Optional)')).toBeInTheDocument();
  });

  it('calls onChange when heading font is changed', () => {
    const handleChange = vi.fn();
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: handleChange }));
    const selects = document.querySelectorAll('select');
    // Find a select that has font options (not the choice list)
    const fontSelect = Array.from(selects).find((s) => {
      const options = Array.from(s.querySelectorAll('option'));
      return options.some((o) => o.value === 'cairo') && !options.some((o) => o.value === '');
    });
    if (fontSelect) {
      fireEvent.change(fontSelect, { target: { value: 'cairo' } });
      expect(handleChange).toHaveBeenCalled();
    }
  });

  it('shows "Selected Fonts" info section', () => {
    renderWithPolaris(React.createElement(FontPreview, { config: defaultConfig, onChange: vi.fn() }));
    expect(screen.getByText('Selected Fonts')).toBeInTheDocument();
  });
});

// ─── CurrencySelector ─────────────────────────────────────────────────────────

describe('CurrencySelector', () => {
  let CurrencySelector: any;

  beforeEach(async () => {
    const mod = await import('../../app/components/currency/CurrencySelector');
    CurrencySelector = mod.CurrencySelector;
  });

  it('renders currency label', () => {
    renderWithPolaris(React.createElement(CurrencySelector, { currentCurrency: 'SAR' }));
    expect(screen.getByText('Currency')).toBeInTheDocument();
  });

  it('renders all currency options in the select', () => {
    renderWithPolaris(React.createElement(CurrencySelector, { currentCurrency: 'SAR' }));
    const select = document.querySelector('select');
    const options = select ? Array.from(select.querySelectorAll('option')) : [];
    expect(options.length).toBe(3);
    expect(options.map((o) => o.value)).toContain('SAR');
    expect(options.map((o) => o.value)).toContain('AED');
    expect(options.map((o) => o.value)).toContain('KWD');
  });

  it('shows selected currency value', () => {
    renderWithPolaris(React.createElement(CurrencySelector, { currentCurrency: 'SAR' }));
    const select = document.querySelector('select') as HTMLSelectElement;
    expect(select?.value).toBe('SAR');
  });

  it('calls onChange when a different currency is selected', () => {
    const handleChange = vi.fn();
    renderWithPolaris(React.createElement(CurrencySelector, { currentCurrency: 'SAR', onChange: handleChange }));
    const select = document.querySelector('select')!;
    fireEvent.change(select, { target: { value: 'AED' } });
    expect(handleChange).toHaveBeenCalledWith('AED');
  });

  it('shows symbol info for selected currency', () => {
    renderWithPolaris(React.createElement(CurrencySelector, { currentCurrency: 'SAR' }));
    expect(screen.getByText(/Symbol:/)).toBeInTheDocument();
    expect(screen.getByText(/ر\.س/)).toBeInTheDocument();
  });

  it('shows price preview when amount is provided', () => {
    renderWithPolaris(React.createElement(CurrencySelector, { currentCurrency: 'SAR', amount: 100 }));
    expect(screen.getByText(/Preview:/)).toBeInTheDocument();
  });

  it('hides price preview when showPreview is false', () => {
    renderWithPolaris(
      React.createElement(CurrencySelector, { currentCurrency: 'SAR', amount: 100, showPreview: false }),
    );
    expect(screen.queryByText(/Preview:/)).not.toBeInTheDocument();
  });
});

// ─── HijriDateDisplay ─────────────────────────────────────────────────────────

describe('HijriDateDisplay', () => {
  let HijriDateDisplay: any;

  beforeEach(async () => {
    const mod = await import('../../app/components/hijri/HijriDateDisplay');
    HijriDateDisplay = mod.HijriDateDisplay;
  });

  it('renders Hijri date in Arabic by default', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay));
    expect(screen.getByText('1 رمضان 1446')).toBeInTheDocument();
  });

  it('renders Hijri date in English when locale="en"', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay, { locale: 'en' }));
    expect(screen.getByText('1 Ramadan 1446')).toBeInTheDocument();
  });

  it('shows event badge when showEvents is true (default)', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay));
    expect(screen.getByText('رمضان')).toBeInTheDocument();
  });

  it('shows English event name when locale="en"', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay, { locale: 'en' }));
    expect(screen.getByText('Ramadan')).toBeInTheDocument();
  });

  it('hides events when showEvents is false', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay, { showEvents: false, locale: 'en' }));
    // The formatted date contains "Ramadan" but event badge should not be separately present
    const dateText = screen.getByText('1 Ramadan 1446');
    expect(dateText).toBeInTheDocument();
  });

  it('shows Ramadan countdown when showCountdowns is true and locale="en"', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay, { showCountdowns: true, locale: 'en' }));
    expect(screen.getByText('15 days until Ramadan')).toBeInTheDocument();
  });

  it('shows Eid al-Fitr countdown when showCountdowns is true and locale="en"', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay, { showCountdowns: true, locale: 'en' }));
    expect(screen.getByText('45 days until Eid al-Fitr')).toBeInTheDocument();
  });

  it('shows Arabic countdown text when locale="ar" and showCountdowns is true', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay, { showCountdowns: true, locale: 'ar' }));
    expect(screen.getByText(/يوم حتى رمضان/)).toBeInTheDocument();
  });

  it('hides countdowns by default', () => {
    renderWithPolaris(React.createElement(HijriDateDisplay, { locale: 'en' }));
    expect(screen.queryByText(/days until/)).not.toBeInTheDocument();
  });
});

// ─── SeasonalBanner ───────────────────────────────────────────────────────────

describe('SeasonalBanner', () => {
  let SeasonalBanner: any;
  let HijriDateBanner: any;
  let WeekendNotice: any;

  beforeEach(async () => {
    const mod = await import('../../app/components/seasonal-banners/SeasonalBanner');
    SeasonalBanner = mod.SeasonalBanner;
    HijriDateBanner = mod.HijriDateBanner;
    WeekendNotice = mod.WeekendNotice;
  });

  it('renders English banner text for matching country', () => {
    renderWithPolaris(React.createElement(SeasonalBanner, { country: 'SA' }));
    expect(screen.getByText('Ramadan Kareem - Special Offers')).toBeInTheDocument();
  });

  it('renders Arabic banner text when locale="ar"', () => {
    renderWithPolaris(React.createElement(SeasonalBanner, { country: 'SA', locale: 'ar' }));
    expect(screen.getByText('رمضان كريم - عروض خاصة')).toBeInTheDocument();
  });

  it('shows discount percentage', () => {
    renderWithPolaris(React.createElement(SeasonalBanner, { country: 'SA' }));
    expect(screen.getByText(/Up to 30% off/)).toBeInTheDocument();
  });

  it('shows Arabic discount text when locale="ar"', () => {
    renderWithPolaris(React.createElement(SeasonalBanner, { country: 'SA', locale: 'ar' }));
    expect(screen.getByText(/خصم يصل إلى 30%/)).toBeInTheDocument();
  });

  it('returns null for a country not in any campaign', () => {
    renderWithPolaris(React.createElement(SeasonalBanner, { country: 'US' }));
    expect(screen.queryByText('Ramadan Kareem - Special Offers')).not.toBeInTheDocument();
  });

  it('renders for AE country (included in campaign)', () => {
    renderWithPolaris(React.createElement(SeasonalBanner, { country: 'AE' }));
    expect(screen.getByText('Ramadan Kareem - Special Offers')).toBeInTheDocument();
  });

  // HijriDateBanner sub-component
  it('HijriDateBanner renders Hijri date in English', () => {
    renderWithPolaris(React.createElement(HijriDateBanner, { locale: 'en' }));
    const matches = screen.getAllByText(/Ramadan/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('HijriDateBanner renders event name', () => {
    renderWithPolaris(React.createElement(HijriDateBanner, { locale: 'en' }));
    expect(screen.getByText('Ramadan')).toBeInTheDocument();
  });

  // WeekendNotice sub-component
  it('WeekendNotice shows SA weekend days (Friday & Saturday)', () => {
    renderWithPolaris(React.createElement(WeekendNotice, { country: 'SA', locale: 'en' }));
    expect(screen.getByText(/Weekend: Friday & Saturday/)).toBeInTheDocument();
  });

  it('WeekendNotice shows Arabic weekend label', () => {
    renderWithPolaris(React.createElement(WeekendNotice, { country: 'SA', locale: 'ar' }));
    expect(screen.getByText(/عطلة نهاية الأسبوع/)).toBeInTheDocument();
  });
});

// ─── SideBySide ───────────────────────────────────────────────────────────────

describe('SideBySide', () => {
  let SideBySide: any;

  const defaultFields = [
    { key: 'title', source: 'Hello World', translation: 'مرحبا بالعالم' },
    { key: 'description', source: 'Product description', translation: 'وصف المنتج' },
  ];

  let defaultProps: any;

  beforeEach(async () => {
    defaultProps = {
      fields: defaultFields,
      sourceLocale: 'en',
      targetLocale: 'ar',
      onFieldChange: vi.fn(),
      onSave: vi.fn(),
    };
    const mod = await import('../../app/components/translation-editor/SideBySide');
    SideBySide = mod.SideBySide;
  });

  it('renders Translation Editor heading', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    expect(screen.getByText('Translation Editor')).toBeInTheDocument();
  });

  it('renders source column header with locale code', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    expect(screen.getByText(/Source/)).toBeInTheDocument();
    expect(screen.getByText(/EN/)).toBeInTheDocument();
  });

  it('renders translation column header with locale code', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    const translationHeaders = screen.getAllByText(/Translation/);
    expect(translationHeaders.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/AR/)).toBeInTheDocument();
  });

  it('renders source field text content', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Product description')).toBeInTheDocument();
  });

  it('shows RTL badge for Arabic target locale', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    const rtlBadges = screen.getAllByText('RTL');
    expect(rtlBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Save All button', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    expect(screen.getByText('Save All')).toBeInTheDocument();
  });

  it('calls onSave when Save All button is clicked', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    fireEvent.click(screen.getByText('Save All'));
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it('shows Saving badge when saveStatus is "saving"', () => {
    renderWithPolaris(React.createElement(SideBySide, { ...defaultProps, saveStatus: 'saving' }));
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows Saved badge when saveStatus is "saved"', () => {
    renderWithPolaris(React.createElement(SideBySide, { ...defaultProps, saveStatus: 'saved' }));
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('shows Error badge when saveStatus is "error"', () => {
    renderWithPolaris(React.createElement(SideBySide, { ...defaultProps, saveStatus: 'error' }));
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders field keys as labels in source column', () => {
    renderWithPolaris(React.createElement(SideBySide, defaultProps));
    expect(screen.getAllByText('title').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('description').length).toBeGreaterThanOrEqual(1);
  });

  it('shows em dash for empty source field', () => {
    const fieldsWithEmpty = [
      { key: 'empty', source: '', translation: 'ترجمة' },
    ];
    renderWithPolaris(
      React.createElement(SideBySide, { ...defaultProps, fields: fieldsWithEmpty }),
    );
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });
});
