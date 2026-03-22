/**
 * Translation Review Comments Service
 * Provides threaded commenting system for translation reviews
 * Supports comment categories, resolution tracking, and discussions
 */

export type CommentCategory = 'suggestion' | 'issue' | 'approval' | 'general' | 'question';
export type CommentStatus = 'open' | 'resolved' | 'closed';

export interface Comment {
  id: string;
  itemId: string;
  parentId: string | null;
  author: string;
  content: string;
  category: CommentCategory;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  mentions: string[];
  metadata: Record<string, unknown>;
}

export interface CommentThread {
  id: string;
  itemId: string;
  rootComment: Comment;
  replies: Comment[];
  replyCount: number;
  status: CommentStatus;
  lastActivityAt: Date;
}

export interface CommentInput {
  author: string;
  content: string;
  category?: CommentCategory;
  parentId?: string | null;
  mentions?: string[];
  metadata?: Record<string, unknown>;
}

export interface CommentFilters {
  category?: CommentCategory;
  status?: CommentStatus;
  author?: string;
  fromDate?: Date;
  toDate?: Date;
}

const commentsStore: Map<string, Comment> = new Map();
const itemCommentsIndex: Map<string, Set<string>> = new Map();

function generateId(): string {
  return `comment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)];
}

function indexCommentByItem(itemId: string, commentId: string): void {
  if (!itemCommentsIndex.has(itemId)) {
    itemCommentsIndex.set(itemId, new Set());
  }
  itemCommentsIndex.get(itemId)!.add(commentId);
}

function removeFromIndex(itemId: string, commentId: string): void {
  const index = itemCommentsIndex.get(itemId);
  if (index) {
    index.delete(commentId);
    if (index.size === 0) {
      itemCommentsIndex.delete(itemId);
    }
  }
}

export function addComment(itemId: string, comment: CommentInput): Comment {
  if (!itemId || itemId.trim() === '') {
    throw new Error('Item ID is required');
  }

  if (!comment.author || comment.author.trim() === '') {
    throw new Error('Author is required');
  }

  if (!comment.content || comment.content.trim() === '') {
    throw new Error('Content is required');
  }

  if (comment.parentId) {
    const parentComment = commentsStore.get(comment.parentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }
    if (parentComment.itemId !== itemId) {
      throw new Error('Parent comment belongs to a different item');
    }
  }

  const now = new Date();
  const mentions = comment.mentions || extractMentions(comment.content);

  const newComment: Comment = {
    id: generateId(),
    itemId,
    parentId: comment.parentId || null,
    author: comment.author.trim(),
    content: comment.content.trim(),
    category: comment.category || 'general',
    status: 'open',
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    resolvedBy: null,
    mentions,
    metadata: comment.metadata || {},
  };

  commentsStore.set(newComment.id, newComment);
  indexCommentByItem(itemId, newComment.id);

  return newComment;
}

export function getComments(itemId: string, filters?: CommentFilters): Comment[] {
  if (!itemId) {
    return [];
  }

  const commentIds = itemCommentsIndex.get(itemId);
  if (!commentIds || commentIds.size === 0) {
    return [];
  }

  let comments: Comment[] = [];
  for (const commentId of commentIds) {
    const comment = commentsStore.get(commentId);
    if (comment) {
      comments.push(comment);
    }
  }

  if (filters) {
    if (filters.category) {
      comments = comments.filter(c => c.category === filters.category);
    }
    if (filters.status) {
      comments = comments.filter(c => c.status === filters.status);
    }
    if (filters.author) {
      comments = comments.filter(c => c.author === filters.author);
    }
    if (filters.fromDate) {
      comments = comments.filter(c => c.createdAt >= filters.fromDate!);
    }
    if (filters.toDate) {
      comments = comments.filter(c => c.createdAt <= filters.toDate!);
    }
  }

  return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function getCommentThreads(itemId: string, includeResolved = true): CommentThread[] {
  if (!itemId) {
    return [];
  }

  const allComments = getComments(itemId);
  if (allComments.length === 0) {
    return [];
  }

  const threadMap = new Map<string, Comment[]>();

  for (const comment of allComments) {
    if (comment.parentId) {
      continue;
    }
    if (!threadMap.has(comment.id)) {
      threadMap.set(comment.id, []);
    }
  }

  for (const comment of allComments) {
    if (comment.parentId) {
      let rootId = comment.parentId;
      let parent = commentsStore.get(rootId);
      while (parent?.parentId) {
        rootId = parent.parentId;
        parent = commentsStore.get(rootId);
      }

      if (threadMap.has(rootId)) {
        threadMap.get(rootId)!.push(comment);
      }
    }
  }

  const threads: CommentThread[] = [];
  for (const [rootId, replies] of threadMap) {
    const rootComment = commentsStore.get(rootId);
    if (!rootComment) continue;

    if (!includeResolved && rootComment.status === 'resolved') {
      continue;
    }

    const sortedReplies = replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const status = rootComment.status;
    const lastReply = sortedReplies.length > 0 ? sortedReplies[sortedReplies.length - 1] : null;
    const lastActivityAt = lastReply ? lastReply.createdAt : rootComment.createdAt;

    threads.push({
      id: rootId,
      itemId,
      rootComment,
      replies: sortedReplies,
      replyCount: sortedReplies.length,
      status,
      lastActivityAt,
    });
  }

  return threads.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
}

export function resolveComment(commentId: string, resolvedBy: string): Comment | null {
  if (!commentId) {
    return null;
  }

  if (!resolvedBy || resolvedBy.trim() === '') {
    throw new Error('Resolver name is required');
  }

  const comment = commentsStore.get(commentId);
  if (!comment) {
    return null;
  }

  const now = new Date();
  const updatedComment: Comment = {
    ...comment,
    status: 'resolved',
    resolvedAt: now,
    resolvedBy: resolvedBy.trim(),
    updatedAt: now,
  };

  commentsStore.set(commentId, updatedComment);
  return updatedComment;
}

export function reopenComment(commentId: string): Comment | null {
  if (!commentId) {
    return null;
  }

  const comment = commentsStore.get(commentId);
  if (!comment) {
    return null;
  }

  const updatedComment: Comment = {
    ...comment,
    status: 'open',
    resolvedAt: null,
    resolvedBy: null,
    updatedAt: new Date(),
  };

  commentsStore.set(commentId, updatedComment);
  return updatedComment;
}

export function closeComment(commentId: string): Comment | null {
  if (!commentId) {
    return null;
  }

  const comment = commentsStore.get(commentId);
  if (!comment) {
    return null;
  }

  const updatedComment: Comment = {
    ...comment,
    status: 'closed',
    updatedAt: new Date(),
  };

  commentsStore.set(commentId, updatedComment);
  return updatedComment;
}

export function updateComment(
  commentId: string,
  updates: Partial<Pick<CommentInput, 'content' | 'category' | 'metadata'>>
): Comment | null {
  if (!commentId) {
    return null;
  }

  const comment = commentsStore.get(commentId);
  if (!comment) {
    return null;
  }

  if (comment.status === 'resolved') {
    throw new Error('Cannot update a resolved comment');
  }

  const updatedComment: Comment = {
    ...comment,
    ...(updates.content !== undefined && { content: updates.content.trim() }),
    ...(updates.category !== undefined && { category: updates.category }),
    ...(updates.metadata !== undefined && { metadata: { ...comment.metadata, ...updates.metadata } }),
    updatedAt: new Date(),
  };

  if (updates.content !== undefined) {
    updatedComment.mentions = extractMentions(updatedComment.content);
  }

  commentsStore.set(commentId, updatedComment);
  return updatedComment;
}

export function deleteComment(commentId: string): boolean {
  if (!commentId) {
    return false;
  }

  const comment = commentsStore.get(commentId);
  if (!comment) {
    return false;
  }

  const allComments = getComments(comment.itemId);
  for (const c of allComments) {
    if (c.parentId === commentId) {
      commentsStore.delete(c.id);
      removeFromIndex(comment.itemId, c.id);
    }
  }

  commentsStore.delete(commentId);
  removeFromIndex(comment.itemId, commentId);

  return true;
}

export function getCommentById(commentId: string): Comment | null {
  if (!commentId) {
    return null;
  }
  return commentsStore.get(commentId) || null;
}

export function getCommentStats(itemId: string): {
  total: number;
  open: number;
  resolved: number;
  closed: number;
  threads: number;
  byCategory: Record<CommentCategory, number>;
} {
  const comments = getComments(itemId);
  const threads = getCommentThreads(itemId, true);

  const byCategory: Record<CommentCategory, number> = {
    suggestion: 0,
    issue: 0,
    approval: 0,
    general: 0,
    question: 0,
  };

  for (const comment of comments) {
    byCategory[comment.category]++;
  }

  return {
    total: comments.length,
    open: comments.filter(c => c.status === 'open').length,
    resolved: comments.filter(c => c.status === 'resolved').length,
    closed: comments.filter(c => c.status === 'closed').length,
    threads: threads.length,
    byCategory,
  };
}

export function getMentionsForUser(username: string): Comment[] {
  if (!username) {
    return [];
  }

  const mentions: Comment[] = [];
  for (const comment of commentsStore.values()) {
    if (comment.mentions.includes(username)) {
      mentions.push(comment);
    }
  }

  return mentions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function clearAllComments(): void {
  commentsStore.clear();
  itemCommentsIndex.clear();
}

export function getTotalCommentCount(): number {
  return commentsStore.size;
}

export { commentsStore, itemCommentsIndex };
