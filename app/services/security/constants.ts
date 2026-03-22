/**
 * Security Service Constants
 */

export const PCI_REQUIREMENTS = {
  dataEncryption: true,
  accessControl: true,
  networkSecurity: true,
  monitoring: true,
  vulnerabilityManagement: true,
};

export const FRAUD_THRESHOLDS = {
  low: 30,
  medium: 50,
  high: 70,
  critical: 90,
};

export const BLOCKED_COUNTRIES: string[] = [];
export const BLOCKED_IP_RANGES: string[] = [];
