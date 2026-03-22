/**
 * Security Service
 *
 * Consolidated security services for the Shopify RTL Storefront:
 * - T0181: PCI Compliance
 * - T0182: Fraud Detection
 * - T0183: Content Security Policy (CSP)
 * - T0184: XSS Prevention
 * - T0185: CSRF Protection
 * - T0186: Rate Limiting
 * - T0187: IP Blocking
 * - T0188: Audit Logging
 */

// Types
export type {
  CSPConfig,
  RateLimitConfig,
  RateLimitResult,
  IPBlockEntry,
  AuditLogEntry,
  XSSCheckResult,
  CSRFToken,
} from "./types";

// T0181 & T0182: PCI Compliance & Fraud Detection (existing)
export {
  validatePCIConfig,
  tokenizeCard,
  maskCardNumber,
  validateCardNumber,
  analyzeTransaction,
  generate3DSecureParams,
  logAudit,
  getAuditLog,
  DEFAULT_RISK_RULES,
} from "./pci-fraud";

export type {
  PCIComplianceConfig,
  CardData,
  FraudCheckResult,
  FraudFlag,
  TransactionData,
  AuditLogEntry as PCIAuditLogEntry,
  RiskRule,
} from "./pci-fraud";

// T0183: Content Security Policy
export {
  buildCSPHeader,
  getDefaultCSP,
  addCSPDirective,
  generateNonce,
} from "./csp";

// T0184: XSS Prevention
export {
  checkForXSS,
  sanitizeHTML,
  escapeForAttribute,
  escapeForJS,
} from "./xss";

// T0185: CSRF Protection
export {
  generateCSRFToken,
  validateCSRFToken,
  getCSRFCookieName,
  buildCSRFCookie,
  getStoredToken,
  cleanupExpiredTokens,
} from "./csrf";

// T0186: Rate Limiting
export { RateLimiter } from "./rate-limiter";

// T0187: IP Blocking
export {
  blockIP,
  unblockIP,
  isBlocked,
  getBlockedIPs,
  cleanupExpired,
} from "./ip-blocker";

// T0188: Audit Logging
export {
  log as auditLog,
  getLogsByShop,
  getLogsByAction,
  searchLogs,
  exportLogs,
  clearOlderThan,
} from "./audit-logger";

// Constants
export {
  PCI_REQUIREMENTS,
  FRAUD_THRESHOLDS,
  BLOCKED_COUNTRIES,
  BLOCKED_IP_RANGES,
} from "./constants";
