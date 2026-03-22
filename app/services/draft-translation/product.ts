/**
 * Draft Product Translation Service (T0079)
 *
 * Provides draft translation management for products with auto-save,
 * versioning, and publishing capabilities.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DraftStatus =
  | "draft"
  | "auto_saved"
  | "ready_for_review"
  | "approved"
  | "published"
  | "discarded";

export interface DraftContent {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  handle?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  variantTitles?: Record<string, string>;
  customFields?: Record<string, string>;
}

export interface DraftVersion {
  versionNumber: number;
  content: DraftContent;
  createdAt: Date;
  autoSave: boolean;
}

export interface ProductTranslationDraft {
  id: string;
  productId: string;
  locale: string;
  shop: string;
  status: DraftStatus;
  content: DraftContent;
  versions: DraftVersion[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface AutoSaveOptions {
  delayMs?: number;
  maxVersions?: number;
}

export interface CreateDraftOptions {
  shop?: string;
  initialContent?: DraftContent;
}

export interface ListDraftsOptions {
  status?: DraftStatus;
  locale?: string;
  includeDiscarded?: boolean;
}

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------

const drafts = new Map<string, ProductTranslationDraft>();
const pendingAutoSaves = new Map<
  string,
  { timer: ReturnType<typeof setTimeout>; content: DraftContent }
>();

const DEFAULT_AUTO_SAVE_DELAY_MS = 1000;
const DEFAULT_MAX_VERSIONS = 10;

let idCounter = 0;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function generateDraftId(): string {
  idCounter += 1;
  return `draft-${Date.now()}-${idCounter}`;
}

function generateVersionNumber(versions: DraftVersion[]): number {
  if (versions.length === 0) return 1;
  return Math.max(...versions.map((v) => v.versionNumber)) + 1;
}

function cloneContent(content: DraftContent): DraftContent {
  return {
    ...content,
    tags: content.tags ? [...content.tags] : undefined,
    variantTitles: content.variantTitles
      ? { ...content.variantTitles }
      : undefined,
    customFields: content.customFields
      ? { ...content.customFields }
      : undefined,
  };
}

function createVersion(
  content: DraftContent,
  versions: DraftVersion[],
  autoSave: boolean,
  maxVersions: number
): DraftVersion[] {
  const newVersion: DraftVersion = {
    versionNumber: generateVersionNumber(versions),
    content: cloneContent(content),
    createdAt: new Date(),
    autoSave,
  };

  const updatedVersions = [...versions, newVersion];

  // Keep only the last N versions
  if (updatedVersions.length > maxVersions) {
    return updatedVersions.slice(updatedVersions.length - maxVersions);
  }

  return updatedVersions;
}

function applyAutoSave(draftId: string, content: DraftContent): void {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "published" || draft.status === "discarded") {
    return;
  }

  pendingAutoSaves.delete(draftId);

  draft.content = cloneContent(content);
  draft.updatedAt = new Date();
  draft.versions = createVersion(
    content,
    draft.versions,
    true,
    DEFAULT_MAX_VERSIONS
  );

  if (draft.status === "draft") {
    draft.status = "auto_saved";
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a new draft translation for a product.
 */
export function createDraft(
  productId: string,
  locale: string,
  options: CreateDraftOptions = {}
): ProductTranslationDraft {
  const draft: ProductTranslationDraft = {
    id: generateDraftId(),
    productId,
    locale,
    shop: options.shop || "default",
    status: "draft",
    content: options.initialContent ? cloneContent(options.initialContent) : {},
    versions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  drafts.set(draft.id, draft);
  return draft;
}

/**
 * Schedule an auto-save for a draft with debouncing.
 * Repeated saves for the same draft collapse into a single write.
 */
export function scheduleAutoSave(
  draftId: string,
  content: DraftContent,
  options: AutoSaveOptions = {}
): { scheduled: boolean } {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "published" || draft.status === "discarded") {
    return { scheduled: false };
  }

  // Cancel any existing pending auto-save
  const existing = pendingAutoSaves.get(draftId);
  if (existing) {
    clearTimeout(existing.timer);
  }

  const delayMs = options.delayMs ?? DEFAULT_AUTO_SAVE_DELAY_MS;
  const contentSnapshot = cloneContent(content);

  const timer = setTimeout(() => {
    applyAutoSave(draftId, contentSnapshot);
  }, delayMs);

  pendingAutoSaves.set(draftId, { timer, content: contentSnapshot });

  return { scheduled: true };
}

