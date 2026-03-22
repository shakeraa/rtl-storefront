/**
 * Public API Service Constants
 */

export const API_VERSION = 'v1';

export const DEFAULT_RATE_LIMIT = 1000; // requests per hour

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
};

export const API_ERRORS = {
  INVALID_KEY: { code: 'INVALID_KEY', message: 'Invalid API key' },
  RATE_LIMIT: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
};
