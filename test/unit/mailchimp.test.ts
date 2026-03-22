import { describe, it, expect, beforeEach } from 'vitest';
import {
  translateMailchimpTemplate,
  extractMergeTags,
  restoreMergeTags,
  getMailchimpTemplates,
  saveMailchimpTemplate,
  getMailchimpTemplate,
  getAllMailchimpTemplates,
  getMailchimpTemplatesByType,
  deleteMailchimpTemplate,
  clearMailchimpTemplates,
  translateMailchimpCampaign,
  translateMailchimpAutomationEmail,
  translateMailchimpAutomation,
  isRTLLocale,
  addRTLSupport,
  validateMailchimpTemplate,
  extractConditionalBlocks,
  extractTranslatableSegments,
  getMergeTagDescriptions,
  replaceMergeTagsWithPlaceholders,
  batchTranslateTemplates,
  MAILCHIMP_MERGE_TAG_REGEX,
  MAILCHIMP_MERGE_TAG_WITH_FALLBACK_REGEX,
  RTL_LOCALES,
  type MailchimpTemplate,
  type MailchimpCampaign,
  type MailchimpAutomation,
  type ExtractedMergeTag,
} from '../../app/services/integrations/mailchimp';

describe('Mailchimp Integration Service', () => {
  beforeEach(() => {
    clearMailchimpTemplates();
  });

  describe('Merge Tag Extraction', () => {
    it('should extract simple merge tags from template', () => {
      const template = 'Hello *|FNAME|*, welcome to our store!';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('*|FNAME|*');
      expect(tags[0].name).toBe('FNAME');
      expect(tags[0].fallback).toBeUndefined();
    });

    it('should extract multiple merge tags', () => {
      const template = 'Hello *|FNAME|* *|LNAME|*, your email is *|EMAIL|*';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(3);
      expect(tags.map(t => t.name)).toContain('FNAME');
      expect(tags.map(t => t.name)).toContain('LNAME');
      expect(tags.map(t => t.name)).toContain('EMAIL');
    });

    it('should extract merge tags with fallbacks', () => {
      const template = 'Hello *|FNAME:Guest|*, thanks for visiting!';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(1);
      expect(tags[0].name).toBe('FNAME');
      expect(tags[0].fallback).toBe('Guest');
    });

    it('should extract unsubscribe merge tag', () => {
      const template = '<a href="*|UNSUB|*">Unsubscribe</a>';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('*|UNSUB|*');
    });

    it('should extract update profile merge tag', () => {
      const template = '<a href="*|UPDATE_PROFILE|*">Update Profile</a>';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('*|UPDATE_PROFILE|*');
    });

    it('should extract view in browser merge tag', () => {
      const template = '<a href="*|ARCHIVE|*">View in browser</a>';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('*|ARCHIVE|*');
    });

    it('should extract forward to friend merge tag', () => {
      const template = '<a href="*|FORWARD|*">Forward</a>';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(1);
      expect(tags[0].tag).toBe('*|FORWARD|*');
    });

    it('should extract social share merge tags', () => {
      const template = '<a href="*|TWITTER:FULLURL|*">Tweet</a><a href="*|FACEBOOK:FULLURL|*">Share</a>';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(2);
      expect(tags.some(t => t.name === 'TWITTER')).toBe(true);
      expect(tags.some(t => t.name === 'FACEBOOK')).toBe(true);
    });

    it('should handle duplicate merge tags at different positions', () => {
      const template = '*|FNAME|* and *|FNAME|* again';
      const tags = extractMergeTags(template);
      expect(tags).toHaveLength(2);
      expect(tags[0].tag).toBe('*|FNAME|*');
      expect(tags[1].tag).toBe('*|FNAME|*');
      expect(tags[0].index).not.toBe(tags[1].index);
    });
  });

  describe('Merge Tag Restoration', () => {
    it('should restore merge tags from placeholders', () => {
      const template = 'Hello *|FNAME|*, welcome!';
      const tags = extractMergeTags(template);
      const withPlaceholders = replaceMergeTagsWithPlaceholders(template, tags);
      const restored = restoreMergeTags(withPlaceholders, tags);
      expect(restored).toBe(template);
    });

    it('should restore multiple merge tags', () => {
      const template = '*|FNAME|* *|LNAME|* - *|EMAIL|*';
      const tags = extractMergeTags(template);
      const withPlaceholders = replaceMergeTagsWithPlaceholders(template, tags);
      const restored = restoreMergeTags(withPlaceholders, tags);
      expect(restored).toBe(template);
    });

    it('should restore merge tags with fallbacks', () => {
      const template = 'Hello *|FNAME:Guest|*!';
      const tags = extractMergeTags(template);
      const withPlaceholders = replaceMergeTagsWithPlaceholders(template, tags);
      const restored = restoreMergeTags(withPlaceholders, tags);
      expect(restored).toBe(template);
    });

    it('should generate unique placeholders for each tag', () => {
      const template = '*|FNAME|* and *|LNAME|*';
      const tags = extractMergeTags(template);
      expect(tags[0].placeholder).not.toBe(tags[1].placeholder);
      expect(tags[0].placeholder).toMatch(/__MC_TAG_\d+__/);
    });
  });

  describe('Template Translation', () => {
    it('should translate template while preserving merge tags', async () => {
      const template = 'Hello *|FNAME|*, welcome to our store!';
      const result = await translateMailchimpTemplate(template, 'ar');
      expect(result.original).toBe(template);
      expect(result.translated).toContain('*|FNAME|*');
      expect(result.translated).toContain('[ar]');
      expect(result.locale).toBe('ar');
      expect(result.tagsExtracted).toBe(1);
      expect(result.tagsRestored).toBe(1);
    });

    it('should translate template with multiple merge tags', async () => {
      const template = 'Hello *|FNAME|* *|LNAME|*, your order *|ORDER_ID|* is ready!';
      const result = await translateMailchimpTemplate(template, 'he');
      expect(result.translated).toContain('*|FNAME|*');
      expect(result.translated).toContain('*|LNAME|*');
      expect(result.translated).toContain('*|ORDER_ID|*');
      expect(result.locale).toBe('he');
      expect(result.tagsExtracted).toBe(3);
    });

    it('should handle empty template', async () => {
      const template = '';
      const result = await translateMailchimpTemplate(template, 'ar');
      expect(result.translated).toBe('');
      expect(result.tagsExtracted).toBe(0);
    });

    it('should handle template with no merge tags', async () => {
      const template = 'Hello, welcome to our store!';
      const result = await translateMailchimpTemplate(template, 'ar');
      expect(result.translated).toContain('[ar]');
      expect(result.tagsExtracted).toBe(0);
    });

    it('should mark RTL for Arabic locale', async () => {
      const result = await translateMailchimpTemplate('Hello', 'ar');
      expect(result.rtl).toBe(true);
    });

    it('should mark RTL for Hebrew locale', async () => {
      const result = await translateMailchimpTemplate('Hello', 'he');
      expect(result.rtl).toBe(true);
    });

    it('should not mark RTL for English locale', async () => {
      const result = await translateMailchimpTemplate('Hello', 'en');
      expect(result.rtl).toBe(false);
    });

    it('should preserve conditional blocks during translation', async () => {
      const template = '*|IF:FNAME|*Hello *|FNAME|*!*|END:IF|* Welcome!';
      const result = await translateMailchimpTemplate(template, 'ar');
      expect(result.translated).toContain('*|IF:FNAME|*');
      expect(result.translated).toContain('*|END:IF|*');
      expect(result.translated).toContain('*|FNAME|*');
    });

    it('should preserve list address merge tag', async () => {
      const template = 'Our address: *|LIST:ADDRESS|*';
      const result = await translateMailchimpTemplate(template, 'ar');
      expect(result.translated).toContain('*|LIST:ADDRESS|*');
    });
  });

  describe('RTL Support', () => {
    it('should identify RTL locales correctly', () => {
      expect(isRTLLocale('ar')).toBe(true);
      expect(isRTLLocale('he')).toBe(true);
      expect(isRTLLocale('ur')).toBe(true);
      expect(isRTLLocale('fa')).toBe(true);
    });

    it('should identify LTR locales correctly', () => {
      expect(isRTLLocale('en')).toBe(false);
      expect(isRTLLocale('fr')).toBe(false);
      expect(isRTLLocale('de')).toBe(false);
      expect(isRTLLocale('es')).toBe(false);
    });

    it('should add RTL attributes to HTML template', () => {
      const html = '<html><body>Hello</body></html>';
      const result = addRTLSupport(html, 'ar');
      expect(result).toContain('dir="rtl"');
      expect(result).toContain('lang="ar"');
    });

    it('should add RTL CSS styles', () => {
      const html = '<html><head></head><body>Hello</body></html>';
      const result = addRTLSupport(html, 'ar');
      expect(result).toContain('direction: rtl');
      expect(result).toContain('text-align: right');
    });

    it('should not modify HTML for LTR locale', () => {
      const html = '<html><body>Hello</body></html>';
      const result = addRTLSupport(html, 'en');
      expect(result).toBe(html);
    });
  });

  describe('Template Management', () => {
    it('should save and retrieve a template', () => {
      const template: Omit<MailchimpTemplate, 'createdAt' | 'updatedAt'> = {
        id: 'tpl-1', name: 'Welcome Email', type: 'campaign', content: 'Hello *|FNAME|*!',
        subject: 'Welcome', locale: 'en', rtl: false,
      };
      const saved = saveMailchimpTemplate(template);
      const retrieved = getMailchimpTemplate('tpl-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Welcome Email');
      expect(retrieved?.createdAt).toBeInstanceOf(Date);
      expect(retrieved?.updatedAt).toBeInstanceOf(Date);
    });

    it('should update existing template', () => {
      const template = { id: 'tpl-1', name: 'Welcome Email', type: 'campaign' as const,
        content: 'Hello!', subject: 'Welcome', locale: 'en' as const, rtl: false };
      saveMailchimpTemplate(template);
      const firstSaved = getMailchimpTemplate('tpl-1')!;
      const updated = saveMailchimpTemplate({ ...template, name: 'Updated Welcome' });
      expect(updated.name).toBe('Updated Welcome');
      expect(updated.createdAt).toEqual(firstSaved.createdAt);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(firstSaved.updatedAt.getTime());
    });

    it('should get templates by locale', () => {
      saveMailchimpTemplate({ id: 'tpl-1', name: 'English', type: 'campaign', content: 'Hello',
        subject: 'Welcome', locale: 'en', rtl: false });
      saveMailchimpTemplate({ id: 'tpl-2', name: 'Arabic', type: 'campaign', content: 'مرحبا',
        subject: 'أهلا', locale: 'ar', rtl: true });
      const arabicTemplates = getMailchimpTemplates('ar');
      expect(arabicTemplates).toHaveLength(1);
      expect(arabicTemplates[0].name).toBe('Arabic');
    });

    it('should get templates by type', () => {
      saveMailchimpTemplate({ id: 'tpl-1', name: 'Campaign', type: 'campaign', content: 'Hello',
        subject: 'Welcome', locale: 'en', rtl: false });
      saveMailchimpTemplate({ id: 'tpl-2', name: 'Automation', type: 'automation', content: 'Hello',
        subject: 'Welcome', locale: 'en', rtl: false });
      const automationTemplates = getMailchimpTemplatesByType('automation');
      expect(automationTemplates).toHaveLength(1);
      expect(automationTemplates[0].name).toBe('Automation');
    });

    it('should delete a template', () => {
      saveMailchimpTemplate({ id: 'tpl-1', name: 'To Delete', type: 'campaign', content: 'Hello',
        subject: 'Welcome', locale: 'en', rtl: false });
      const deleted = deleteMailchimpTemplate('tpl-1');
      expect(deleted).toBe(true);
      expect(getMailchimpTemplate('tpl-1')).toBeUndefined();
    });

    it('should return all templates', () => {
      saveMailchimpTemplate({ id: 'tpl-1', name: 'Template 1', type: 'campaign', content: 'Hello',
        subject: 'Welcome', locale: 'en', rtl: false });
      saveMailchimpTemplate({ id: 'tpl-2', name: 'Template 2', type: 'automation', content: 'Hello',
        subject: 'Welcome', locale: 'ar', rtl: true });
      const all = getAllMailchimpTemplates();
      expect(all).toHaveLength(2);
    });
  });

  describe('Campaign Translation', () => {
    it('should translate campaign content and subject', async () => {
      const campaign: MailchimpCampaign = {
        id: 'camp-1', name: 'Welcome', templateId: 'tpl-1', subjectLine: 'Welcome!',
        previewText: 'Thanks', fromName: 'Team', replyTo: 'support@example.com',
        content: '<h1>Hello *|FNAME|*!</h1>', status: 'draft' };
      const result = await translateMailchimpCampaign(campaign, 'ar');
      expect(result.campaign.subjectLine).toContain('[ar]');
      expect(result.campaign.content).toContain('*|FNAME|*');
      expect(result.translation.locale).toBe('ar');
      expect(result.translation.rtl).toBe(true);
    });

    it('should preserve campaign metadata', async () => {
      const campaign: MailchimpCampaign = {
        id: 'camp-1', name: 'Welcome', templateId: 'tpl-1', subjectLine: 'Welcome!',
        previewText: 'Preview', fromName: 'Team', replyTo: 'support@example.com',
        content: 'Hello!', status: 'draft', recipients: { listId: 'list-1', segmentText: 'New' } };
      const result = await translateMailchimpCampaign(campaign, 'ar');
      expect(result.campaign.id).toBe('camp-1');
      expect(result.campaign.name).toBe('Welcome');
      expect(result.campaign.fromName).toBe('Team');
      expect(result.campaign.recipients).toEqual(campaign.recipients);
    });
  });

  describe('Automation Translation', () => {
    it('should translate automation email', async () => {
      const email = { id: 'email-1', name: 'Welcome', subject: 'Welcome!',
        content: '<p>Hello *|FNAME|*!</p>', position: 1, delay: { amount: 1, type: 'day' as const } };
      const result = await translateMailchimpAutomationEmail(email, 'he');
      expect(result.email.subject).toContain('[he]');
      expect(result.email.content).toContain('*|FNAME|*');
      expect(result.email.delay).toEqual({ amount: 1, type: 'day' });
    });

    it('should translate full automation workflow', async () => {
      const automation: MailchimpAutomation = {
        id: 'auto-1', name: 'Welcome Series', status: 'paused',
        emails: [
          { id: 'email-1', name: 'Welcome', subject: 'Welcome!', content: '<p>Hello!</p>', position: 1 },
          { id: 'email-2', name: 'Follow Up', subject: 'Follow up!', content: '<p>Hi!</p>', position: 2,
            delay: { amount: 3, type: 'day' as const } },
        ] };
      const result = await translateMailchimpAutomation(automation, 'ar');
      expect(result.automation.emails).toHaveLength(2);
      expect(result.translations).toHaveLength(2);
      expect(result.automation.name).toBe('Welcome Series');
      expect(result.automation.status).toBe('paused');
    });
  });

  describe('Template Validation', () => {
    it('should validate well-formed template', () => {
      const template = 'Hello *|FNAME|*! <a href="*|UNSUB|*">Unsubscribe</a>';
      const result = validateMailchimpTemplate(template);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unclosed merge tags', () => {
      const template = 'Hello *|FNAME|* and *|UNSUB';
      const result = validateMailchimpTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Unclosed'))).toBe(true);
    });

    it('should detect unclosed conditional blocks', () => {
      const template = '*|IF:FNAME|*Hello*|END:IF|* and *|IF:VIP|*VIP';
      const result = validateMailchimpTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('conditional'))).toBe(true);
    });

    it('should warn about missing unsubscribe link', () => {
      const template = 'Hello *|FNAME|*!';
      const result = validateMailchimpTemplate(template);
      expect(result.warnings.some(w => w.includes('unsubscribe'))).toBe(true);
    });

    it('should warn about images without alt text', () => {
      const template = '<img src="logo.png">';
      const result = validateMailchimpTemplate(template);
      expect(result.warnings.some(w => w.includes('alt text'))).toBe(true);
    });
  });

  describe('Conditional Block Extraction', () => {
    it('should extract conditional blocks', () => {
      const template = '*|IF:FNAME|*Hello *|FNAME|*!*|END:IF|*';
      const blocks = extractConditionalBlocks(template);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].condition).toBe('FNAME');
      expect(blocks[0].block).toContain('*|IF:FNAME|*');
      expect(blocks[0].block).toContain('*|END:IF|*');
    });

    it('should extract multiple conditional blocks', () => {
      const template = '*|IF:FNAME|*Hi*|END:IF|* *|IF:VIP|*VIP*|END:IF|*';
      const blocks = extractConditionalBlocks(template);
      expect(blocks).toHaveLength(2);
    });
  });

  describe('Translatable Segment Extraction', () => {
    it('should extract text content from HTML', () => {
      const html = '<p>Hello World</p><div>Another text</div>';
      const segments = extractTranslatableSegments(html);
      expect(segments.length).toBeGreaterThan(0);
      expect(segments.some(s => s.text === 'Hello World')).toBe(true);
      expect(segments.some(s => s.text === 'Another text')).toBe(true);
    });

    it('should extract alt attributes', () => {
      const html = '<img src="logo.png" alt="Company Logo">';
      const segments = extractTranslatableSegments(html);
      expect(segments.some(s => s.type === 'attribute' && s.text === 'Company Logo')).toBe(true);
    });

    it('should extract title attributes', () => {
      const html = '<a href="/" title="Go Home">Link</a>';
      const segments = extractTranslatableSegments(html);
      expect(segments.some(s => s.context === 'title_attribute')).toBe(true);
    });
  });

  describe('Merge Tag Descriptions', () => {
    it('should return merge tag descriptions', () => {
      const descriptions = getMergeTagDescriptions();
      expect(descriptions.FNAME).toBeDefined();
      expect(descriptions.LNAME).toBeDefined();
      expect(descriptions.EMAIL).toBeDefined();
      expect(descriptions.UNSUB).toBeDefined();
    });
  });

  describe('Batch Translation', () => {
    it('should translate multiple templates', async () => {
      const templates = [
        { id: 'tpl-1', content: 'Hello *|FNAME|*!' },
        { id: 'tpl-2', content: 'Welcome *|LNAME|*!' },
      ];
      const results = await batchTranslateTemplates(templates, 'ar');
      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('tpl-1');
      expect(results[0].result.translated).toContain('[ar]');
      expect(results[0].result.translated).toContain('*|FNAME|*');
      expect(results[1].id).toBe('tpl-2');
      expect(results[1].result.translated).toContain('[ar]');
    });
  });

  describe('Constants', () => {
    it('should export merge tag regex patterns', () => {
      expect(MAILCHIMP_MERGE_TAG_REGEX).toBeDefined();
      expect(MAILCHIMP_MERGE_TAG_WITH_FALLBACK_REGEX).toBeDefined();
    });

    it('should have correct RTL locales', () => {
      expect(RTL_LOCALES).toContain('ar');
      expect(RTL_LOCALES).toContain('he');
      expect(RTL_LOCALES).toContain('ur');
      expect(RTL_LOCALES).toContain('fa');
    });
  });
});
