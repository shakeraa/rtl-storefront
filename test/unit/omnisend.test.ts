import { describe, it, expect } from 'vitest';
import {
  translateCampaign,
  translateAutomation,
  translateSMS,
  translateSMSMessages,
  getOmnisendTemplates,
  validateMergeTags,
  getSMSCharacterCount,
  translateCampaigns,
  translateAutomations,
  type OmnisendCampaign,
  type OmnisendAutomationWorkflow,
  type OmnisendAutomationEmail,
  type OmnisendSMSMessage,
} from '../../app/services/integrations/omnisend';

describe('Omnisend Integration Service', () => {
  describe('translateCampaign', () => {
    it('should translate campaign subject line to Arabic', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Welcome Campaign',
        subject: 'Welcome to our store!',
        htmlContent: '<div>Hello {{contact.firstName}}!</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.subject).toContain('ar');
      expect(result.targetLocale).toBe('ar');
      expect(result.translatedAt).toBeDefined();
    });

    it('should translate campaign subject line to Hebrew', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Welcome Campaign',
        subject: 'Welcome to our store!',
        htmlContent: '<div>Hello {{contact.firstName}}!</div>',
      };

      const result = await translateCampaign(campaign, 'he');
      expect(result.targetLocale).toBe('he');
      expect(result.translatedAt).toBeDefined();
    });

    it('should preserve merge tags in campaign HTML content', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        htmlContent: '<div>Hello {{contact.firstName}}! Your order {{order.number}} is ready.</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.htmlContent).toContain('{{contact.firstName}}');
      expect(result.htmlContent).toContain('{{order.number}}');
    });

    it('should preserve merge tags in campaign subject line', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello {{contact.firstName}}!',
        htmlContent: '<div>Content</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.subject).toContain('{{contact.firstName}}');
    });

    it('should translate campaign preheader when provided', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        preheader: 'Special discount inside!',
        htmlContent: '<div>Content</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.preheader).toBeDefined();
      expect(result.preheader).not.toBe('Special discount inside!');
    });

    it('should translate campaign text content when provided', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        htmlContent: '<div>Content</div>',
        textContent: 'Welcome to our store! Shop now for discounts.',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.textContent).toBeDefined();
      expect(result.textContent).not.toBe(campaign.textContent);
      expect(result.textContent).toContain('{{');
    });

    it('should translate fromName when provided', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        fromName: 'Support Team',
        htmlContent: '<div>Content</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.fromName).not.toBe('Support Team');
    });

    it('should preserve campaign metadata', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        htmlContent: '<div>Content</div>',
        metadata: { testId: '123', category: 'promotional' },
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.metadata).toEqual({ testId: '123', category: 'promotional' });
    });

    it('should store original language', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        htmlContent: '<div>Content</div>',
        language: 'en',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.originalLanguage).toBe('en');
      expect(result.language).toBe('ar');
    });

    it('should handle campaign without optional fields', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Minimal Campaign',
        subject: 'Hello!',
        htmlContent: '<div>Content</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.campaignId).toBe('camp-1');
      expect(result.name).toBe('Minimal Campaign');
      expect(result.preheader).toBeUndefined();
      expect(result.textContent).toBeUndefined();
    });
  });

  describe('translateAutomation', () => {
    it('should translate automation workflow name', async () => {
      const workflow: OmnisendAutomationWorkflow = {
        workflowId: 'wf-1',
        name: 'Welcome Series',
        triggerType: 'welcome',
        enabled: true,
        emails: [],
      };

      const result = await translateAutomation(workflow, 'ar');
      expect(result.targetLocale).toBe('ar');
      expect(result.translatedAt).toBeDefined();
    });

    it('should translate all emails in workflow', async () => {
      const emails: OmnisendAutomationEmail[] = [
        {
          emailId: 'email-1',
          name: 'Welcome Email 1',
          subject: 'Welcome!',
          htmlContent: '<div>Hello!</div>',
        },
        {
          emailId: 'email-2',
          name: 'Welcome Email 2',
          subject: 'Thanks for joining!',
          htmlContent: '<div>Thanks!</div>',
        },
      ];

      const workflow: OmnisendAutomationWorkflow = {
        workflowId: 'wf-1',
        name: 'Welcome Series',
        triggerType: 'welcome',
        enabled: true,
        emails,
      };

      const result = await translateAutomation(workflow, 'ar');
      expect(result.emails).toHaveLength(2);
      expect(result.emails[0].emailId).toBe('email-1');
      expect(result.emails[1].emailId).toBe('email-2');
    });

    it('should preserve merge tags in automation emails', async () => {
      const emails: OmnisendAutomationEmail[] = [
        {
          emailId: 'email-1',
          name: 'Test Email',
          subject: 'Hello {{contact.firstName}}!',
          htmlContent: '<div>Your cart: {{cart.total}}</div>',
        },
      ];

      const workflow: OmnisendAutomationWorkflow = {
        workflowId: 'wf-1',
        name: 'Test Workflow',
        triggerType: 'abandoned_cart',
        enabled: true,
        emails,
      };

      const result = await translateAutomation(workflow, 'ar');
      expect(result.emails[0].subject).toContain('{{contact.firstName}}');
      expect(result.emails[0].htmlContent).toContain('{{cart.total}}');
    });

    it('should translate SMS messages in workflow', async () => {
      const smsMessages: OmnisendSMSMessage[] = [
        {
          messageId: 'sms-1',
          content: 'Hello {{contact.firstName}}! Your order is ready.',
        },
      ];

      const workflow: OmnisendAutomationWorkflow = {
        workflowId: 'wf-1',
        name: 'Order Workflow',
        triggerType: 'post_purchase',
        enabled: true,
        emails: [],
        smsMessages,
      };

      const result = await translateAutomation(workflow, 'ar');
      expect(result.smsMessages).toHaveLength(1);
      expect(result.smsMessages![0].content).toContain('{{contact.firstName}}');
    });

    it('should handle workflow without SMS messages', async () => {
      const workflow: OmnisendAutomationWorkflow = {
        workflowId: 'wf-1',
        name: 'Email Only Workflow',
        triggerType: 'welcome',
        enabled: true,
        emails: [
          {
            emailId: 'email-1',
            name: 'Welcome',
            subject: 'Welcome!',
            htmlContent: '<div>Hello!</div>',
          },
        ],
      };

      const result = await translateAutomation(workflow, 'ar');
      expect(result.smsMessages).toBeUndefined();
      expect(result.emails).toHaveLength(1);
    });

    it('should preserve delay settings in translated emails', async () => {
      const emails: OmnisendAutomationEmail[] = [
        {
          emailId: 'email-1',
          name: 'Delayed Email',
          subject: 'Follow up',
          htmlContent: '<div>Content</div>',
          delayDays: 1,
          delayHours: 2,
          delayMinutes: 30,
        },
      ];

      const workflow: OmnisendAutomationWorkflow = {
        workflowId: 'wf-1',
        name: 'Delayed Workflow',
        triggerType: 'welcome',
        enabled: true,
        emails,
      };

      const result = await translateAutomation(workflow, 'ar');
      expect(result.emails[0].delayDays).toBe(1);
      expect(result.emails[0].delayHours).toBe(2);
      expect(result.emails[0].delayMinutes).toBe(30);
    });

    it('should handle different trigger types', async () => {
      const triggerTypes: Array<'welcome' | 'abandoned_cart' | 'browse_abandonment' | 'post_purchase' | 'custom'> = [
        'welcome',
        'abandoned_cart',
        'browse_abandonment',
        'post_purchase',
        'custom',
      ];

      for (const triggerType of triggerTypes) {
        const workflow: OmnisendAutomationWorkflow = {
          workflowId: `wf-${triggerType}`,
          name: 'Test Workflow',
          triggerType,
          enabled: true,
          emails: [],
        };

        const result = await translateAutomation(workflow, 'ar');
        expect(result.triggerType).toBe(triggerType);
        expect(result.workflowId).toBe(`wf-${triggerType}`);
      }
    });
  });

  describe('translateSMS', () => {
    it('should translate SMS content to Arabic', async () => {
      const content = 'Hello {{contact.firstName}}! Welcome to our store.';
      
      const result = await translateSMS(content, 'ar');
      expect(result.originalContent).toBe(content);
      expect(result.targetLocale).toBe('ar');
      expect(result.translatedContent).toContain('{{contact.firstName}}');
    });

    it('should translate SMS content to Hebrew', async () => {
      const content = 'Hello {{contact.firstName}}! Welcome to our store.';
      
      const result = await translateSMS(content, 'he');
      expect(result.targetLocale).toBe('he');
    });

    it('should preserve merge tags in SMS content', async () => {
      const content = 'Hi {{contact.firstName}}! Order {{order.number}} is ready. Track: {{order.trackingUrl}}';
      
      const result = await translateSMS(content, 'ar');
      expect(result.translatedContent).toContain('{{contact.firstName}}');
      expect(result.translatedContent).toContain('{{order.number}}');
      expect(result.translatedContent).toContain('{{order.trackingUrl}}');
    });

    it('should calculate character count correctly', async () => {
      const content = 'Hello {{contact.firstName}}!';
      
      const result = await translateSMS(content, 'ar');
      expect(result.characterCount).toBeGreaterThan(0);
      expect(result.segmentCount).toBeGreaterThanOrEqual(1);
    });

    it('should handle Unicode (Arabic) character counts', async () => {
      const content = 'مرحبا {{contact.firstName}}!';
      
      const result = await translateSMS(content, 'ar');
      expect(result.characterCount).toBeGreaterThan(0);
      expect(result.segmentCount).toBeGreaterThanOrEqual(1);
    });

    it('should generate unique message IDs', async () => {
      const content = 'Test message';
      
      const result1 = await translateSMS(content, 'ar');
      const result2 = await translateSMS(content, 'ar');
      
      expect(result1.messageId).not.toBe(result2.messageId);
    });

    it('should include translated timestamp', async () => {
      const content = 'Test message';
      
      const result = await translateSMS(content, 'ar');
      expect(result.translatedAt).toBeDefined();
      expect(new Date(result.translatedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('translateSMSMessages', () => {
    it('should translate multiple SMS messages', async () => {
      const messages = [
        'Hello {{contact.firstName}}!',
        'Your order {{order.number}} is ready.',
        'Thanks for shopping with us!',
      ];

      const results = await translateSMSMessages(messages, 'ar');
      expect(results).toHaveLength(3);
      expect(results[0].originalContent).toBe(messages[0]);
      expect(results[1].originalContent).toBe(messages[1]);
      expect(results[2].originalContent).toBe(messages[2]);
    });

    it('should preserve merge tags in all messages', async () => {
      const messages = [
        'Hello {{contact.firstName}}!',
        'Order {{order.number}} - Total {{order.total}}',
      ];

      const results = await translateSMSMessages(messages, 'ar');
      expect(results[0].translatedContent).toContain('{{contact.firstName}}');
      expect(results[1].translatedContent).toContain('{{order.number}}');
      expect(results[1].translatedContent).toContain('{{order.total}}');
    });
  });

  describe('getOmnisendTemplates', () => {
    it('should return templates for Arabic locale', async () => {
      const templates = await getOmnisendTemplates('ar');
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.language === 'ar')).toBe(true);
    });

    it('should return templates for Hebrew locale', async () => {
      const templates = await getOmnisendTemplates('he');
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.language === 'he')).toBe(true);
    });

    it('should return templates for English locale', async () => {
      const templates = await getOmnisendTemplates('en');
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.language === 'en')).toBe(true);
    });

    it('should include welcome email templates', async () => {
      const templates = await getOmnisendTemplates('ar');
      const welcomeTemplates = templates.filter(t => t.category === 'welcome');
      expect(welcomeTemplates.length).toBeGreaterThanOrEqual(1);
    });

    it('should include abandoned cart templates', async () => {
      const templates = await getOmnisendTemplates('ar');
      const cartTemplates = templates.filter(t => t.category === 'abandoned_cart');
      expect(cartTemplates.length).toBeGreaterThanOrEqual(1);
    });

    it('should include SMS templates', async () => {
      const templates = await getOmnisendTemplates('ar');
      const smsTemplates = templates.filter(t => t.type === 'sms');
      expect(smsTemplates.length).toBeGreaterThanOrEqual(1);
    });

    it('should include email templates', async () => {
      const templates = await getOmnisendTemplates('ar');
      const emailTemplates = templates.filter(t => t.type === 'email');
      expect(emailTemplates.length).toBeGreaterThanOrEqual(1);
    });

    it('should include transactional templates', async () => {
      const templates = await getOmnisendTemplates('ar');
      const transactionalTemplates = templates.filter(t => t.category === 'transactional');
      expect(transactionalTemplates.length).toBeGreaterThanOrEqual(1);
    });

    it('should have RTL direction for Arabic templates', async () => {
      const templates = await getOmnisendTemplates('ar');
      const emailTemplates = templates.filter(t => t.type === 'email');
      
      for (const template of emailTemplates) {
        if (template.htmlContent) {
          expect(template.htmlContent).toContain('dir="rtl"');
          expect(template.htmlContent).toContain('lang="ar"');
        }
      }
    });

    it('should have RTL direction for Hebrew templates', async () => {
      const templates = await getOmnisendTemplates('he');
      const emailTemplates = templates.filter(t => t.type === 'email');
      
      for (const template of emailTemplates) {
        if (template.htmlContent) {
          expect(template.htmlContent).toContain('dir="rtl"');
          expect(template.htmlContent).toContain('lang="he"');
        }
      }
    });

    it('should have templates with merge tags', async () => {
      const templates = await getOmnisendTemplates('ar');
      
      for (const template of templates) {
        const content = template.htmlContent || template.textContent || template.smsContent || '';
        expect(content).toContain('{{');
        expect(content).toContain('}}');
      }
    });
  });

  describe('validateMergeTags', () => {
    it('should validate correct merge tags', () => {
      const content = 'Hello {{contact.firstName}}! Your order {{order.number}} is ready.';
      
      const result = validateMergeTags(content);
      expect(result.valid).toBe(true);
      expect(result.invalidTags).toHaveLength(0);
    });

    it('should detect invalid merge tags', () => {
      const content = 'Hello {{invalid.tag}}! {{not.valid}}';
      
      const result = validateMergeTags(content);
      expect(result.valid).toBe(false);
      expect(result.invalidTags.length).toBeGreaterThan(0);
    });

    it('should handle content without merge tags', () => {
      const content = 'Hello World! No merge tags here.';
      
      const result = validateMergeTags(content);
      expect(result.valid).toBe(true);
      expect(result.invalidTags).toHaveLength(0);
    });

    it('should warn about double spaces in tags', () => {
      const content = 'Hello {{contact.firstName  }}!';
      
      const result = validateMergeTags(content);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate various Omnisend merge tag formats', () => {
      const content = `
        {{contact.firstName}} {{contact.lastName}}
        {{order.total}} {{order.currency}}
        {{cart.abandonedUrl}}
        {{shop.name}} {{shop.url}}
        {{unsubscribeUrl}}
        {{coupon.code}} {{discount.amount}}
      `;
      
      const result = validateMergeTags(content);
      expect(result.valid).toBe(true);
    });
  });

  describe('getSMSCharacterCount', () => {
    it('should calculate GSM-7 character count for English', () => {
      const content = 'Hello World! This is a test message.';
      
      const result = getSMSCharacterCount(content);
      expect(result.characterCount).toBe(content.length);
      expect(result.isUnicode).toBe(false);
      expect(result.charsPerSegment).toBe(160);
    });

    it('should calculate Unicode character count for Arabic', () => {
      const content = 'مرحبا بك في متجرنا!';
      
      const result = getSMSCharacterCount(content);
      expect(result.isUnicode).toBe(true);
      expect(result.charsPerSegment).toBe(70);
    });

    it('should calculate Unicode character count for Hebrew', () => {
      const content = 'שלום! ברוכים הבאים.';
      
      const result = getSMSCharacterCount(content);
      expect(result.isUnicode).toBe(true);
      expect(result.charsPerSegment).toBe(70);
    });

    it('should calculate segment count for long messages', () => {
      const content = 'A'.repeat(200);
      
      const result = getSMSCharacterCount(content);
      expect(result.segmentCount).toBe(2);
    });

    it('should calculate segment count for long Unicode messages', () => {
      const content = 'مرحبا '.repeat(20);
      
      const result = getSMSCharacterCount(content);
      expect(result.isUnicode).toBe(true);
      expect(result.segmentCount).toBeGreaterThan(1);
    });

    it('should handle empty content', () => {
      const content = '';
      
      const result = getSMSCharacterCount(content);
      expect(result.characterCount).toBe(0);
      expect(result.segmentCount).toBe(0);
    });
  });

  describe('translateCampaigns', () => {
    it('should translate multiple campaigns', async () => {
      const campaigns: OmnisendCampaign[] = [
        {
          campaignId: 'camp-1',
          name: 'Campaign 1',
          subject: 'Subject 1',
          htmlContent: '<div>Content 1</div>',
        },
        {
          campaignId: 'camp-2',
          name: 'Campaign 2',
          subject: 'Subject 2',
          htmlContent: '<div>Content 2</div>',
        },
      ];

      const results = await translateCampaigns(campaigns, 'ar');
      expect(results).toHaveLength(2);
      expect(results[0].campaignId).toBe('camp-1');
      expect(results[1].campaignId).toBe('camp-2');
      expect(results[0].targetLocale).toBe('ar');
      expect(results[1].targetLocale).toBe('ar');
    });

    it('should handle empty campaigns array', async () => {
      const campaigns: OmnisendCampaign[] = [];

      const results = await translateCampaigns(campaigns, 'ar');
      expect(results).toHaveLength(0);
    });
  });

  describe('translateAutomations', () => {
    it('should translate multiple automation workflows', async () => {
      const workflows: OmnisendAutomationWorkflow[] = [
        {
          workflowId: 'wf-1',
          name: 'Workflow 1',
          triggerType: 'welcome',
          enabled: true,
          emails: [],
        },
        {
          workflowId: 'wf-2',
          name: 'Workflow 2',
          triggerType: 'abandoned_cart',
          enabled: true,
          emails: [],
        },
      ];

      const results = await translateAutomations(workflows, 'ar');
      expect(results).toHaveLength(2);
      expect(results[0].workflowId).toBe('wf-1');
      expect(results[1].workflowId).toBe('wf-2');
    });

    it('should handle empty workflows array', async () => {
      const workflows: OmnisendAutomationWorkflow[] = [];

      const results = await translateAutomations(workflows, 'ar');
      expect(results).toHaveLength(0);
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    it('should handle HTML with nested elements', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        htmlContent: '<div><p>Welcome <strong>{{contact.firstName}}</strong>!</p><span>Shop now</span></div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.htmlContent).toContain('{{contact.firstName}}');
      expect(result.htmlContent).toContain('<strong>');
      expect(result.htmlContent).toContain('</strong>');
    });

    it('should handle conditional merge tags', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Hello!',
        htmlContent: '<div>{{#if contact.firstName}}Hello {{contact.firstName}}!{{else}}Hello there!{{/if}}</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.htmlContent).toContain('{{#if contact.firstName}}');
      expect(result.htmlContent).toContain('{{else}}');
      expect(result.htmlContent).toContain('{{/if}}');
    });

    it('should handle loop merge tags', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Your Order',
        htmlContent: '<div>{{#each order.items}}{{product.name}} - {{product.price}}{{/each}}</div>',
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.htmlContent).toContain('{{#each order.items}}');
      expect(result.htmlContent).toContain('{{/each}}');
      expect(result.htmlContent).toContain('{{product.name}}');
    });

    it('should handle campaign with all fields populated', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-full',
        name: 'Full Campaign',
        subject: 'Welcome {{contact.firstName}}!',
        preheader: 'Special offer inside!',
        htmlContent: '<div>Hello {{contact.firstName}}! <a href="{{shop.url}}">Shop now</a></div>',
        textContent: 'Hello {{contact.firstName}}! Visit {{shop.url}}',
        fromName: 'The {{shop.name}} Team',
        fromEmail: 'hello@example.com',
        replyTo: 'support@example.com',
        language: 'en',
        status: 'draft',
        metadata: { campaignType: 'welcome', priority: 'high' },
      };

      const result = await translateCampaign(campaign, 'ar');
      expect(result.subject).toContain('{{contact.firstName}}');
      expect(result.htmlContent).toContain('{{shop.url}}');
      expect(result.textContent).toContain('{{shop.url}}');
      expect(result.fromName).toContain('{{shop.name}}');
      expect(result.fromEmail).toBe('hello@example.com');
      expect(result.replyTo).toBe('support@example.com');
      expect(result.status).toBe('draft');
      expect(result.metadata).toEqual({ campaignType: 'welcome', priority: 'high' });
    });

    it('should handle unsupported locales gracefully', async () => {
      const campaign: OmnisendCampaign = {
        campaignId: 'camp-1',
        name: 'Test Campaign',
        subject: 'Welcome!',
        htmlContent: '<div>Hello!</div>',
      };

      const result = await translateCampaign(campaign, 'fr');
      expect(result.targetLocale).toBe('fr');
      expect(result.subject).toContain('[fr]');
    });
  });
});
