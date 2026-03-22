/**
 * A/B Testing Service
 * T0336: Translation - A/B Testing
 *
 * Enables A/B testing of translation variants to determine
 * which version performs better with users.
 */

export type TestStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface TestVariant {
  id: string;
  name: string;
  content: string;
  impressions: number;
  conversions: number;
}

export interface ABTest {
  id: string;
  shop: string;
  resourceId: string;
  locale?: string;
  name: string;
  status: TestStatus;
  variants: TestVariant[];
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  winnerVariantId?: string;
}

export interface CreateTestInput {
  name?: string;
  locale?: string;
  variants: Array<{ name: string; content: string }>;
}

export interface TestResults {
  testId: string;
  totalImpressions: number;
  variants: Array<{
    variantId: string;
    name: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
    uplift?: number; // relative to control (first variant)
  }>;
  winner?: string; // variantId of current leader
  isStatisticallySignificant: boolean;
}

export interface ImpressionResult {
  success: boolean;
  variantId?: string;
  error?: string;
}

// In-memory store (replace with DB in production)
const testStore: Map<string, ABTest> = new Map();

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Creates a new A/B test for a translation resource.
 * @param shop - The Shopify shop domain
 * @param resourceId - The resource identifier
 * @param variants - Array of variant definitions with name and content
 * @returns The created ABTest
 */
export function createTest(
  shop: string,
  resourceId: string,
  variants: CreateTestInput['variants'],
  options?: Omit<CreateTestInput, 'variants'>
): ABTest {
  if (variants.length < 2) {
    throw new Error('A/B test requires at least 2 variants');
  }

  const testVariants: TestVariant[] = variants.map((v) => ({
    id: generateId('var'),
    name: v.name,
    content: v.content,
    impressions: 0,
    conversions: 0,
  }));

  const test: ABTest = {
    id: generateId('test'),
    shop,
    resourceId,
    locale: options?.locale,
    name: options?.name ?? `Test for ${resourceId}`,
    status: 'active',
    variants: testVariants,
    createdAt: new Date(),
    startedAt: new Date(),
  };

  testStore.set(test.id, test);
  return test;
}

/**
 * Returns all active A/B tests for a shop.
 * @param shop - The Shopify shop domain
 * @returns Array of active ABTest records
 */
export function getActiveTests(shop: string): ABTest[] {
  const results: ABTest[] = [];
  for (const test of testStore.values()) {
    if (test.shop === shop && test.status === 'active') {
      results.push(test);
    }
  }
  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Records an impression for a specific variant.
 * @param testId - The test ID
 * @param variantId - The variant ID that was shown
 * @returns ImpressionResult
 */
export function recordImpression(
  testId: string,
  variantId: string
): ImpressionResult {
  const test = testStore.get(testId);
  if (!test) {
    return { success: false, error: `Test '${testId}' not found` };
  }

  if (test.status !== 'active') {
    return { success: false, error: `Test '${testId}' is not active` };
  }

  const variant = test.variants.find((v) => v.id === variantId);
  if (!variant) {
    return { success: false, error: `Variant '${variantId}' not found in test` };
  }

  variant.impressions++;
  testStore.set(testId, test);

  return { success: true, variantId };
}

/**
 * Records a conversion for a specific variant.
 * @param testId - The test ID
 * @param variantId - The variant ID that converted
 * @returns ImpressionResult
 */
export function recordConversion(
  testId: string,
  variantId: string
): ImpressionResult {
  const test = testStore.get(testId);
  if (!test) {
    return { success: false, error: `Test '${testId}' not found` };
  }

  const variant = test.variants.find((v) => v.id === variantId);
  if (!variant) {
    return { success: false, error: `Variant '${variantId}' not found in test` };
  }

  variant.conversions++;
  testStore.set(testId, test);

  return { success: true, variantId };
}

/**
 * Returns test results with conversion rates and statistical analysis.
 * @param testId - The test ID
 * @returns TestResults or null if test not found
 */
export function getTestResults(testId: string): TestResults | null {
  const test = testStore.get(testId);
  if (!test) return null;

  const totalImpressions = test.variants.reduce((sum, v) => sum + v.impressions, 0);
  const controlConversionRate = test.variants[0]?.impressions > 0
    ? test.variants[0].conversions / test.variants[0].impressions
    : 0;

  const variantResults = test.variants.map((v, index) => {
    const conversionRate = v.impressions > 0 ? v.conversions / v.impressions : 0;
    const uplift = index === 0
      ? undefined
      : controlConversionRate > 0
        ? ((conversionRate - controlConversionRate) / controlConversionRate) * 100
        : undefined;

    return {
      variantId: v.id,
      name: v.name,
      impressions: v.impressions,
      conversions: v.conversions,
      conversionRate: Math.round(conversionRate * 10000) / 100, // percentage with 2dp
      uplift: uplift !== undefined ? Math.round(uplift * 100) / 100 : undefined,
    };
  });

  // Determine current leader
  const leader = variantResults.reduce((best, current) =>
    current.conversionRate > best.conversionRate ? current : best
  , variantResults[0]);

  // Simple statistical significance check (>= 100 impressions per variant)
  const isStatisticallySignificant = test.variants.every((v) => v.impressions >= 100);

  return {
    testId,
    totalImpressions,
    variants: variantResults,
    winner: isStatisticallySignificant && leader ? leader.variantId : undefined,
    isStatisticallySignificant,
  };
}

/**
 * Selects a variant for display using round-robin assignment.
 * @param testId - The test ID
 * @returns The selected variant or null
 */
export function selectVariant(testId: string): TestVariant | null {
  const test = testStore.get(testId);
  if (!test || test.status !== 'active') return null;

  // Simple round-robin based on total impressions
  const totalImpressions = test.variants.reduce((sum, v) => sum + v.impressions, 0);
  const index = totalImpressions % test.variants.length;
  return test.variants[index] ?? null;
}

/**
 * Pauses an active test.
 * @param testId - The test ID
 * @returns true if paused, false if not found or not active
 */
export function pauseTest(testId: string): boolean {
  const test = testStore.get(testId);
  if (!test || test.status !== 'active') return false;
  test.status = 'paused';
  testStore.set(testId, test);
  return true;
}

/**
 * Completes a test and sets a winner.
 * @param testId - The test ID
 * @param winnerVariantId - The winning variant ID
 * @returns true if completed, false if not found
 */
export function completeTest(testId: string, winnerVariantId?: string): boolean {
  const test = testStore.get(testId);
  if (!test) return false;
  test.status = 'completed';
  test.endedAt = new Date();
  if (winnerVariantId) test.winnerVariantId = winnerVariantId;
  testStore.set(testId, test);
  return true;
}

/**
 * Retrieves a test by ID.
 * @param testId - The test ID
 * @returns The ABTest or null
 */
export function getTest(testId: string): ABTest | null {
  return testStore.get(testId) ?? null;
}

/**
 * Lists all tests for a shop regardless of status.
 */
export function getAllTests(shop: string): ABTest[] {
  const results: ABTest[] = [];
  for (const test of testStore.values()) {
    if (test.shop === shop) results.push(test);
  }
  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
