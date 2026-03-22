import { describe, it, expect } from 'vitest';
import {
  MENAPaymentOrchestrator,
  createMENAPaymentOrchestrator,
  createTamaraGateway,
  createTabbyGateway,
  createMadaGateway,
  createStcPayGateway,
  createTelrGateway,
} from '../../app/services/payments/mena/index';

describe('MENA Payments', () => {
  describe('MENAPaymentOrchestrator', () => {
    it('returns empty providers when constructed with no config', () => {
      const orchestrator = new MENAPaymentOrchestrator({} as any);
      expect(orchestrator.getConfiguredProviders()).toEqual([]);
    });

    it('getConfiguredProviders returns only configured gateways', () => {
      const orchestrator = new MENAPaymentOrchestrator({
        tamara: { provider: 'tamara', apiKey: 'test-key', sandbox: true },
        tabby: { provider: 'tabby', apiKey: 'test-key', sandbox: true },
      } as any);

      const providers = orchestrator.getConfiguredProviders();
      expect(providers).toContain('tamara');
      expect(providers).toContain('tabby');
      expect(providers).toHaveLength(2);
    });

    it('getAvailableProviders filters by currency and country', () => {
      const orchestrator = new MENAPaymentOrchestrator({
        tamara: { provider: 'tamara', apiKey: 'test-key', sandbox: true },
        mada: { provider: 'mada', apiKey: 'test-key', merchantId: 'mid', sandbox: true },
      } as any);

      const saProviders = orchestrator.getAvailableProviders('SAR', 'SA');
      expect(saProviders).toContain('tamara');
      expect(saProviders).toContain('mada');
    });

    it('getAvailableProviders excludes providers that do not support the currency', () => {
      const orchestrator = new MENAPaymentOrchestrator({
        mada: { provider: 'mada', apiKey: 'test-key', merchantId: 'mid', sandbox: true },
      } as any);

      // Mada only supports SAR
      const aeProviders = orchestrator.getAvailableProviders('AED', 'AE');
      expect(aeProviders).not.toContain('mada');
    });

    it('getGateway returns undefined for unconfigured providers', () => {
      const orchestrator = new MENAPaymentOrchestrator({} as any);
      expect(orchestrator.getGateway('tamara')).toBeUndefined();
    });
  });

  describe('createTamaraGateway', () => {
    it('isConfigured returns true when apiKey is provided', () => {
      const gateway = createTamaraGateway({ provider: 'tamara', apiKey: 'test-key', sandbox: true });
      expect(gateway.isConfigured()).toBe(true);
    });

    it('isConfigured returns false when apiKey is empty', () => {
      const gateway = createTamaraGateway({ provider: 'tamara', apiKey: '', sandbox: true });
      expect(gateway.isConfigured()).toBe(false);
    });

    it('has provider name "tamara"', () => {
      const gateway = createTamaraGateway({ provider: 'tamara', apiKey: 'key', sandbox: true });
      expect(gateway.provider).toBe('tamara');
    });

    it('supportedCurrencies includes SAR and AED', () => {
      const gateway = createTamaraGateway({ provider: 'tamara', apiKey: 'key', sandbox: true });
      expect(gateway.supportedCurrencies).toContain('SAR');
      expect(gateway.supportedCurrencies).toContain('AED');
    });

    it('supportedCountries includes SA and AE', () => {
      const gateway = createTamaraGateway({ provider: 'tamara', apiKey: 'key', sandbox: true });
      expect(gateway.supportedCountries).toContain('SA');
      expect(gateway.supportedCountries).toContain('AE');
    });
  });

  describe('createTabbyGateway', () => {
    it('isConfigured returns true when apiKey is provided', () => {
      const gateway = createTabbyGateway({ provider: 'tabby', apiKey: 'test-key', sandbox: true });
      expect(gateway.isConfigured()).toBe(true);
    });

    it('isConfigured returns false when apiKey is empty', () => {
      const gateway = createTabbyGateway({ provider: 'tabby', apiKey: '', sandbox: true });
      expect(gateway.isConfigured()).toBe(false);
    });

    it('supportedCurrencies includes SAR, AED, and KWD', () => {
      const gateway = createTabbyGateway({ provider: 'tabby', apiKey: 'key', sandbox: true });
      expect(gateway.supportedCurrencies).toContain('SAR');
      expect(gateway.supportedCurrencies).toContain('AED');
      expect(gateway.supportedCurrencies).toContain('KWD');
    });

    it('supportedCountries covers wide MENA region', () => {
      const gateway = createTabbyGateway({ provider: 'tabby', apiKey: 'key', sandbox: true });
      expect(gateway.supportedCountries).toContain('SA');
      expect(gateway.supportedCountries).toContain('AE');
      expect(gateway.supportedCountries).toContain('EG');
    });
  });

  describe('createMadaGateway', () => {
    it('isConfigured requires both apiKey and merchantId', () => {
      const configured = createMadaGateway({ provider: 'mada', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(configured.isConfigured()).toBe(true);
    });

    it('isConfigured returns false when merchantId is missing', () => {
      const gateway = createMadaGateway({ provider: 'mada', apiKey: 'key', sandbox: true });
      expect(gateway.isConfigured()).toBe(false);
    });

    it('isConfigured returns false when apiKey is empty', () => {
      const gateway = createMadaGateway({ provider: 'mada', apiKey: '', merchantId: 'mid', sandbox: true });
      expect(gateway.isConfigured()).toBe(false);
    });

    it('supportedCurrencies is only SAR', () => {
      const gateway = createMadaGateway({ provider: 'mada', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.supportedCurrencies).toEqual(['SAR']);
    });

    it('supportedCountries is only SA', () => {
      const gateway = createMadaGateway({ provider: 'mada', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.supportedCountries).toEqual(['SA']);
    });
  });

  describe('createStcPayGateway', () => {
    it('isConfigured requires both apiKey and merchantId', () => {
      const gateway = createStcPayGateway({ provider: 'stc_pay', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.isConfigured()).toBe(true);
    });

    it('isConfigured returns false when merchantId is missing', () => {
      const gateway = createStcPayGateway({ provider: 'stc_pay', apiKey: 'key', sandbox: true });
      expect(gateway.isConfigured()).toBe(false);
    });

    it('supportedCountries is only SA', () => {
      const gateway = createStcPayGateway({ provider: 'stc_pay', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.supportedCountries).toEqual(['SA']);
    });

    it('supportedCurrencies is only SAR', () => {
      const gateway = createStcPayGateway({ provider: 'stc_pay', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.supportedCurrencies).toEqual(['SAR']);
    });
  });

  describe('createTelrGateway', () => {
    it('isConfigured requires both apiKey and merchantId', () => {
      const gateway = createTelrGateway({ provider: 'telr', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.isConfigured()).toBe(true);
    });

    it('isConfigured returns false when apiKey is empty', () => {
      const gateway = createTelrGateway({ provider: 'telr', apiKey: '', merchantId: 'mid', sandbox: true });
      expect(gateway.isConfigured()).toBe(false);
    });

    it('supportedCurrencies includes AED, SAR, and USD', () => {
      const gateway = createTelrGateway({ provider: 'telr', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.supportedCurrencies).toContain('AED');
      expect(gateway.supportedCurrencies).toContain('SAR');
      expect(gateway.supportedCurrencies).toContain('USD');
    });

    it('supportedCountries includes AE and SA', () => {
      const gateway = createTelrGateway({ provider: 'telr', apiKey: 'key', merchantId: 'mid', sandbox: true });
      expect(gateway.supportedCountries).toContain('AE');
      expect(gateway.supportedCountries).toContain('SA');
    });
  });

  describe('createMENAPaymentOrchestrator', () => {
    it('creates orchestrator with empty env returning no configured providers', () => {
      const orchestrator = createMENAPaymentOrchestrator({});
      expect(orchestrator.getConfiguredProviders()).toEqual([]);
    });

    it('creates orchestrator with tamara env key', () => {
      const orchestrator = createMENAPaymentOrchestrator({
        TAMARA_API_KEY: 'test-tamara-key',
        NODE_ENV: 'test',
      });
      const providers = orchestrator.getConfiguredProviders();
      expect(providers).toContain('tamara');
    });
  });
});
