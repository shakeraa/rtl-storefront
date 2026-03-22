/**
 * PCI Compliance & Fraud Detection Service
 * T0181: PCI Compliance
 * T0182: Fraud Detection
 */

// PCI Compliance types
export interface PCIComplianceConfig {
  level: 1 | 2 | 3 | 4;
  requireSSL: boolean;
  encryptionKey: string;
  tokenizationProvider: 'shopify' | 'stripe' | 'braintree';
  auditLogEnabled: boolean;
}

export interface CardData {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}

// Fraud detection types
export interface FraudCheckResult {
  score: number; // 0-100
  risk: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  blocked: boolean;
  reason?: string;
}

export interface FraudFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface TransactionData {
  orderId: string;
  amount: number;
  currency: string;
  customer: {
    id?: string;
    email: string;
    phone?: string;
    ip: string;
    country: string;
  };
  payment: {
    method: string;
    cardCountry?: string;
    cardBin?: string;
    attempts: number;
  };
  device: {
    fingerprint: string;
    userAgent: string;
    language: string;
    timezone: string;
  };
}

// PCI Compliance functions
export function validatePCIConfig(config: PCIComplianceConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.encryptionKey || config.encryptionKey.length < 32) {
    errors.push('Encryption key must be at least 32 characters');
  }
  
  if (config.level <= 2 && !config.auditLogEnabled) {
    errors.push('Level 1-2 compliance requires audit logging');
  }
  
  return { valid: errors.length === 0, errors };
}

export function tokenizeCard(card: CardData): { token: string; last4: string } {
  const token = `tok_${Buffer.from(card.number.slice(-4)).toString('base64')}_${Date.now()}`;
  return {
    token,
    last4: card.number.slice(-4),
  };
}

export function maskCardNumber(number: string): string {
  return number.replace(/\d(?=\d{4})/g, '*');
}

export function validateCardNumber(number: string): boolean {
  // Luhn algorithm
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Fraud detection functions
export function analyzeTransaction(data: TransactionData): FraudCheckResult {
  const flags: FraudFlag[] = [];
  let score = 0;
  
  // Velocity check - multiple attempts
  if (data.payment.attempts > 3) {
    score += 20;
    flags.push({
      type: 'velocity',
      severity: 'medium',
      description: 'Multiple payment attempts detected',
    });
  }
  
  // IP geolocation mismatch
  if (data.customer.country !== data.payment.cardCountry) {
    score += 25;
    flags.push({
      type: 'geo_mismatch',
      severity: 'high',
      description: 'Card country does not match customer location',
    });
  }
  
  // High-value transaction
  if (data.amount > 10000) {
    score += 15;
    flags.push({
      type: 'high_value',
      severity: 'low',
      description: 'High-value transaction',
    });
  }
  
  // Anonymous email domains
  const anonymousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const emailDomain = data.customer.email.split('@')[1];
  if (anonymousDomains.includes(emailDomain)) {
    score += 30;
    flags.push({
      type: 'anonymous_email',
      severity: 'high',
      description: 'Anonymous email service detected',
    });
  }
  
  // Device fingerprint analysis
  if (isSuspiciousDevice(data.device)) {
    score += 20;
    flags.push({
      type: 'device',
      severity: 'medium',
      description: 'Suspicious device characteristics',
    });
  }
  
  // Determine risk level
  let risk: FraudCheckResult['risk'] = 'low';
  if (score >= 80) risk = 'critical';
  else if (score >= 60) risk = 'high';
  else if (score >= 30) risk = 'medium';
  
  return {
    score,
    risk,
    flags,
    blocked: score >= 70,
    reason: score >= 70 ? 'Risk score exceeds threshold' : undefined,
  };
}

function isSuspiciousDevice(device: TransactionData['device']): boolean {
  const suspiciousUserAgents = ['headless', 'phantomjs', 'selenium'];
  const ua = device.userAgent.toLowerCase();
  
  return suspiciousUserAgents.some((s) => ua.includes(s));
}

// 3D Secure helper
export function generate3DSecureParams(
  orderId: string,
  amount: number,
  currency: string
): Record<string, string> {
  return {
    PaReq: generatePARes(orderId, amount, currency),
    TermUrl: `/3ds/callback/${orderId}`,
    MD: Buffer.from(orderId).toString('base64'),
  };
}

function generatePARes(orderId: string, amount: number, currency: string): string {
  return Buffer.from(`${orderId}:${amount}:${currency}`).toString('base64');
}

// Audit logging
export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  entityType: 'payment' | 'card' | 'refund' | 'customer';
  entityId: string;
  userId?: string;
  ip: string;
  success: boolean;
  details?: Record<string, unknown>;
}

const auditLog: AuditLogEntry[] = [];

export function logAudit(entry: AuditLogEntry): void {
  auditLog.push(entry);
}

export function getAuditLog(
  entityType?: AuditLogEntry['entityType'],
  startDate?: Date,
  endDate?: Date
): AuditLogEntry[] {
  return auditLog.filter((entry) => {
    if (entityType && entry.entityType !== entityType) return false;
    if (startDate && entry.timestamp < startDate) return false;
    if (endDate && entry.timestamp > endDate) return false;
    return true;
  });
}

// Risk rules management
export interface RiskRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'review' | 'block';
  priority: number;
  enabled: boolean;
}

export const DEFAULT_RISK_RULES: RiskRule[] = [
  {
    id: 'rule_001',
    name: 'High Amount Review',
    condition: 'amount > 5000',
    action: 'review',
    priority: 1,
    enabled: true,
  },
  {
    id: 'rule_002',
    name: 'Anonymous Email Block',
    condition: 'email_domain IN anon_list',
    action: 'block',
    priority: 2,
    enabled: true,
  },
  {
    id: 'rule_003',
    name: 'Multiple Attempts Review',
    condition: 'payment_attempts > 2',
    action: 'review',
    priority: 3,
    enabled: true,
  },
];
