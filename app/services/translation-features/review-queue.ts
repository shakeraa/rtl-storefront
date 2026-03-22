/**
 * Translation Human Review Queue Service
 * Manages queue of translation items awaiting human review
 * Supports prioritization, status tracking, and reviewer assignment
 */

export type ReviewStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';
export type ItemType = 'product' | 'collection' | 'page' | 'blog' | 'menu' | 'metafield' | 'theme';

export interface QueueItem {
  id: string;
  type: ItemType;
  sourceText: string;
  translatedText: string;
  sourceLocale: string;
  targetLocale: string;
  status: ReviewStatus;
  priority: PriorityLevel;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  metadata: QueueItemMetadata;
}

export interface QueueItemMetadata {
  productId?: string;
  productTitle?: string;
  shopDomain?: string;
  aiConfidence?: number;
  glossaryTerms?: string[];
  previousTranslation?: string;
  wordCount?: number;
  characterCount?: number;
  tags?: string[];
  category?: string;
}

export interface QueueFilters {
  status?: ReviewStatus;
  priority?: PriorityLevel;
  assignedTo?: string;
  targetLocale?: string;
  itemType?: ItemType;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

export interface QueueStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  byPriority: Record<PriorityLevel, number>;
  byLocale: Record<string, number>;
  byType: Record<ItemType, number>;
  unassigned: number;
  overdue: number;
  averageReviewTime?: number;
}

export interface QueueItemInput {
  type: ItemType;
  sourceText: string;
  translatedText: string;
  sourceLocale: string;
  targetLocale: string;
  priority?: PriorityLevel;
  metadata?: Partial<QueueItemMetadata>;
}

export interface StatusTransition {
  from: ReviewStatus;
  to: ReviewStatus;
  allowed: boolean;
  requiresReviewer?: boolean;
}

// In-memory storage for queue items
const queueItems: Map<string, QueueItem> = new Map();

// Valid status transitions
const VALID_TRANSITIONS: StatusTransition[] = [
  { from: 'pending', to: 'in_review', allowed: true, requiresReviewer: true },
  { from: 'pending', to: 'approved', allowed: false },
  { from: 'pending', to: 'rejected', allowed: false },
  { from: 'in_review', to: 'approved', allowed: true, requiresReviewer: true },
  { from: 'in_review', to: 'rejected', allowed: true, requiresReviewer: true },
  { from: 'in_review', to: 'pending', allowed: true },
  { from: 'approved', to: 'pending', allowed: true },
  { from: 'approved', to: 'in_review', allowed: true },
  { from: 'approved', to: 'rejected', allowed: true, requiresReviewer: true },
  { from: 'rejected', to: 'pending', allowed: true },
  { from: 'rejected', to: 'in_review', allowed: true },
  { from: 'rejected', to: 'approved', allowed: true, requiresReviewer: true },
];

// Priority weights for sorting (higher = more urgent)
const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

/**
 * Generates a unique ID for queue items
 */
