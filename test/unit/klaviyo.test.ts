import { describe, it, expect } from 'vitest';
import {
  detectKlaviyoVariables,
  translateTemplate,
  applyRTLEmailFormatting,
  validateRTLEmail,
  getKlaviyoTemplate,
  generateRTLEmailCSS,
  isRTLLocale,
  batchTranslateTemplates,
  extractTranslatableSegments,
  validateKlaviyoSyntax,
  getSubjectSuggestions,
  RTL_LOCALES,
  type KlaviyoTemplateType,
  type SupportedLocale,
} from '../../app/services/integrations/klaviyo';

describe('Klaviyo Email Templates Integration', () => {
  describe('Variable Detection', () => {
    it('should detect simple variables', () => {
      const template = 'Hello {{person.first_name}}!';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(1);
      expect(variables[0].raw).toBe('{{person.first_name}}');
      expect(variables[0].type).toBe('variable');
      expect(variables[0].name).toBe('person');
      expect(variables[0].property).toBe('first_name');
    });

    it('should detect variables with filters', () => {
      const template = '{{event.order_date|date:"F j, Y"}}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(1);
      expect(variables[0].raw).toBe('{{event.order_date|date:"F j, Y"}}');
      expect(variables[0].filters).toContain('date:"F j, Y"');
    });

    it('should detect multiple variables', () => {
      const template = 'Hi {{person.first_name}}, your order {{event.order_id}} is ready';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(2);
      expect(variables[0].name).toBe('person');
      expect(variables[1].name).toBe('event');
    });

    it('should detect control flow tags', () => {
      const template = '{% for item in event.items %}{{item.name}}{% endfor %}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables.some(v => v.type === 'tag')).toBe(true);
      expect(variables.some(v => v.raw === '{% for item in event.items %}')).toBe(true);
      expect(variables.some(v => v.raw === '{% endfor %}')).toBe(true);
    });

    it('should detect unsubscribe tag', () => {
      const template = '<p>{% unsubscribe %}</p>';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(1);
      expect(variables[0].type).toBe('tag');
      expect(variables[0].name).toBe('unsubscribe');
    });

    it('should detect web view tag', () => {
      const template = '{% web_view %}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(1);
      expect(variables[0].name).toBe('web_view');
    });

    it('should detect conditional tags', () => {
      const template = '{% if person.first_name %}Hello{% endif %}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables.filter(v => v.type === 'tag')).toHaveLength(2);
    });

    it('should detect comments', () => {
      const template = '{# This is a comment #}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(1);
      expect(variables[0].type).toBe('comment');
    });

    it('should handle variables with whitespace', () => {
      const template = '{{ person.first_name }}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(1);
      expect(variables[0].name).toBe('person');
    });

    it('should handle empty templates', () => {
      const variables = detectKlaviyoVariables('');
      expect(variables).toHaveLength(0);
    });

    it('should handle templates without variables', () => {
      const template = 'Hello World, this is plain text';
      const variables = detectKlaviyoVariables(template);
      expect(variables).toHaveLength(0);
    });
  });

  describe('Template Translation', () => {
    it('should preserve variables during translation', () => {
      const template = 'Welcome {{person.first_name}} to our store!';
      const result = translateTemplate(template, 'ar');
      
      expect(result).toContain('{{person.first_name}}');
      expect(result).toContain('مرحباً');
    });

    it('should translate text while preserving all variables', () => {
      const template = 'Hello {{person.first_name}}, your order {{event.order_id}} has shipped';
      const result = translateTemplate(template, 'ar');
      
      expect(result).toContain('{{person.first_name}}');
      expect(result).toContain('{{event.order_id}}');
      expect(result).toContain('مرحباً');
    });

    it('should handle nested template structures', () => {
      const template = '{% for item in cart.items %}{{item.name}}{% endfor %}';
      const result = translateTemplate(template, 'ar');
      
      expect(result).toContain('{% for item in cart.items %}');
      expect(result).toContain('{{item.name}}');
      expect(result).toContain('{% endfor %}');
    });

    it('should support custom dictionary', () => {
      const template = 'Custom Brand Message';
      const result = translateTemplate(template, 'ar', {
        customDictionary: { 'Custom Brand Message': 'رسالة العلامة التجارية المخصصة' }
      });
      
      expect(result).toBe('رسالة العلامة التجارية المخصصة');
    });

    it('should preserve URLs when preserveUrls is true', () => {
      const template = 'Visit us at https://example.com';
      const result = translateTemplate(template, 'ar', { preserveUrls: true });
      
      expect(result).toContain('https://example.com');
    });

    it('should handle Hebrew translation', () => {
      const template = 'Welcome {{person.first_name}}!';
      const result = translateTemplate(template, 'he');
      
      expect(result).toContain('{{person.first_name}}');
      expect(result).toContain('ברוך הבא');
    });

    it('should handle Persian translation', () => {
      const template = 'Welcome to our store';
      const result = translateTemplate(template, 'fa');
      
      expect(result).toContain('خوش آمدید');
    });

    it('should handle Urdu translation', () => {
      const template = 'Welcome';
      const result = translateTemplate(template, 'ur');
      
      expect(result).toBe('خوش آمدید');
    });

    it('should return original for English', () => {
      const template = 'Welcome {{person.first_name}}!';
      const result = translateTemplate(template, 'en');
      
      expect(result).toBe(template);
    });

    it('should handle mixed content with HTML', () => {
      const template = '<h1>Welcome</h1><p>Hello {{person.first_name}}</p>';
      const result = translateTemplate(template, 'ar');
      
      expect(result).toContain('{{person.first_name}}');
      expect(result).toContain('<h1>');
      expect(result).toContain('<p>');
    });

    it('should handle templates with filters and default values', () => {
      const template = 'Hi {{person.first_name|default:"there"}}';
      const result = translateTemplate(template, 'ar');
      
      expect(result).toContain('{{person.first_name|default:"there"}}');
      expect(result).toContain('مرحباً');
    });
  });

  describe('RTL Email Formatting', () => {
    it('should generate RTL CSS', () => {
      const css = generateRTLEmailCSS();
      
      expect(css).toContain('direction: rtl');
      expect(css).toContain('text-align: right');
      expect(css).toContain('.rtl-container');
    });

    it('should apply RTL formatting for Arabic', () => {
      const html = '<body><div>Hello</div></body>';
      const result = applyRTLEmailFormatting(html, 'ar');
      
      expect(result).toContain('dir="rtl"');
      expect(result).toContain('direction: rtl');
    });

    it('should apply RTL formatting for Hebrew', () => {
      const html = '<body><div>Hello</div></body>';
      const result = applyRTLEmailFormatting(html, 'he');
      
      expect(result).toContain('dir="rtl"');
    });

    it('should not modify content for LTR locales', () => {
      const html = '<body><div>Hello</div></body>';
      const result = applyRTLEmailFormatting(html, 'en');
      
      expect(result).toBe(html);
    });

    it('should handle Persian RTL formatting', () => {
      const html = '<body><div>Hello</div></body>';
      const result = applyRTLEmailFormatting(html, 'fa');
      
      expect(result).toContain('dir="rtl"');
    });

    it('should handle Urdu RTL formatting', () => {
      const html = '<body><div>Hello</div></body>';
      const result = applyRTLEmailFormatting(html, 'ur');
      
      expect(result).toContain('dir="rtl"');
    });

    it('should add style tag when missing', () => {
      const html = '<body><div>Hello</div></body>';
      const result = applyRTLEmailFormatting(html, 'ar');
      
      expect(result).toContain('<style>');
      expect(result).toContain('</style>');
    });

    it('should not double-wrap already RTL content', () => {
      const html = '<body><div class="rtl-container">Hello</div></body>';
      const result = applyRTLEmailFormatting(html, 'ar');
      
      // Should still have rtl-container
      expect(result).toContain('rtl-container');
    });
  });

  describe('RTL Validation', () => {
    it('should validate RTL email with proper attributes', () => {
      const html = '<body dir="rtl" style="direction: rtl"><p>{% unsubscribe %}</p></body>';
      const result = validateRTLEmail(html);
      
      expect(result.valid).toBe(true);
    });

    it('should warn about missing RTL direction', () => {
      const html = '<body><p>{% unsubscribe %}</p></body>';
      const result = validateRTLEmail(html);
      
      expect(result.warnings.some(w => w.includes('RTL direction'))).toBe(true);
    });

    it('should warn about missing charset', () => {
      const html = '<body dir="rtl">{% unsubscribe %}</body>';
      const result = validateRTLEmail(html);
      
      expect(result.warnings.some(w => w.includes('charset'))).toBe(true);
    });

    it('should detect LTR alignment in RTL email', () => {
      const html = '<body dir="rtl"><p style="text-align: left">{% unsubscribe %}</p></body>';
      const result = validateRTLEmail(html);
      
      expect(result.warnings.some(w => w.includes('text-align: left'))).toBe(true);
    });

    it('should warn about missing unsubscribe', () => {
      const html = '<body dir="rtl">Hello</body>';
      const result = validateRTLEmail(html);
      
      expect(result.warnings.some(w => w.includes('unsubscribe'))).toBe(true);
    });

    it('should suggest adding web view link', () => {
      const html = '<body dir="rtl">{% unsubscribe %}</body>';
      const result = validateRTLEmail(html);
      
      expect(result.suggestions.some(s => s.includes('web_view'))).toBe(true);
    });

    it('should detect broken variable syntax', () => {
      const html = '<body>{{{broken}</body>';
      const result = validateRTLEmail(html);
      
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.valid).toBe(false);
    });

    it('should warn about images without alt text', () => {
      const html = '<body dir="rtl">{% unsubscribe %}<img src="logo.png"></body>';
      const result = validateRTLEmail(html);
      
      expect(result.warnings.some(w => w.includes('alt text'))).toBe(true);
    });

    it('should warn about missing variables', () => {
      const html = '<body dir="rtl">No variables here</body>';
      const result = validateRTLEmail(html);
      
      expect(result.warnings.some(w => w.includes('No Klaviyo template variables'))).toBe(true);
    });
  });

  describe('Template Generation', () => {
    it('should generate welcome template', () => {
      const template = getKlaviyoTemplate('welcome', 'en');
      
      expect(template.type).toBe('welcome');
      expect(template.subject).toContain('Welcome');
      expect(template.html).toContain('{{organization.name}}');
    });

    it('should generate abandoned cart template', () => {
      const template = getKlaviyoTemplate('abandoned_cart', 'en');
      
      expect(template.type).toBe('abandoned_cart');
      expect(template.subject).toContain('left something');
      expect(template.html).toContain('{% unsubscribe %}');
    });

    it('should generate order confirmation template', () => {
      const template = getKlaviyoTemplate('order_confirm', 'en');
      
      expect(template.type).toBe('order_confirm');
      expect(template.html).toContain('{% for item in event.items %}');
    });

    it('should generate shipping template', () => {
      const template = getKlaviyoTemplate('shipping', 'en');
      
      expect(template.type).toBe('shipping');
      expect(template.subject).toContain('shipped');
    });

    it('should translate template for Arabic locale', () => {
      const template = getKlaviyoTemplate('welcome', 'ar');
      
      expect(template.locale).toBe('ar');
      expect(template.html).toContain('dir="rtl"');
      expect(template.html).toContain('مرحباً');
    });

    it('should translate template for Hebrew locale', () => {
      const template = getKlaviyoTemplate('welcome', 'he');
      
      expect(template.locale).toBe('he');
      expect(template.html).toContain('dir="rtl"');
    });

    it('should preserve all Klaviyo variables in generated templates', () => {
      const template = getKlaviyoTemplate('order_confirm', 'ar');
      const variables = detectKlaviyoVariables(template.html);
      
      const hasOrderId = variables.some(v => v.raw.includes('event.order_id'));
      const hasItemsLoop = variables.some(v => v.raw.includes('for item in event.items'));
      
      expect(hasOrderId).toBe(true);
      expect(hasItemsLoop).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should identify RTL locales correctly', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('fa')).toBe(true);
      expect(isRTLLocale('ur')).toBe(true);
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('fr')).toBe(false);
    });

    it('should list all RTL locales', () => {
      expect(RTL_LOCALES).toContain('ar');
      expect(RTL_LOCALES).toContain('he');
      expect(RTL_LOCALES).toContain('fa');
      expect(RTL_LOCALES).toContain('ur');
      expect(RTL_LOCALES).toHaveLength(4);
    });

    it('should batch translate templates', () => {
      const templates = [
        { template: 'Welcome', locale: 'ar' as SupportedLocale },
        { template: 'Hello', locale: 'he' as SupportedLocale },
      ];
      
      const results = batchTranslateTemplates(templates);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toContain('مرحباً');
      expect(results[1]).toContain('שלום');
    });

    it('should extract translatable segments', () => {
      const template = 'Hello {{person.name}} welcome';
      const segments = extractTranslatableSegments(template);
      
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.some(s => s.type === 'variable')).toBe(true);
      expect(segments.some(s => s.type === 'text')).toBe(true);
    });

    it('should validate Klaviyo syntax', () => {
      const valid = validateKlaviyoSyntax('{{variable}}');
      expect(valid.valid).toBe(true);
      
      const invalid = validateKlaviyoSyntax('{{variable');
      expect(invalid.valid).toBe(false);
      expect(invalid.errors.length).toBeGreaterThan(0);
    });

    it('should detect mismatched tags', () => {
      const result = validateKlaviyoSyntax('{{open}} no close');
      expect(result.errors.some(e => e.includes('Mismatched'))).toBe(true);
    });

    it('should provide subject suggestions', () => {
      const suggestions = getSubjectSuggestions('welcome', 'ar');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('{{organization.name}}');
    });

    it('should provide suggestions for all template types', () => {
      const types: KlaviyoTemplateType[] = ['welcome', 'abandoned_cart', 'order_confirm', 'shipping'];
      
      types.forEach(type => {
        const suggestions = getSubjectSuggestions(type, 'ar');
        expect(suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should fallback to English suggestions if locale not found', () => {
      const suggestions = getSubjectSuggestions('welcome', 'fr');
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should handle complex variable filters', () => {
      const template = '{{event.date|date:"Y-m-d"|upper}}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables[0].filters).toContain('date:"Y-m-d"');
      expect(variables[0].filters).toContain('upper');
    });

    it('should handle default values in variables', () => {
      const template = '{{person.first_name|default:"Customer"}}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables[0].raw).toBe('{{person.first_name|default:"Customer"}}');
    });

    it('should validate templates with proper for loops', () => {
      const template = '{% for item in items %}{{item}}{% endfor %}';
      const result = validateKlaviyoSyntax(template);
      
      expect(result.valid).toBe(true);
    });

    it('should detect unclosed for loops', () => {
      const template = '{% for item in items %}{{item}}';
      const result = validateKlaviyoSyntax(template);
      
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle organization variables', () => {
      const template = '{{organization.name}} - {{organization.email}}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(2);
      expect(variables.every(v => v.name === 'organization')).toBe(true);
    });

    it('should handle event variables', () => {
      const template = '{{event.order_id}} {{event.total_price}}';
      const variables = detectKlaviyoVariables(template);
      
      expect(variables).toHaveLength(2);
      expect(variables.every(v => v.name === 'event')).toBe(true);
    });

    it('should maintain template structure after translation', () => {
      const template = '<table><tr><td>{{person.name}}</td></tr></table>';
      const result = translateTemplate(template, 'ar');
      
      expect(result).toContain('<table>');
      expect(result).toContain('<tr>');
      expect(result).toContain('<td>');
      expect(result).toContain('{{person.name}}');
    });

    it('should handle inline styles in templates', () => {
      const template = '<p style="color: red;">Hello {{person.name}}</p>';
      const result = translateTemplate(template, 'ar');
      
      expect(result).toContain('style="color: red;"');
      expect(result).toContain('{{person.name}}');
    });

    it('should generate templates with all required metadata', () => {
      const template = getKlaviyoTemplate('order_confirm', 'en');
      
      expect(template.subject).toBeDefined();
      expect(template.preheader).toBeDefined();
      expect(template.html).toBeDefined();
      expect(template.type).toBeDefined();
      expect(template.locale).toBeDefined();
    });
  });
});
