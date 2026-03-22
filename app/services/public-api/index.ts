/**
 * Public API Service
 * T0020: Public API
 */

export interface APIKey {
  id: string;
  key: string;
  name: string;
  createdAt: Date;
  expiresAt?: Date;
  permissions: string[];
  lastUsed?: Date;
  rateLimit: number;
}

export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  headers: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// API endpoints
export const API_ENDPOINTS = {
  translations: '/api/v1/translations',
  products: '/api/v1/products',
  collections: '/api/v1/collections',
  locales: '/api/v1/locales',
  export: '/api/v1/export',
  import: '/api/v1/import',
  status: '/api/v1/status',
};

// Generate API key
export function generateAPIKey(): string {
  const prefix = 'rtl_';
  const random = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}${random}`;
}

// Validate API key
export function validateAPIKey(key: string): boolean {
  return key.startsWith('rtl_') && key.length === 36;
}

// Create API request
export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    apiKey: string;
    body?: unknown;
    params?: Record<string, string>;
  }
): Promise<APIResponse<T>> {
  const url = new URL(endpoint, window.location.origin);
  
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  const response = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': options.apiKey,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  return response.json();
}

// Rate limit check
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  isAllowed(apiKey: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const timestamps = this.requests.get(apiKey) || [];
    const recentRequests = timestamps.filter((t) => t > windowStart);
    
    if (recentRequests.length >= limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(apiKey, recentRequests);
    return true;
  }
}

// Export all
export * from './constants';
