import { describe, it, expect } from 'vitest';
import {
  translateTicket,
  translateMacro,
  translateResponse,
  getGorgiasTemplates,
  translateTicketsBatch,
  translateMacrosBatch,
  containsVariables,
  extractAllVariables,
  validateVariablePreservation,
  getVariableCategories,
  type GorgiasTicket,
  type GorgiasMacro,
  type GorgiasResponse,
  type GorgiasTemplate,
} from '../../app/services/integrations/gorgias';

describe('Gorgias Integration', () => {
  describe('translateTicket', () => {
    it('should translate ticket subject and comment', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-1',
        subject: 'Order Inquiry',
        comment: 'I have a question about my order',
        status: 'open',
        priority: 'medium',
        channel: 'email',
      };

      const result = await translateTicket(ticket, 'ar');

      expect(result.subject).toContain('[ar]');
      expect(result.comment).toContain('[ar]');
      expect(result.id).toBe('ticket-1');
      expect(result.status).toBe('open');
    });

    it('should preserve ticket variables in subject', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-2',
        subject: 'Order {{order.name}} Issue',
        comment: 'Problem with order',
        status: 'open',
        priority: 'high',
        channel: 'email',
      };

      const result = await translateTicket(ticket, 'ar');

      expect(result.subject).toContain('{{order.name}}');
      expect(result.subject).toContain('[ar]');
    });

    it('should preserve multiple variables in comment', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-3',
        subject: 'Support Request',
        comment: 'Hello {{ticket.requester.name}}, your order {{order.name}} is {{order.status}}',
        status: 'pending',
        priority: 'medium',
        channel: 'chat',
      };

      const result = await translateTicket(ticket, 'ar');

      expect(result.comment).toContain('{{ticket.requester.name}}');
      expect(result.comment).toContain('{{order.name}}');
      expect(result.comment).toContain('{{order.status}}');
    });

    it('should preserve requester variables', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-4',
        subject: 'Help for {{ticket.requester.email}}',
        comment: 'Dear {{ticket.requester.first_name}} {{ticket.requester.last_name}}',
        status: 'open',
        priority: 'low',
        channel: 'email',
      };

      const result = await translateTicket(ticket, 'he');

      expect(result.subject).toContain('{{ticket.requester.email}}');
      expect(result.comment).toContain('{{ticket.requester.first_name}}');
      expect(result.comment).toContain('{{ticket.requester.last_name}}');
    });

    it('should handle ticket with custom fields', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-5',
        subject: 'Custom Issue',
        comment: 'Issue with {{custom_field.product_id}}',
        status: 'open',
        priority: 'urgent',
        channel: 'email',
        customFields: { product_id: '12345' },
      };

      const result = await translateTicket(ticket, 'ar');

      expect(result.comment).toContain('{{custom_field.product_id}}');
      expect(result.customFields).toEqual({ product_id: '12345' });
    });

    it('should handle empty comment', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-6',
        subject: 'Empty Test',
        comment: '',
        status: 'closed',
        priority: 'low',
        channel: 'email',
      };

      const result = await translateTicket(ticket, 'ar');

      expect(result.comment).toBe('[ar] ');
    });

    it('should preserve ticket.id variable', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-7',
        subject: 'Ticket #{{ticket.id}}',
        comment: 'Referencing ticket {{ticket.id}}',
        status: 'open',
        priority: 'medium',
        channel: 'email',
      };

      const result = await translateTicket(ticket, 'ar');

      expect(result.subject).toContain('{{ticket.id}}');
      expect(result.comment).toContain('{{ticket.id}}');
    });

    it('should preserve ticket status and priority variables', async () => {
      const ticket: GorgiasTicket = {
        id: 'ticket-8',
        subject: 'Status: {{ticket.status}}',
        comment: 'Priority is {{ticket.priority}}',
        status: 'snoozed',
        priority: 'high',
        channel: 'email',
      };

      const result = await translateTicket(ticket, 'ar');

      expect(result.subject).toContain('{{ticket.status}}');
      expect(result.comment).toContain('{{ticket.priority}}');
      expect(result.status).toBe('snoozed');
    });
  });

  describe('translateMacro', () => {
    it('should translate macro content and name', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-1',
        name: 'Greeting Template',
        content: 'Hello, how can I help you?',
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.name).toContain('[ar]');
      expect(result.content).toContain('[ar]');
      expect(result.id).toBe('macro-1');
    });

    it('should preserve all variables in macro content', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-2',
        name: 'Order Status',
        content: 'Hi {{customer.name}}, your order {{order.name}} is {{order.status}}.',
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.content).toContain('{{customer.name}}');
      expect(result.content).toContain('{{order.name}}');
      expect(result.content).toContain('{{order.status}}');
    });

    it('should translate macro description', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-3',
        name: 'Refund Template',
        content: 'Your refund is processed',
        description: 'Use this for refund requests',
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.description).toContain('[ar]');
    });

    it('should preserve agent variables in macros', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-4',
        name: 'Closing Template',
        content: 'Best regards, {{agent.name}} from {{shop.name}}',
      };

      const result = await translateMacro(macro, 'he');

      expect(result.content).toContain('{{agent.name}}');
      expect(result.content).toContain('{{shop.name}}');
    });

    it('should preserve shop variables', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-5',
        name: 'Contact Info',
        content: 'Contact us at {{shop.email}} or visit {{shop.domain}}',
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.content).toContain('{{shop.email}}');
      expect(result.content).toContain('{{shop.domain}}');
    });

    it('should handle macro with tags', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-6',
        name: 'Tagged Macro',
        content: 'Content with {{ticket.tags}}',
        tags: ['greeting', 'auto'],
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.content).toContain('{{ticket.tags}}');
      expect(result.tags).toEqual(['greeting', 'auto']);
    });

    it('should handle macros without description', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-7',
        name: 'Simple Macro',
        content: 'Simple content',
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.description).toBeUndefined();
    });

    it('should preserve date variables', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-8',
        name: 'Date Template',
        content: 'Today is {{today}} and now is {{now}}',
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.content).toContain('{{today}}');
      expect(result.content).toContain('{{now}}');
    });

    it('should preserve complex nested variables', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-9',
        name: 'Complex Template',
        content: 'Dear {{ticket.requester.first_name}} {{ticket.requester.last_name}} ({{ticket.requester.email}}), regarding {{ticket.subject}}',
      };

      const result = await translateMacro(macro, 'ar');

      expect(result.content).toContain('{{ticket.requester.first_name}}');
      expect(result.content).toContain('{{ticket.requester.last_name}}');
      expect(result.content).toContain('{{ticket.requester.email}}');
      expect(result.content).toContain('{{ticket.subject}}');
    });
  });

  describe('translateResponse', () => {
    it('should translate response content', async () => {
      const response: GorgiasResponse = {
        id: 'resp-1',
        ticketId: 'ticket-1',
        content: 'Thank you for your patience',
      };

      const result = await translateResponse(response, 'ar');

      expect(result.content).toContain('[ar]');
      expect(result.id).toBe('resp-1');
    });

    it('should preserve variables in response', async () => {
      const response: GorgiasResponse = {
        id: 'resp-2',
        ticketId: 'ticket-1',
        content: 'Hello {{customer.first_name}}, your order {{order.id}} has been shipped',
      };

      const result = await translateResponse(response, 'ar');

      expect(result.content).toContain('{{customer.first_name}}');
      expect(result.content).toContain('{{order.id}}');
    });

    it('should preserve agent name in response', async () => {
      const response: GorgiasResponse = {
        id: 'resp-3',
        ticketId: 'ticket-2',
        content: 'Best, {{agent.name}}',
        agentName: 'John Doe',
      };

      const result = await translateResponse(response, 'ar');

      expect(result.content).toContain('{{agent.name}}');
      expect(result.agentName).toBe('John Doe');
    });

    it('should handle internal responses', async () => {
      const response: GorgiasResponse = {
        id: 'resp-4',
        ticketId: 'ticket-3',
        content: 'Internal note about {{ticket.id}}',
        isInternal: true,
      };

      const result = await translateResponse(response, 'ar');

      expect(result.content).toContain('{{ticket.id}}');
      expect(result.isInternal).toBe(true);
    });

    it('should preserve order total variable', async () => {
      const response: GorgiasResponse = {
        id: 'resp-5',
        ticketId: 'ticket-4',
        content: 'Refund amount: {{order.total}} for order {{order.name}}',
      };

      const result = await translateResponse(response, 'ar');

      expect(result.content).toContain('{{order.total}}');
      expect(result.content).toContain('{{order.name}}');
    });
  });

  describe('getGorgiasTemplates', () => {
    it('should return templates for Arabic locale', () => {
      const templates = getGorgiasTemplates('ar');

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every((t) => t.locale === 'ar')).toBe(true);
    });

    it('should return templates for English locale', () => {
      const templates = getGorgiasTemplates('en');

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every((t) => t.locale === 'en')).toBe(true);
    });

    it('should have greeting template', () => {
      const templates = getGorgiasTemplates('ar');
      const greeting = templates.find((t) => t.id === 'greeting-ar');

      expect(greeting).toBeDefined();
      expect(greeting?.type).toBe('macro');
      expect(greeting?.content).toContain('{{ticket.requester.first_name}}');
    });

    it('should have order inquiry template', () => {
      const templates = getGorgiasTemplates('ar');
      const orderInquiry = templates.find((t) => t.id === 'order-inquiry-ar');

      expect(orderInquiry).toBeDefined();
      expect(orderInquiry?.content).toContain('{{order.name}}');
    });

    it('should have shipping update template', () => {
      const templates = getGorgiasTemplates('ar');
      const shipping = templates.find((t) => t.id === 'shipping-update-ar');

      expect(shipping).toBeDefined();
      expect(shipping?.content).toContain('{{customer.name}}');
      expect(shipping?.content).toContain('{{custom_field.tracking_number}}');
    });

    it('should have signature template', () => {
      const templates = getGorgiasTemplates('ar');
      const signature = templates.find((t) => t.id === 'signature-ar');

      expect(signature).toBeDefined();
      expect(signature?.type).toBe('signature');
      expect(signature?.content).toContain('{{agent.name}}');
      expect(signature?.content).toContain('{{shop.name}}');
    });

    it('should have close ticket template', () => {
      const templates = getGorgiasTemplates('ar');
      const closeTicket = templates.find((t) => t.id === 'close-ticket-ar');

      expect(closeTicket).toBeDefined();
      expect(closeTicket?.content).toContain('{{agent.name}}');
    });

    it('should have refund confirmation template', () => {
      const templates = getGorgiasTemplates('ar');
      const refund = templates.find((t) => t.id === 'refund-confirmation-ar');

      expect(refund).toBeDefined();
      expect(refund?.content).toContain('{{order.name}}');
      expect(refund?.content).toContain('{{order.total}}');
    });

    it('should have escalation template', () => {
      const templates = getGorgiasTemplates('ar');
      const escalation = templates.find((t) => t.id === 'escalation-ar');

      expect(escalation).toBeDefined();
      expect(escalation?.content).toContain('{{ticket.id}}');
      expect(escalation?.content).toContain('{{ticket.priority}}');
    });

    it('should have feedback request template', () => {
      const templates = getGorgiasTemplates('ar');
      const feedback = templates.find((t) => t.id === 'feedback-request-ar');

      expect(feedback).toBeDefined();
      expect(feedback?.content).toContain('{{ticket.id}}');
    });
  });

  describe('translateTicketsBatch', () => {
    it('should translate multiple tickets', async () => {
      const tickets: GorgiasTicket[] = [
        {
          id: 'ticket-1',
          subject: 'Issue 1',
          comment: 'Comment 1',
          status: 'open',
          priority: 'medium',
          channel: 'email',
        },
        {
          id: 'ticket-2',
          subject: 'Issue 2',
          comment: 'Comment 2',
          status: 'closed',
          priority: 'high',
          channel: 'chat',
        },
      ];

      const results = await translateTicketsBatch(tickets, 'ar');

      expect(results).toHaveLength(2);
      expect(results[0].subject).toContain('[ar]');
      expect(results[1].subject).toContain('[ar]');
    });

    it('should preserve variables across batch', async () => {
      const tickets: GorgiasTicket[] = [
        {
          id: 'ticket-1',
          subject: 'Order {{order.name}}',
          comment: 'Help needed',
          status: 'open',
          priority: 'medium',
          channel: 'email',
        },
        {
          id: 'ticket-2',
          subject: 'Refund for {{customer.name}}',
          comment: 'Request',
          status: 'open',
          priority: 'high',
          channel: 'email',
        },
      ];

      const results = await translateTicketsBatch(tickets, 'ar');

      expect(results[0].subject).toContain('{{order.name}}');
      expect(results[1].subject).toContain('{{customer.name}}');
    });

    it('should handle empty batch', async () => {
      const results = await translateTicketsBatch([], 'ar');
      expect(results).toEqual([]);
    });
  });

  describe('translateMacrosBatch', () => {
    it('should translate multiple macros', async () => {
      const macros: GorgiasMacro[] = [
        {
          id: 'macro-1',
          name: 'Greeting',
          content: 'Hello {{customer.name}}',
        },
        {
          id: 'macro-2',
          name: 'Closing',
          content: 'Bye {{customer.name}}',
        },
      ];

      const results = await translateMacrosBatch(macros, 'ar');

      expect(results).toHaveLength(2);
      expect(results[0].content).toContain('[ar]');
      expect(results[1].content).toContain('[ar]');
      expect(results[0].content).toContain('{{customer.name}}');
      expect(results[1].content).toContain('{{customer.name}}');
    });
  });

  describe('containsVariables', () => {
    it('should return true for text with variables', () => {
      expect(containsVariables('Hello {{customer.name}}')).toBe(true);
      expect(containsVariables('Order {{order.id}}')).toBe(true);
    });

    it('should return false for text without variables', () => {
      expect(containsVariables('Hello customer')).toBe(false);
      expect(containsVariables('Plain text')).toBe(false);
    });

    it('should return true for multiple variables', () => {
      expect(containsVariables('{{a}} and {{b}}')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(containsVariables('')).toBe(false);
    });
  });

  describe('extractAllVariables', () => {
    it('should extract single variable', () => {
      const vars = extractAllVariables('Hello {{customer.name}}');
      expect(vars).toEqual(['{{customer.name}}']);
    });

    it('should extract multiple variables', () => {
      const vars = extractAllVariables('{{a}} {{b}} {{c}}');
      expect(vars).toEqual(['{{a}}', '{{b}}', '{{c}}']);
    });

    it('should return unique variables only', () => {
      const vars = extractAllVariables('{{x}} {{x}} {{y}}');
      expect(vars).toEqual(['{{x}}', '{{y}}']);
    });

    it('should return empty array for no variables', () => {
      const vars = extractAllVariables('No variables here');
      expect(vars).toEqual([]);
    });

    it('should extract complex nested variables', () => {
      const vars = extractAllVariables('{{ticket.requester.first_name}} {{shop.domain}}');
      expect(vars).toContain('{{ticket.requester.first_name}}');
      expect(vars).toContain('{{shop.domain}}');
    });
  });

  describe('validateVariablePreservation', () => {
    it('should validate preserved variables', () => {
      const original = 'Hello {{customer.name}}';
      const translated = '[ar] Hello {{customer.name}}';
      const result = validateVariablePreservation(original, translated);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should detect missing variables', () => {
      const original = 'Hello {{customer.name}} {{order.id}}';
      const translated = '[ar] Hello {{customer.name}}';
      const result = validateVariablePreservation(original, translated);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('{{order.id}}');
    });

    it('should handle no variables', () => {
      const original = 'Plain text';
      const translated = '[ar] Plain text';
      const result = validateVariablePreservation(original, translated);

      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });

    it('should validate all common variables', () => {
      const original = '{{ticket.id}} {{customer.email}} {{agent.name}} {{order.name}} {{shop.domain}}';
      const translated = '[ar] ' + original;
      const result = validateVariablePreservation(original, translated);

      expect(result.valid).toBe(true);
    });
  });

  describe('getVariableCategories', () => {
    it('should return ticket variables', () => {
      const categories = getVariableCategories();
      expect(categories.ticket).toContain('{{ticket.id}}');
      expect(categories.ticket).toContain('{{ticket.subject}}');
      expect(categories.ticket).toContain('{{ticket.status}}');
    });

    it('should return requester variables', () => {
      const categories = getVariableCategories();
      expect(categories.requester).toContain('{{ticket.requester}}');
      expect(categories.requester).toContain('{{ticket.requester.email}}');
    });

    it('should return customer variables', () => {
      const categories = getVariableCategories();
      expect(categories.customer).toContain('{{customer}}');
      expect(categories.customer).toContain('{{customer.name}}');
    });

    it('should return agent variables', () => {
      const categories = getVariableCategories();
      expect(categories.agent).toContain('{{agent}}');
      expect(categories.agent).toContain('{{agent.name}}');
    });

    it('should return order variables', () => {
      const categories = getVariableCategories();
      expect(categories.order).toContain('{{order}}');
      expect(categories.order).toContain('{{order.id}}');
    });

    it('should return shop variables', () => {
      const categories = getVariableCategories();
      expect(categories.shop).toContain('{{shop}}');
      expect(categories.shop).toContain('{{shop.name}}');
    });

    it('should return date variables', () => {
      const categories = getVariableCategories();
      expect(categories.date).toContain('{{now}}');
      expect(categories.date).toContain('{{today}}');
    });
  });

  describe('Variable preservation edge cases', () => {
    it('should handle variables at start of text', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-edge-1',
        name: 'Edge Case',
        content: '{{customer.name}} is the customer',
      };

      const result = await translateMacro(macro, 'ar');
      expect(result.content).toContain('{{customer.name}}');
    });

    it('should handle variables at end of text', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-edge-2',
        name: 'Edge Case',
        content: 'Contact {{shop.email}}',
      };

      const result = await translateMacro(macro, 'ar');
      expect(result.content).toContain('{{shop.email}}');
    });

    it('should handle consecutive variables', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-edge-3',
        name: 'Edge Case',
        content: '{{ticket.id}}{{ticket.status}}',
      };

      const result = await translateMacro(macro, 'ar');
      expect(result.content).toContain('{{ticket.id}}');
      expect(result.content).toContain('{{ticket.status}}');
    });

    it('should handle variables with special characters in between', async () => {
      const macro: GorgiasMacro = {
        id: 'macro-edge-4',
        name: 'Edge Case',
        content: 'Order #{{order.id}} - Status: {{order.status}}!',
      };

      const result = await translateMacro(macro, 'ar');
      expect(result.content).toContain('{{order.id}}');
      expect(result.content).toContain('{{order.status}}');
    });
  });
});
