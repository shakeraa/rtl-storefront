import { describe, it, expect, beforeEach } from 'vitest';
import {
  validatePCIConfig,
  tokenizeCard,
  maskCardNumber,
  validateCardNumber,
  analyzeTransaction,
  isSuspiciousDevice,
  generate3DSecureParams,
  logAudit,
  getAuditLog,
  DEFAULT_RISK_RULES,
  type PCIComplianceConfig,
  type TransactionData,
} from '../../app/services/security/index';

describe('Security Service', () => {
  describe('PCI Compliance', () => {
    const validConfig: PCIComplianceConfig = {
      level: 1,
      requireSSL: true,
      encryptionKey: 'a'.repeat(32),
      tokenizationProvider: 'shopify',
      auditLogEnabled: true,
    };

    it('should validate correct PCI config', () => {
      const result = validatePCIConfig(validConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject short encryption key', () => {
      const result = validatePCIConfig({
        ...validConfig,
        encryptionKey: 'short',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Encryption key must be at least 32 characters');
    });

    it('should require audit log for level 1-2', () => {
      const result = validatePCIConfig({
        ...validConfig,
        level: 1,
        auditLogEnabled: false,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('Card Processing', () => {
    it('should mask card number correctly', () => {
      expect(maskCardNumber('4111111111111111')).toBe('************1111');
      expect(maskCardNumber('1234')).toBe('1234');
    });

    it('should validate card number using Luhn algorithm', () => {
      expect(validateCardNumber('4111111111111111')).toBe(true); // Valid Visa
      expect(validateCardNumber('5500000000000004')).toBe(true); // Valid Mastercard
      expect(validateCardNumber('1234567890123456')).toBe(false); // Invalid
      expect(validateCardNumber('123')).toBe(false); // Too short
    });

    it('should generate card token', () => {
      const card = {
        number: '4111111111111111',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123',
        holderName: 'Test User',
      };
      const result = tokenizeCard(card);
      expect(result.token).toMatch(/^tok_/);
      expect(result.last4).toBe('1111');
    });
  });

  describe('Fraud Detection', () => {
    const baseTransaction: TransactionData = {
      orderId: 'ORDER-123',
      amount: 100,
      currency: 'USD',
      customer: {
        email: 'test@example.com',
        ip: '192.168.1.1',
        country: 'SA',
      },
      payment: {
        method: 'card',
        cardCountry: 'SA',
        attempts: 1,
      },
      device: {
        fingerprint: 'abc123',
        userAgent: 'Mozilla/5.0',
        language: 'ar-SA',
        timezone: 'Asia/Riyadh',
      },
    };

    it('should return low risk for normal transaction', () => {
      const result = analyzeTransaction(baseTransaction);
      expect(result.risk).toBe('low');
      expect(result.blocked).toBe(false);
    });

    it('should detect high velocity', () => {
      const result = analyzeTransaction({
        ...baseTransaction,
        payment: { ...baseTransaction.payment, attempts: 5 },
      });
      expect(result.flags.some((f) => f.type === 'velocity')).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect geo mismatch', () => {
      const result = analyzeTransaction({
        ...baseTransaction,
        payment: { ...baseTransaction.payment, cardCountry: 'US' },
      });
      expect(result.flags.some((f) => f.type === 'geo_mismatch')).toBe(true);
    });

    it('should detect anonymous email', () => {
      const result = analyzeTransaction({
        ...baseTransaction,
        customer: { ...baseTransaction.customer, email: 'test@tempmail.com' },
      });
      expect(result.flags.some((f) => f.type === 'anonymous_email')).toBe(true);
    });

    it('should block high-risk transactions', () => {
      const result = analyzeTransaction({
        ...baseTransaction,
        customer: { ...baseTransaction.customer, email: 'test@tempmail.com' },
        payment: { ...baseTransaction.payment, attempts: 5, cardCountry: 'US' },
      });
      expect(result.blocked).toBe(true);
    });
  });

  describe('3D Secure', () => {
    it('should generate 3DS params', () => {
      const params = generate3DSecureParams('ORDER-123', 100, 'USD');
      expect(params.PaReq).toBeDefined();
      expect(params.TermUrl).toContain('ORDER-123');
      expect(params.MD).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      // Clear audit log
      const logs = getAuditLog();
      logs.length = 0;
    });

    it('should log audit entry', () => {
      const entry = {
        timestamp: new Date(),
        action: 'payment_processed',
        entityType: 'payment' as const,
        entityId: 'PAY-123',
        userId: 'user-123',
        ip: '192.168.1.1',
        success: true,
      };
      logAudit(entry);
      
      const logs = getAuditLog('payment');
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('payment_processed');
    });
  });

  describe('Risk Rules', () => {
    it('should have default risk rules', () => {
      expect(DEFAULT_RISK_RULES).toHaveLength(3);
      expect(DEFAULT_RISK_RULES[0].name).toBe('High Amount Review');
    });
  });
});
