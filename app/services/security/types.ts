/**
 * Security Service Types
 * Shared type definitions for CSP, Rate Limiting, IP Blocking,
 * Audit Logging, XSS Prevention, and CSRF Protection.
 */

export interface CSPConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
  connectSrc: string[];
  frameSrc: string[];
  reportUri?: string;
  reportOnly: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: "ip" | "shop" | "api_key";
  skipSuccessfulRequests: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export interface IPBlockEntry {
  ip: string;
  reason: string;
  blockedAt: Date;
  expiresAt?: Date;
  permanent: boolean;
}

export interface AuditLogEntry {
  id: string;
  shop: string;
  action: string;
  actor: string;
  resource?: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface XSSCheckResult {
  isSafe: boolean;
  threats: Array<{ type: string; location: string; pattern: string }>;
  sanitized: string;
}

export interface CSRFToken {
  token: string;
  expiresAt: Date;
}
