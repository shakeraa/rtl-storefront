import { describe, it, expect } from 'vitest';
import {
  extractKlaviyoVariables,
  extractKlaviyoTags,
  protectKlaviyoSyntax,
  restoreKlaviyoSyntax,
  applyRTLEmailFormatting,
  validateRTLEmail,
  translateKlaviyoTemplate,
  getKlaviyoTemplate,
  hasKlaviyoVariables,
  getSupportedTemplateTypes,
} from '../../app/services/integrations/klaviyo';

describe('Klaviyo Integration - T0201', () => {
  describe('Variable Extraction', () => {
    it('should extract simple variables', () => {
      const template = 'Hello {{person.first_name}}!';
      const vars = extractKlaviyoVariables(template);
      expect(vars).toHaveLength(1);
      expect(vars[0].name).toBe('first_name');
      expect(vars[0].type).toBe('person');
    });

    it('should extract multiple variables', () => {
      const template = '{{person.first_name}} {{person.last_name}} - {{event.order_id}}';
      const vars = extractKlaviyoVariables(template);
      expect(vars).toHaveLength(3);
    });

    it('should extract organization variables', () => {
      const template = '{{organization.name}}';
      const vars = extractKlaviyoVariables(template);
      expect(vars[0].type).toBe('organization');
    });

    it('should handle variables with whitespace', () => {
      const template = '{{  person.first_name  }}';
      const vars = extractKlaviyoVariables(template);
      expect(vars).toHaveLength(1);
      expect(vars[0].name).toBe('first_name');
    });

    it('should deduplicate variables', () => {
      const template = '{{person.first_name}} and {{person.first_name}}';
      const vars = extractKlaviyoVariables(template);
      expect(vars).toHaveLength(1);
    });
  });

  describe('Tag Extraction', () => {
    it('should extract if tags', () => {
      const template = '{% if person.first_name %}Hello{% endif %}';
      const tags = extractKlaviyoTags(template);
      expect(tags.length).toBeGreaterThanOrEqual(1);
      expect(tags[0].type).toBe('if');
    });

    it('should extract unsubscribe tags', () => {
      const template = '{% unsubscribe %}';
      const tags = extractKlaviyoTags(template);
      expect(tags[0].type).toBe('unsubscribe');
    });

    it('should extract multiple tags', () => {
      const template = '{% if x %}{% else %}{% endif %}';
      const tags = extractKlaviyoTags(template);
      expect(tags.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Syntax Protection', () => {
    it('should protect variables with placeholders', () => {
      const template = 'Hello {{person.name}}!';
      const { protectedTemplate, placeholders } = protectKlaviyoSyntax(template);
      expect(protectedTemplate).not.toContain('{{person.name}}');
      expect(protectedTemplate).toContain('__KLAVIYO_VAR_');
      expect(placeholders.size).toBe(1);
    });

    it('should protect tags with placeholders', () => {
      const template = '{% unsubscribe %}';
      const { protectedTemplate, placeholders } = protectKlaviyoSyntax(template);
      expect(protectedTemplate).not.toContain('{% unsubscribe %}');
      expect(protectedTemplate).toContain('__KLAVIYO_TAG_');
    });

    it('should protect comments', () => {
      const template = '{# This is a comment #}';
      const { protectedTemplate } = protectKlaviyoSyntax(template);
      expect(protectedTemplate).toContain('__KLAVIYO_COMMENT_');
    });
  });

  describe('Syntax Restoration', () => {
    it('should restore variables after translation', () => {
      const template = 'Hello {{person.name}}!';
      const { protectedTemplate, placeholders } = protectKlaviyoSyntax(template);
      const translated = protectedTemplate.replace('Hello', 'مرحباً');
      const restored = restoreKlaviyoSyntax(translated, placeholders);
      expect(restored).toContain('{{person.name}}');
      expect(restored).toContain('مرحباً');
    });

    it('should restore multiple variables', () => {
      const template = '{{a}} {{b}}';
      const { protectedTemplate, placeholders } = protectKlaviyoSyntax(template);
      const restored = restoreKlaviyoSyntax(protectedTemplate, placeholders);
      expect(restored).toBe(template);
    });
  });

  describe('RTL Formatting', () => {
    it('should add RTL direction to HTML', () => {
      const html = '<html><body>Test</body></html>';
      const formatted = applyRTLEmailFormatting(html, 'ar');
      expect(formatted).toContain('dir="rtl"');
    });

    it('should add RTL CSS', () => {
      const html = '<html><head></head><body>Test</body></html>';
      const formatted = applyRTLEmailFormatting(html, 'ar');
      expect(formatted).toContain('dir="rtl"');
    });

    it('should not modify non-RTL locales', () => {
      const html = '<html><body>Test</body></html>';
      const formatted = applyRTLEmailFormatting(html, 'en');
      expect(formatted).not.toContain('dir="rtl"');
    });

    it('should handle Hebrew locale', () => {
      const html = '<body>Test</body>';
      const formatted = applyRTLEmailFormatting(html, 'he');
      expect(formatted).toContain('dir="rtl"');
    });
  });

  describe('RTL Validation', () => {
    it('should validate proper RTL content', () => {
      const html = '<body dir="rtl">Test</body>';
      const result = validateRTLEmail(html);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect missing RTL direction', () => {
      const html = '<body>Test</body>';
      const result = validateRTLEmail(html);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Missing RTL direction attribute');
    });

    it('should detect unrestored variables', () => {
      const html = '<body dir="rtl">__KLAVIYO_VAR_0__</body>';
      const result = validateRTLEmail(html);
      expect(result.issues).toContain('Unrestored Klaviyo variables found');
    });
  });

  describe('Template Translation', () => {
    it('should translate to Arabic', () => {
      const template = '<p>Welcome</p>';
      const translated = translateKlaviyoTemplate(template, 'ar');
      expect(translated).toContain('مرحباً بك');
    });

    it('should translate to Hebrew', () => {
      const template = '<p>Welcome</p>';
      const translated = translateKlaviyoTemplate(template, 'he');
      expect(translated).toContain('ברוך הבא');
    });

    it('should preserve Klaviyo variables during translation', () => {
      const template = '<p>Welcome {{person.first_name}}</p>';
      const translated = translateKlaviyoTemplate(template, 'ar');
      expect(translated).toContain('{{person.first_name}}');
      expect(translated).toContain('مرحباً');
    });

    it('should preserve tags during translation', () => {
      const template = '<p>{% unsubscribe %}</p>';
      const translated = translateKlaviyoTemplate(template, 'ar');
      expect(translated).toContain('{% unsubscribe %}');
    });

    it('should apply RTL formatting for Arabic', () => {
      const template = '<html><body>Welcome</body></html>';
      const translated = translateKlaviyoTemplate(template, 'ar');
      expect(translated).toContain('dir="rtl"');
    });

    it('should not apply RTL when disabled', () => {
      const template = '<html><body>Welcome</body></html>';
      const translated = translateKlaviyoTemplate(template, 'ar', { applyRTL: false });
      expect(translated).not.toContain('dir="rtl"');
    });

    it('should handle complex templates', () => {
      const template = `
        <html>
          <body>
            <h1>Welcome {{person.first_name}}</h1>
            <p>Thank you for your order #{{event.order_id}}</p>
            {% if event.discount %}
              <p>You saved {{event.discount}}!</p>
            {% endif %}
          </body>
        </html>
      `;
      const translated = translateKlaviyoTemplate(template, 'ar');
      expect(translated).toContain('{{person.first_name}}');
      expect(translated).toContain('{{event.order_id}}');
      expect(translated).toContain('{% if event.discount %}');
      expect(translated).toContain('dir="rtl"');
    });
  });

  describe('Template Retrieval', () => {
    it('should get welcome template in Arabic', () => {
      const template = getKlaviyoTemplate('welcome', 'ar');
      expect(template.subject).toBe('مرحباً بك');
      expect(template.type).toBe('welcome');
    });

    it('should get abandoned cart template in Hebrew', () => {
      const template = getKlaviyoTemplate('abandoned_cart', 'he');
      expect(template.subject).toBe('עגלת קניות נטושה');
    });

    it('should get order confirmation template', () => {
      const template = getKlaviyoTemplate('order_confirm', 'en');
      expect(template.subject).toBe('Order Confirmation');
    });

    it('should get shipping template', () => {
      const template = getKlaviyoTemplate('shipping', 'en');
      expect(template.subject).toBe('Shipping Notification');
    });

    it('should handle unknown types', () => {
      const template = getKlaviyoTemplate('unknown' as any, 'en');
      expect(template.type).toBe('custom');
    });
  });

  describe('Variable Detection', () => {
    it('should detect Klaviyo variables', () => {
      expect(hasKlaviyoVariables('{{test}}')).toBe(true);
      // Reset regex state
      const result = hasKlaviyoVariables('{{ person.name }}');
      expect(result).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(hasKlaviyoVariables('Hello world')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasKlaviyoVariables('')).toBe(false);
    });
  });

  describe('Supported Template Types', () => {
    it('should return all template types', () => {
      const types = getSupportedTemplateTypes();
      expect(types.length).toBeGreaterThanOrEqual(5);
    });

    it('should include welcome type', () => {
      const types = getSupportedTemplateTypes();
      expect(types.some((t) => t.type === 'welcome')).toBe(true);
    });

    it('should include abandoned cart type', () => {
      const types = getSupportedTemplateTypes();
      expect(types.some((t) => t.type === 'abandoned_cart')).toBe(true);
    });

    it('should have descriptions', () => {
      const types = getSupportedTemplateTypes();
      types.forEach((type) => {
        expect(type.description).toBeDefined();
        expect(type.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Locale Handling', () => {
    it('should handle locale with region code', () => {
      const template = '<p>Welcome</p>';
      const translated = translateKlaviyoTemplate(template, 'ar-SA');
      expect(translated).toContain('مرحباً');
    });

    it('should fallback to English for unknown locale', () => {
      const template = '<p>Welcome</p>';
      const translated = translateKlaviyoTemplate(template, 'fr');
      expect(translated).toContain('Welcome');
    });
  });

  describe('Email Labels', () => {
    it('should translate common labels', () => {
      const template = 'View Order - Track Shipment';
      const translated = translateKlaviyoTemplate(template, 'ar');
      expect(translated).toContain('عرض الطلب');
      expect(translated).toContain('تتبع الشحنة');
    });

    it('should translate footer labels', () => {
      const template = 'Unsubscribe | Privacy Policy | Contact Us';
      const translated = translateKlaviyoTemplate(template, 'he');
      expect(translated).toContain('בטל מנוי');
      expect(translated).toContain('מדיניות פרטיות');
      expect(translated).toContain('צור קשר');
    });
  });
});