/**
 * Immediately flush any pending auto-save for a draft.
 */
export function flushAutoSave(draftId: string): boolean {
  const pending = pendingAutoSaves.get(draftId);
  if (!pending) {
    return false;
  }

  clearTimeout(pending.timer);
  applyAutoSave(draftId, pending.content);
  return true;
}

/**
 * Cancel any pending auto-save for a draft.
 */
export function cancelPendingAutoSave(draftId: string): boolean {
  const pending = pendingAutoSaves.get(draftId);
  if (!pending) {
    return false;
  }

  clearTimeout(pending.timer);
  pendingAutoSaves.delete(draftId);
  return true;
}

/**
 * Save a draft with new content (manual save).
 * Creates a new version and clears any pending auto-save.
 */
export function saveDraft(
  draftId: string,
  content: DraftContent,
  options: { maxVersions?: number } = {}
): { success: boolean; draft?: ProductTranslationDraft } {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "published" || draft.status === "discarded") {
    return { success: false };
  }

  // Cancel any pending auto-save
  cancelPendingAutoSave(draftId);

  const maxVersions = options.maxVersions ?? DEFAULT_MAX_VERSIONS;

  draft.content = cloneContent(content);
  draft.updatedAt = new Date();
  draft.versions = createVersion(content, draft.versions, false, maxVersions);

  if (draft.status === "draft" || draft.status === "auto_saved") {
    draft.status = "ready_for_review";
  }

  return { success: true, draft };
}

/**
 * Get a draft by ID.
 */
export function getDraft(
  draftId: string
): ProductTranslationDraft | undefined {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "discarded") {
    return undefined;
  }
  return draft;
}

/**
 * Get a specific version of a draft.
 */
export function getDraftVersion(
  draftId: string,
  versionNumber: number
): DraftVersion | undefined {
  const draft = drafts.get(draftId);
  if (!draft) {
    return undefined;
  }

  return draft.versions.find((v) => v.versionNumber === versionNumber);
}

/**
 * Restore a draft to a specific version.
 */
export function restoreVersion(
  draftId: string,
  versionNumber: number
): { success: boolean; draft?: ProductTranslationDraft } {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "published" || draft.status === "discarded") {
    return { success: false };
  }

  const version = draft.versions.find((v) => v.versionNumber === versionNumber);
  if (!version) {
    return { success: false };
  }

  // Cancel any pending auto-save
  cancelPendingAutoSave(draftId);

  draft.content = cloneContent(version.content);
  draft.updatedAt = new Date();
  draft.versions = createVersion(
    version.content,
    draft.versions,
    false,
    DEFAULT_MAX_VERSIONS
  );

  return { success: true, draft };
}

/**
 * List all versions of a draft.
 */
export function listVersions(draftId: string): DraftVersion[] {
  const draft = drafts.get(draftId);
  if (!draft) {
    return [];
  }

  return [...draft.versions].sort((a, b) => a.versionNumber - b.versionNumber);
}

/**
 * Mark a draft as approved.
 */
export function approveDraft(
  draftId: string,
  approvedBy: string
): { success: boolean; draft?: ProductTranslationDraft } {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "published" || draft.status === "discarded") {
    return { success: false };
  }

  if (draft.status !== "ready_for_review" && draft.status !== "auto_saved") {
    return { success: false };
  }

  // Flush any pending auto-save before approval
  flushAutoSave(draftId);

  draft.status = "approved";
  draft.approvedBy = approvedBy;
  draft.approvedAt = new Date();
  draft.updatedAt = new Date();

  return { success: true, draft };
}

/**
 * Publish a draft translation.
 * This marks the draft as published and ready to be applied to the product.
 */
