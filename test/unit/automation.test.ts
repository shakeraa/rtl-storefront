import { describe, it, expect, beforeEach } from 'vitest';
import {
  createJob,
  getNextJob,
  updateJobStatus,
  retryJob,
  getQueueStats,
  cancelJob,
  clearCompleted,
} from '../../app/services/automation/queue';
import {
  evaluateRules,
  evaluateCondition,
  getDefaultRules,
} from '../../app/services/automation/rules';
import {
  handleWebhook,
  parseShopifyWebhook,
} from '../../app/services/automation/webhook-handler';
import {
  syncResource,
  bulkSync,
} from '../../app/services/automation/sync';
import type {
  AutomationRule,
  WebhookPayload,
} from '../../app/services/automation/types';

const SHOP = 'test-shop.myshopify.com';

function makeRule(overrides: Partial<AutomationRule> = {}): AutomationRule {
  return {
    id: 'rule-1',
    shop: SHOP,
    name: 'Test rule',
    enabled: true,
    trigger: 'product/create',
    conditions: [],
    action: 'auto_translate',
    targetLocales: ['ar', 'he'],
    priority: 10,
    ...overrides,
  };
}

function makePayload(overrides: Partial<WebhookPayload> = {}): WebhookPayload {
  return {
    topic: 'product/create',
    shop: SHOP,
    resourceId: 'gid://shopify/Product/1',
    resourceType: 'product',
    fields: { title: 'Test Product' },
    ...overrides,
  };
}