function generateId(): string {
  return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates if a status transition is allowed
 */
export function isValidStatusTransition(
  from: ReviewStatus,
  to: ReviewStatus,
  hasReviewer: boolean
): boolean {
  const transition = VALID_TRANSITIONS.find(
    (t) => t.from === from && t.to === to
  );
  
  if (!transition) {
    return false;
  }
  
  if (transition.requiresReviewer && !hasReviewer) {
    return false;
  }
  
  return transition.allowed;
}

/**
 * Adds a new item to the review queue
 */
export function addToQueue(item: QueueItemInput): QueueItem {
  if (!item.sourceText || !item.translatedText) {
    throw new Error('Source text and translated text are required');
  }
  
  if (!item.sourceLocale || !item.targetLocale) {
    throw new Error('Source locale and target locale are required');
  }
  
  const now = new Date();
  const queueItem: QueueItem = {
    id: generateId(),
    type: item.type,
    sourceText: item.sourceText,
    translatedText: item.translatedText,
    sourceLocale: item.sourceLocale,
    targetLocale: item.targetLocale,
    status: 'pending',
    priority: item.priority || 'normal',
    createdAt: now,
    updatedAt: now,
    metadata: {
      wordCount: item.sourceText.split(/\s+/).length,
      characterCount: item.sourceText.length,
      ...item.metadata,
    },
  };
  
  queueItems.set(queueItem.id, queueItem);
  return queueItem;
}

/**
 * Gets queue items with optional filtering and sorting
 */
export function getQueueItems(
  filters: QueueFilters = {},
  options: { sortBy?: 'priority' | 'date' | 'none'; limit?: number; offset?: number } = {}
): QueueItem[] {
  let items = Array.from(queueItems.values());
  
  // Apply filters
  if (filters.status) {
    items = items.filter((item) => item.status === filters.status);
  }
  
  if (filters.priority) {
    items = items.filter((item) => item.priority === filters.priority);
  }
  
  if (filters.assignedTo !== undefined) {
    if (filters.assignedTo === null) {
      items = items.filter((item) => !item.assignedTo);
    } else {
      items = items.filter((item) => item.assignedTo === filters.assignedTo);
    }
  }
  
  if (filters.targetLocale) {
    items = items.filter((item) => item.targetLocale === filters.targetLocale);
  }
  
  if (filters.itemType) {
    items = items.filter((item) => item.type === filters.itemType);
  }
  
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    items = items.filter(
      (item) =>
        item.sourceText.toLowerCase().includes(term) ||
        item.translatedText.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term)
    );
  }
  
  if (filters.dateFrom) {
    items = items.filter((item) => item.createdAt >= filters.dateFrom!);
  }
  
  if (filters.dateTo) {
    items = items.filter((item) => item.createdAt <= filters.dateTo!);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    items = items.filter((item) =>
      filters.tags!.some((tag) => item.metadata.tags?.includes(tag))
    );
  }
  
  // Apply sorting
  if (options.sortBy === 'priority') {
    items.sort((a, b) => {
      const weightDiff = PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  } else if (options.sortBy === 'date') {
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Apply pagination
  const offset = options.offset || 0;
  const limit = options.limit;
  
  if (limit !== undefined) {
    items = items.slice(offset, offset + limit);
  } else if (offset > 0) {
    items = items.slice(offset);
  }
  
  return items;
}

/**
 * Gets a single queue item by ID
 */
export function getQueueItemById(id: string): QueueItem | undefined {
  return queueItems.get(id);
}

/**
 * Updates the status of a queue item
 */
export function updateItemStatus(
  id: string,
  status: ReviewStatus,
  options: { reviewerId?: string; reviewNotes?: string } = {}
): QueueItem {
  const item = queueItems.get(id);
  
  if (!item) {
    throw new Error(`Queue item with ID ${id} not found`);
  }
  
  const hasReviewer = Boolean(options.reviewerId || item.assignedTo);
  
  if (!isValidStatusTransition(item.status, status, hasReviewer)) {
    throw new Error(
      `Invalid status transition from ${item.status} to ${status}`
    );
  }
  
  const now = new Date();
  item.status = status;
  item.updatedAt = now;
  
  if (options.reviewerId) {
    item.reviewedBy = options.reviewerId;
  }
  
  if (options.reviewNotes !== undefined) {
    item.reviewNotes = options.reviewNotes;
  }
  
  if (status === 'approved' || status === 'rejected') {
    item.reviewedAt = now;
  }
  
  return item;
}

/**
 * Assigns a queue item to a reviewer
 */
export function assignToReviewer(itemId: string, reviewerId: string): QueueItem {
  if (!reviewerId) {
    throw new Error('Reviewer ID is required');
  }
  
  const item = queueItems.get(itemId);
  
  if (!item) {
    throw new Error(`Queue item with ID ${itemId} not found`);
  }
  
  item.assignedTo = reviewerId;
  item.updatedAt = new Date();
  
  return item;
}

/**
 * Unassigns a queue item from its reviewer
 */
export function unassignReviewer(itemId: string): QueueItem {
  const item = queueItems.get(itemId);
  
  if (!item) {
    throw new Error(`Queue item with ID ${itemId} not found`);
  }
  
  item.assignedTo = undefined;
  item.updatedAt = new Date();
  
  return item;
}

/**
 * Updates an existing queue item
 */
export function updateQueueItem(
  id: string,
  updates: Partial<Omit<QueueItem, 'id' | 'createdAt'>>
): QueueItem {
  const item = queueItems.get(id);
  
  if (!item) {
    throw new Error(`Queue item with ID ${id} not found`);
  }
  
  Object.assign(item, updates, { updatedAt: new Date() });
  return item;
}

/**
 * Removes an item from the queue
 */
export function removeFromQueue(id: string): boolean {
  return queueItems.delete(id);
}

/**
 * Gets comprehensive statistics about the review queue
 */
export function getQueueStats(): QueueStats {
  const items = Array.from(queueItems.values());
  const now = new Date();
  
  // Count items by status
  const pending = items.filter((i) => i.status === 'pending').length;
  const inReview = items.filter((i) => i.status === 'in_review').length;
  const approved = items.filter((i) => i.status === 'approved').length;
  const rejected = items.filter((i) => i.status === 'rejected').length;
  
  // Count by priority
  const byPriority: Record<PriorityLevel, number> = {
    urgent: items.filter((i) => i.priority === 'urgent').length,
    high: items.filter((i) => i.priority === 'high').length,
    normal: items.filter((i) => i.priority === 'normal').length,
    low: items.filter((i) => i.priority === 'low').length,
  };
  
  // Count by locale
  const byLocale: Record<string, number> = {};
  items.forEach((item) => {
    byLocale[item.targetLocale] = (byLocale[item.targetLocale] || 0) + 1;
  });
  
  // Count by type
  const byType: Record<ItemType, number> = {
    product: 0,
    collection: 0,
    page: 0,
    blog: 0,
    menu: 0,
    metafield: 0,
    theme: 0,
  };
  items.forEach((item) => {
    byType[item.type]++;
  });
  
  // Count unassigned
  const unassigned = items.filter((i) => !i.assignedTo).length;
  
  // Count overdue (items pending for more than 48 hours)
  const overdueThreshold = 48 * 60 * 60 * 1000;
  const overdue = items.filter(
    (i) =>
      (i.status === 'pending' || i.status === 'in_review') &&
      now.getTime() - i.createdAt.getTime() > overdueThreshold
  ).length;
  
  // Calculate average review time for completed items
  const completedItems = items.filter((i) => i.reviewedAt && i.status === 'approved');
  let averageReviewTime: number | undefined;
  
  if (completedItems.length > 0) {
    const totalTime = completedItems.reduce(
      (sum, item) => sum + (item.reviewedAt!.getTime() - item.createdAt.getTime()),
      0
    );
    averageReviewTime = Math.round(totalTime / completedItems.length / (1000 * 60 * 60)); // in hours
  }
  
  return {
    total: items.length,
    pending,
    inReview,
    approved,
    rejected,
    byPriority,
    byLocale,
    byType,
    unassigned,
    overdue,
    averageReviewTime,
  };
}

/**
 * Gets items assigned to a specific reviewer
 */
export function getReviewerQueue(reviewerId: string): QueueItem[] {
  return getQueueItems({ assignedTo: reviewerId });
}

/**
 * Gets high priority items that need immediate attention
 */
export function getUrgentItems(): QueueItem[] {
  return getQueueItems(
    { priority: 'urgent', status: 'pending' },
    { sortBy: 'date' }
  );
}

/**
 * Bulk assigns multiple items to a reviewer
 */
export function bulkAssignToReviewer(itemIds: string[], reviewerId: string): QueueItem[] {
  return itemIds
    .map((id) => {
      try {
        return assignToReviewer(id, reviewerId);
      } catch {
        return null;
      }
    })
    .filter((item): item is QueueItem => item !== null);
}

/**
 * Bulk updates status for multiple items
 */
export function bulkUpdateStatus(
  itemIds: string[],
  status: ReviewStatus,
  options: { reviewerId?: string; reviewNotes?: string } = {}
): QueueItem[] {
  return itemIds
    .map((id) => {
      try {
        return updateItemStatus(id, status, options);
      } catch {
        return null;
      }
    })
    .filter((item): item is QueueItem => item !== null);
}

/**
 * Clears all items from the queue (useful for testing)
 */
export function clearQueue(): void {
  queueItems.clear();
}

/**
 * Gets items that are waiting for review the longest
 */
export function getOldestPendingItems(limit: number = 10): QueueItem[] {
  return getQueueItems(
    { status: 'pending' },
    { sortBy: 'date', limit }
  ).reverse();
}

/**
 * Reassigns all items from one reviewer to another
 */
export function reassignReviewerItems(
  fromReviewerId: string,
  toReviewerId: string
): number {
  const items = getQueueItems({ assignedTo: fromReviewerId });
  items.forEach((item) => {
    item.assignedTo = toReviewerId;
    item.updatedAt = new Date();
  });
  return items.length;
}

// Export constants for testing
export { PRIORITY_WEIGHTS, VALID_TRANSITIONS };
