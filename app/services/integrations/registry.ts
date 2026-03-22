/**
 * Integration Registry
 * T0014: Integrations - Shopify Ecosystem & Third-Party Apps
 *
 * Manages enabled third-party integrations and their configurations.
 */

export interface Integration {
  id: string;
  name: string;
  enabled: boolean;
  category: 'page-builder' | 'reviews' | 'email' | 'support' | 'other';
  config?: Record<string, unknown>;
  configure(config: Record<string, unknown>): void;
}

export class IntegrationRegistry {
  private integrations: Map<string, Integration> = new Map();

  register(integration: Integration): void {
    this.integrations.set(integration.id, integration);
  }

  get(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  getAll(): Integration[] {
    return Array.from(this.integrations.values());
  }

  getEnabled(): Integration[] {
    return Array.from(this.integrations.values()).filter((i) => i.enabled);
  }

  getByCategory(
    category: Integration['category']
  ): Integration[] {
    return Array.from(this.integrations.values()).filter(
      (i) => i.category === category
    );
  }

  enable(id: string): boolean {
    const integration = this.integrations.get(id);
    if (!integration) return false;
    integration.enabled = true;
    return true;
  }

  disable(id: string): boolean {
    const integration = this.integrations.get(id);
    if (!integration) return false;
    integration.enabled = false;
    return true;
  }

  has(id: string): boolean {
    return this.integrations.has(id);
  }
}

// Singleton registry instance pre-populated with known integrations
export const registry = new IntegrationRegistry();

// Register built-in integrations (disabled by default; enabled on configuration)
const BUILTIN_INTEGRATIONS: Omit<Integration, 'configure'>[] = [
  { id: 'pagefly', name: 'PageFly', enabled: false, category: 'page-builder' },
  { id: 'gempages', name: 'GemPages', enabled: false, category: 'page-builder' },
  { id: 'shogun', name: 'Shogun', enabled: false, category: 'page-builder' },
  { id: 'judgeme', name: 'Judge.me', enabled: false, category: 'reviews' },
  { id: 'loox', name: 'Loox', enabled: false, category: 'reviews' },
  { id: 'stamped', name: 'Stamped', enabled: false, category: 'reviews' },
  { id: 'yotpo', name: 'Yotpo', enabled: false, category: 'reviews' },
  { id: 'klaviyo', name: 'Klaviyo', enabled: false, category: 'email' },
  { id: 'omnisend', name: 'Omnisend', enabled: false, category: 'email' },
  { id: 'zendesk', name: 'Zendesk', enabled: false, category: 'support' },
  { id: 'gorgias', name: 'Gorgias', enabled: false, category: 'support' },
];

for (const base of BUILTIN_INTEGRATIONS) {
  registry.register({
    ...base,
    configure(config: Record<string, unknown>) {
      this.config = { ...(this.config ?? {}), ...config };
      this.enabled = true;
    },
  });
}