describe('Automation - Queue', () => {
  // Note: The queue module uses a module-level Map, so jobs accumulate across tests.
  // We work around this by creating fresh jobs per test and using unique shops where needed.

  it('createJob() returns a job with id, status "queued", retryCount 0', () => {
    const job = createJob({
      shop: SHOP,
      resourceType: 'product',
      resourceId: 'p1',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 5,
      maxRetries: 3,
    });

    expect(job.id).toBeDefined();
    expect(typeof job.id).toBe('string');
    expect(job.status).toBe('queued');
    expect(job.retryCount).toBe(0);
    expect(job.createdAt).toBeInstanceOf(Date);
  });

  it('getNextJob() returns the highest priority queued job', () => {
    const uniqueShop = 'priority-test.myshopify.com';
    const lowPriority = createJob({
      shop: uniqueShop,
      resourceType: 'product',
      resourceId: 'low',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 1,
      maxRetries: 3,
    });
    const highPriority = createJob({
      shop: uniqueShop,
      resourceType: 'product',
      resourceId: 'high',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 100,
      maxRetries: 3,
    });

    const next = getNextJob();
    expect(next).toBeDefined();
    expect(next!.priority).toBeGreaterThanOrEqual(highPriority.priority);
  });

  it('updateJobStatus() changes the status and sets timestamps', () => {
    const job = createJob({
      shop: SHOP,
      resourceType: 'product',
      resourceId: 'p-status',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 5,
      maxRetries: 3,
    });

    updateJobStatus(job.id, 'processing');
    expect(job.status).toBe('processing');
    expect(job.startedAt).toBeInstanceOf(Date);

    updateJobStatus(job.id, 'completed');
    expect(job.status).toBe('completed');
    expect(job.completedAt).toBeInstanceOf(Date);
  });

  it('updateJobStatus() records an error string when provided', () => {
    const job = createJob({
      shop: SHOP,
      resourceType: 'product',
      resourceId: 'p-err',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 5,
      maxRetries: 3,
    });

    updateJobStatus(job.id, 'failed', 'API timeout');
    expect(job.status).toBe('failed');
    expect(job.error).toBe('API timeout');
  });

  it('retryJob() increments retryCount and resets status to queued', () => {
    const job = createJob({
      shop: SHOP,
      resourceType: 'product',
      resourceId: 'p-retry',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 5,
      maxRetries: 3,
    });

    updateJobStatus(job.id, 'failed', 'timeout');
    const result = retryJob(job.id);

    expect(result).toBe(true);
    expect(job.retryCount).toBe(1);
    expect(job.status).toBe('queued');
    expect(job.error).toBeUndefined();
  });

  it('retryJob() returns false when maxRetries is exceeded', () => {
    const job = createJob({
      shop: SHOP,
      resourceType: 'product',
      resourceId: 'p-max-retry',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 5,
      maxRetries: 1,
    });

    // First retry succeeds
    updateJobStatus(job.id, 'failed');
    retryJob(job.id);
    expect(job.retryCount).toBe(1);

    // Second retry should fail (retryCount 1 >= maxRetries 1)
    updateJobStatus(job.id, 'failed');
    const result = retryJob(job.id);
    expect(result).toBe(false);
  });

  it('getQueueStats() returns correct counts per shop', () => {
    const statsShop = 'stats-shop.myshopify.com';

    createJob({ shop: statsShop, resourceType: 'product', resourceId: 's1', sourceLocale: 'en', targetLocales: ['ar'], priority: 5, maxRetries: 3 });
    createJob({ shop: statsShop, resourceType: 'product', resourceId: 's2', sourceLocale: 'en', targetLocales: ['ar'], priority: 5, maxRetries: 3 });
    const j3 = createJob({ shop: statsShop, resourceType: 'product', resourceId: 's3', sourceLocale: 'en', targetLocales: ['ar'], priority: 5, maxRetries: 3 });
    updateJobStatus(j3.id, 'processing');

    const stats = getQueueStats(statsShop);
    expect(stats.queued).toBe(2);
    expect(stats.processing).toBe(1);
    expect(stats.totalToday).toBeGreaterThanOrEqual(3);
  });

  it('cancelJob() sets status to cancelled', () => {
    const job = createJob({
      shop: SHOP,
      resourceType: 'product',
      resourceId: 'p-cancel',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 5,
      maxRetries: 3,
    });

    const result = cancelJob(job.id);
    expect(result).toBe(true);
    expect(job.status).toBe('cancelled');
    expect(job.completedAt).toBeInstanceOf(Date);
  });

  it('cancelJob() returns false for already completed jobs', () => {
    const job = createJob({
      shop: SHOP,
      resourceType: 'product',
      resourceId: 'p-cancel-done',
      sourceLocale: 'en',
      targetLocales: ['ar'],
      priority: 5,
      maxRetries: 3,
    });

    updateJobStatus(job.id, 'completed');
    expect(cancelJob(job.id)).toBe(false);
  });

  it('clearCompleted() removes completed jobs and returns the count', () => {
    const clearShop = 'clear-shop.myshopify.com';
    const j1 = createJob({ shop: clearShop, resourceType: 'product', resourceId: 'c1', sourceLocale: 'en', targetLocales: ['ar'], priority: 5, maxRetries: 3 });
    const j2 = createJob({ shop: clearShop, resourceType: 'product', resourceId: 'c2', sourceLocale: 'en', targetLocales: ['ar'], priority: 5, maxRetries: 3 });
    createJob({ shop: clearShop, resourceType: 'product', resourceId: 'c3', sourceLocale: 'en', targetLocales: ['ar'], priority: 5, maxRetries: 3 });

    updateJobStatus(j1.id, 'completed');
    updateJobStatus(j2.id, 'completed');

    const removed = clearCompleted(clearShop);
    expect(removed).toBe(2);
  });
});