export function publishDraft(
  draftId: string
): { success: boolean; draft?: ProductTranslationDraft } {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "published" || draft.status === "discarded") {
    return { success: false };
  }

  if (draft.status !== "approved" && draft.status !== "ready_for_review") {
    return { success: false };
  }

  // Flush any pending auto-save before publishing
  flushAutoSave(draftId);

  draft.status = "published";
  draft.publishedAt = new Date();
  draft.updatedAt = new Date();

  return { success: true, draft };
}

/**
 * Discard a draft.
 */
export function discardDraft(draftId: string): boolean {
  const draft = drafts.get(draftId);
  if (!draft || draft.status === "published") {
    return false;
  }

  cancelPendingAutoSave(draftId);
  draft.status = "discarded";
  draft.updatedAt = new Date();

  return true;
}

/**
 * List all drafts for a product.
 */
export function listDrafts(
  productId: string,
  options: ListDraftsOptions = {}
): ProductTranslationDraft[] {
  const result: ProductTranslationDraft[] = [];

  for (const draft of drafts.values()) {
    if (draft.productId !== productId) {
      continue;
    }

    if (draft.status === "discarded" && !options.includeDiscarded) {
      continue;
    }

    if (options.status && draft.status !== options.status) {
      continue;
    }

    if (options.locale && draft.locale !== options.locale) {
      continue;
    }

    result.push(draft);
  }

  return result.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * List all drafts for a shop.
 */
export function listAllDrafts(
  shop: string,
  options: Omit<ListDraftsOptions, "locale"> = {}
): ProductTranslationDraft[] {
  const result: ProductTranslationDraft[] = [];

  for (const draft of drafts.values()) {
    if (draft.shop !== shop) {
      continue;
    }

    if (draft.status === "discarded" && !options.includeDiscarded) {
      continue;
    }

    if (options.status && draft.status !== options.status) {
      continue;
    }

    result.push(draft);
  }

  return result.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * Get drafts by status.
 */
export function getDraftsByStatus(
  status: DraftStatus
): ProductTranslationDraft[] {
  const result: ProductTranslationDraft[] = [];

  for (const draft of drafts.values()) {
    if (draft.status === status) {
      result.push(draft);
    }
  }

  return result.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

/**
 * Compare two versions of a draft.
 */
export function compareVersions(
  draftId: string,
  versionA: number,
  versionB: number
): {
  success: boolean;
  differences?: Array<{
    field: string;
    versionA: string | string[] | undefined;
    versionB: string | string[] | undefined;
  }>;
} {
  const draft = drafts.get(draftId);
  if (!draft) {
    return { success: false };
  }

  const vA = draft.versions.find((v) => v.versionNumber === versionA);
  const vB = draft.versions.find((v) => v.versionNumber === versionB);

  if (!vA || !vB) {
    return { success: false };
  }

  const differences: Array<{
    field: string;
    versionA: string | string[] | undefined;
    versionB: string | string[] | undefined;
  }> = [];

  const allFields = new Set([
    ...Object.keys(vA.content),
    ...Object.keys(vB.content),
  ]);

  for (const field of allFields) {
    const valueA = vA.content[field as keyof DraftContent];
    const valueB = vB.content[field as keyof DraftContent];

    if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
      differences.push({
        field,
        versionA,
        versionB,
      });
    }
  }

  return { success: true, differences };
}

/**
 * Clear all state for testing purposes.
 */
export function clearDraftStateForTesting(): void {
  for (const pending of pendingAutoSaves.values()) {
    clearTimeout(pending.timer);
  }

  drafts.clear();
  pendingAutoSaves.clear();
  idCounter = 0;
}

/**
 * Get draft statistics.
 */
export function getDraftStats(productId: string): {
  totalDrafts: number;
  byStatus: Record<DraftStatus, number>;
  byLocale: Record<string, number>;
} {
  const productDrafts = listDrafts(productId, { includeDiscarded: true });

  const byStatus: Record<DraftStatus, number> = {
    draft: 0,
    auto_saved: 0,
    ready_for_review: 0,
    approved: 0,
    published: 0,
    discarded: 0,
  };

  const byLocale: Record<string, number> = {};

  for (const draft of productDrafts) {
    byStatus[draft.status]++;
    byLocale[draft.locale] = (byLocale[draft.locale] || 0) + 1;
  }

  return {
    totalDrafts: productDrafts.length,
    byStatus,
    byLocale,
  };
}