describe('Automation - Rules', () => {
  it('evaluateRules() returns the matching rule', () => {
    const rule = makeRule();
    const payload = makePayload();

    const result = evaluateRules([rule], payload);
    expect(result).toBeTruthy();
    expect(result!.id).toBe(rule.id);
  });

  it('evaluateRules() returns null when no rule matches', () => {
    const rule = makeRule({ trigger: 'product/update' });
    const payload = makePayload({ topic: 'product/create' });

    const result = evaluateRules([rule], payload);
    expect(result).toBeNull();
  });

  it('evaluateRules() skips disabled rules', () => {
    const rule = makeRule({ enabled: false });
    const payload = makePayload();

    const result = evaluateRules([rule], payload);
    expect(result).toBeNull();
  });

  it('evaluateCondition() handles equals operator', () => {
    const payload = makePayload({ resourceType: 'product' });
    const condition = { field: 'resourceType', operator: 'equals' as const, value: 'product' };

    expect(evaluateCondition(condition, payload)).toBe(true);
  });

  it('evaluateCondition() handles contains operator', () => {
    const payload = makePayload({ fields: { title: 'Blue Running Shoes' } });
    const condition = { field: 'title', operator: 'contains' as const, value: 'running' };

    expect(evaluateCondition(condition, payload)).toBe(true);
  });

  it('evaluateCondition() handles not_empty operator', () => {
    const payload = makePayload({ fields: { title: 'Something' } });
    const condition = { field: 'title', operator: 'not_empty' as const, value: '' };

    expect(evaluateCondition(condition, payload)).toBe(true);
  });

  it('evaluateCondition() not_empty returns false for empty field', () => {
    const payload = makePayload({ fields: { title: '' } });
    const condition = { field: 'title', operator: 'not_empty' as const, value: '' };

    expect(evaluateCondition(condition, payload)).toBe(false);
  });

  it('getDefaultRules() returns rules including auto_translate for creates', () => {
    const rules = getDefaultRules(SHOP);

    expect(rules.length).toBeGreaterThanOrEqual(3);

    const productCreateRule = rules.find((r) => r.trigger === 'product/create');
    expect(productCreateRule).toBeDefined();
    expect(productCreateRule!.action).toBe('auto_translate');
    expect(productCreateRule!.enabled).toBe(true);
  });
});

describe('Automation - Webhook Handler', () => {
  it('handleWebhook() creates jobs for auto_translate action', () => {
    const rule = makeRule({ action: 'auto_translate' });
    const payload = makePayload();

    const result = handleWebhook(payload, [rule]);

    expect(result.action).toBe('auto_translate');
    expect(result.jobs.length).toBe(1);
    expect(result.jobs[0].status).toBe('queued');
    expect(result.jobs[0].resourceId).toBe(payload.resourceId);
  });

  it('handleWebhook() returns skip when no rule matches', () => {
    const rule = makeRule({ trigger: 'product/update' });
    const payload = makePayload({ topic: 'product/create' });

    const result = handleWebhook(payload, [rule]);
    expect(result.action).toBe('skip');
    expect(result.jobs).toHaveLength(0);
  });

  it('parseShopifyWebhook() extracts topic, resourceId, and resourceType', () => {
    const result = parseShopifyWebhook('product/create', {
      id: '12345',
      shop: SHOP,
      title: 'Test Product',
    });

    expect(result.topic).toBe('product/create');
    expect(result.resourceId).toBe('12345');
    expect(result.resourceType).toBe('product');
    expect(result.shop).toBe(SHOP);
  });

  it('parseShopifyWebhook() throws for unsupported topic', () => {
    expect(() =>
      parseShopifyWebhook('order/create', { id: '1' }),
    ).toThrow('Unsupported webhook topic');
  });
});

describe('Automation - Sync', () => {
  it('syncResource() creates a translation job', () => {
    const job = syncResource(SHOP, 'product', 'p-sync-1', ['ar', 'he']);

    expect(job.id).toBeDefined();
    expect(job.status).toBe('queued');
    expect(job.resourceType).toBe('product');
    expect(job.targetLocales).toEqual(['ar', 'he']);
  });

  it('bulkSync() creates multiple jobs', () => {
    const resources = [
      { type: 'product', id: 'bulk-1' },
      { type: 'collection', id: 'bulk-2' },
      { type: 'page', id: 'bulk-3' },
    ];

    const jobs = bulkSync(SHOP, resources, ['ar']);

    expect(jobs).toHaveLength(3);
    expect(jobs[0].resourceType).toBe('product');
    expect(jobs[1].resourceType).toBe('collection');
    expect(jobs[2].resourceType).toBe('page');
    jobs.forEach((job) => {
      expect(job.status).toBe('queued');
    });
  });
});
