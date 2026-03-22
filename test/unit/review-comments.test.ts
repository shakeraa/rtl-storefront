import { describe, it, expect, beforeEach } from 'vitest';
import {
  addComment,
  getComments,
  getCommentThreads,
  resolveComment,
  reopenComment,
  closeComment,
  updateComment,
  deleteComment,
  getCommentById,
  getCommentStats,
  getMentionsForUser,
  clearAllComments,
  getTotalCommentCount,
  CommentCategory,
} from '../../app/services/translation-features/review-comments';

describe('Translation Review Comments Service', () => {
  beforeEach(() => {
    clearAllComments();
  });

  describe('addComment', () => {
    it('creates a basic comment with required fields', () => {
      const comment = addComment('item-1', {
        author: 'user1',
        content: 'This translation looks good!',
      });

      expect(comment.id).toBeDefined();
      expect(comment.itemId).toBe('item-1');
      expect(comment.author).toBe('user1');
      expect(comment.content).toBe('This translation looks good!');
      expect(comment.category).toBe('general');
      expect(comment.status).toBe('open');
      expect(comment.parentId).toBeNull();
      expect(comment.createdAt).toBeInstanceOf(Date);
    });

    it('creates a comment with category', () => {
      const comment = addComment('item-1', {
        author: 'user1',
        content: 'Fix this translation',
        category: 'issue',
      });

      expect(comment.category).toBe('issue');
    });

    it('creates a comment with all categories', () => {
      const categories: CommentCategory[] = ['suggestion', 'issue', 'approval', 'general', 'question'];
      
      for (const category of categories) {
        const comment = addComment('item-1', {
          author: 'user1',
          content: `Test ${category}`,
          category,
        });
        expect(comment.category).toBe(category);
      }
    });

    it('creates a reply comment with parentId', () => {
      const parent = addComment('item-1', {
        author: 'user1',
        content: 'Original comment',
      });

      const reply = addComment('item-1', {
        author: 'user2',
        content: 'Reply to comment',
        parentId: parent.id,
      });

      expect(reply.parentId).toBe(parent.id);
    });

    it('throws error when itemId is empty', () => {
      expect(() => addComment('', { author: 'user1', content: 'Test' })).toThrow('Item ID is required');
    });

    it('throws error when author is empty', () => {
      expect(() => addComment('item-1', { author: '', content: 'Test' })).toThrow('Author is required');
    });

    it('throws error when content is empty', () => {
      expect(() => addComment('item-1', { author: 'user1', content: '' })).toThrow('Content is required');
    });

    it('throws error when parent comment not found', () => {
      expect(() => addComment('item-1', {
        author: 'user1',
        content: 'Reply',
        parentId: 'non-existent-id',
      })).toThrow('Parent comment not found');
    });

    it('throws error when parent belongs to different item', () => {
      const parent = addComment('item-1', {
        author: 'user1',
        content: 'Original',
      });

      expect(() => addComment('item-2', {
        author: 'user2',
        content: 'Reply',
        parentId: parent.id,
      })).toThrow('Parent comment belongs to a different item');
    });

    it('extracts mentions from content automatically', () => {
      const comment = addComment('item-1', {
        author: 'user1',
        content: 'Hey @user2 and @user3, please review this',
      });

      expect(comment.mentions).toContain('user2');
      expect(comment.mentions).toContain('user3');
      expect(comment.mentions).toHaveLength(2);
    });

    it('accepts explicit mentions array', () => {
      const comment = addComment('item-1', {
        author: 'user1',
        content: 'Please review',
        mentions: ['user2', 'user3'],
      });

      expect(comment.mentions).toContain('user2');
      expect(comment.mentions).toContain('user3');
    });

    it('stores metadata with comment', () => {
      const comment = addComment('item-1', {
        author: 'user1',
        content: 'Test',
        metadata: { lineNumber: 10, priority: 'high' },
      });

      expect(comment.metadata.lineNumber).toBe(10);
      expect(comment.metadata.priority).toBe('high');
    });

    it('trims whitespace from author and content', () => {
      const comment = addComment('item-1', {
        author: '  user1  ',
        content: '  Test content  ',
      });

      expect(comment.author).toBe('user1');
      expect(comment.content).toBe('Test content');
    });
  });

  describe('getComments', () => {
    it('returns empty array for item with no comments', () => {
      const comments = getComments('non-existent-item');
      expect(comments).toEqual([]);
    });

    it('returns all comments for an item', () => {
      addComment('item-1', { author: 'user1', content: 'Comment 1' });
      addComment('item-1', { author: 'user2', content: 'Comment 2' });
      addComment('item-1', { author: 'user3', content: 'Comment 3' });

      const comments = getComments('item-1');
      expect(comments).toHaveLength(3);
    });

    it('returns comments sorted by creation date', () => {
      const comment1 = addComment('item-1', { author: 'user1', content: 'First' });
      const comment2 = addComment('item-1', { author: 'user2', content: 'Second' });
      const comment3 = addComment('item-1', { author: 'user3', content: 'Third' });

      const comments = getComments('item-1');
      expect(comments[0].id).toBe(comment1.id);
      expect(comments[1].id).toBe(comment2.id);
      expect(comments[2].id).toBe(comment3.id);
    });

    it('filters comments by category', () => {
      addComment('item-1', { author: 'user1', content: 'Issue 1', category: 'issue' });
      addComment('item-1', { author: 'user2', content: 'Suggestion 1', category: 'suggestion' });
      addComment('item-1', { author: 'user3', content: 'Issue 2', category: 'issue' });

      const issues = getComments('item-1', { category: 'issue' });
      expect(issues).toHaveLength(2);
      expect(issues.every(c => c.category === 'issue')).toBe(true);
    });

    it('filters comments by status', () => {
      const comment1 = addComment('item-1', { author: 'user1', content: 'Open comment' });
      const comment2 = addComment('item-1', { author: 'user2', content: 'To resolve' });
      resolveComment(comment2.id, 'user1');

      const openComments = getComments('item-1', { status: 'open' });
      expect(openComments).toHaveLength(1);
      expect(openComments[0].id).toBe(comment1.id);
    });

    it('filters comments by author', () => {
      addComment('item-1', { author: 'alice', content: 'Comment 1' });
      addComment('item-1', { author: 'bob', content: 'Comment 2' });
      addComment('item-1', { author: 'alice', content: 'Comment 3' });

      const aliceComments = getComments('item-1', { author: 'alice' });
      expect(aliceComments).toHaveLength(2);
    });

    it('filters comments by date range', () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-06-01');

      const comment1 = addComment('item-1', { author: 'user1', content: 'Old' });
      Object.assign(comment1, { createdAt: oldDate });

      const comment2 = addComment('item-1', { author: 'user2', content: 'New' });
      Object.assign(comment2, { createdAt: newDate });

      const fromDate = new Date('2024-03-01');
      const recentComments = getComments('item-1', { fromDate });
      expect(recentComments.some(c => c.id === comment2.id)).toBe(true);
    });

    it('returns empty array for empty itemId', () => {
      expect(getComments('')).toEqual([]);
    });

    it('isolates comments between different items', () => {
      addComment('item-1', { author: 'user1', content: 'Comment for item 1' });
      addComment('item-2', { author: 'user2', content: 'Comment for item 2' });

      const item1Comments = getComments('item-1');
      expect(item1Comments).toHaveLength(1);
      expect(item1Comments[0].content).toBe('Comment for item 1');
    });
  });

  describe('getCommentThreads', () => {
    it('returns empty array for item with no comments', () => {
      const threads = getCommentThreads('non-existent-item');
      expect(threads).toEqual([]);
    });

    it('creates thread from single root comment', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Root' });

      const threads = getCommentThreads('item-1');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toBe(comment.id);
      expect(threads[0].rootComment.id).toBe(comment.id);
      expect(threads[0].replies).toHaveLength(0);
      expect(threads[0].replyCount).toBe(0);
    });

    it('organizes replies under correct thread', () => {
      const root = addComment('item-1', { author: 'user1', content: 'Root' });
      const reply1 = addComment('item-1', { author: 'user2', content: 'Reply 1', parentId: root.id });
      const reply2 = addComment('item-1', { author: 'user3', content: 'Reply 2', parentId: root.id });

      const threads = getCommentThreads('item-1');
      expect(threads).toHaveLength(1);
      expect(threads[0].replies).toHaveLength(2);
      expect(threads[0].replyCount).toBe(2);
    });

    it('handles nested replies correctly', () => {
      const root = addComment('item-1', { author: 'user1', content: 'Root' });
      const reply1 = addComment('item-1', { author: 'user2', content: 'Reply 1', parentId: root.id });
      const nestedReply = addComment('item-1', { author: 'user3', content: 'Nested', parentId: reply1.id });

      const threads = getCommentThreads('item-1');
      expect(threads[0].replies).toHaveLength(2);
    });

    it('sorts threads by last activity', () => {
      const thread1 = addComment('item-1', { author: 'user1', content: 'Thread 1' });
      const thread2 = addComment('item-1', { author: 'user2', content: 'Thread 2' });
      
      addComment('item-1', { author: 'user3', content: 'Reply', parentId: thread1.id });

      const threads = getCommentThreads('item-1');
      expect(threads[0].id).toBe(thread1.id);
      expect(threads[1].id).toBe(thread2.id);
    });

    it('excludes resolved threads when includeResolved is false', () => {
      const openThread = addComment('item-1', { author: 'user1', content: 'Open' });
      const resolvedThread = addComment('item-1', { author: 'user2', content: 'To resolve' });
      resolveComment(resolvedThread.id, 'user1');

      const threads = getCommentThreads('item-1', false);
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toBe(openThread.id);
    });

    it('includes resolved threads by default', () => {
      addComment('item-1', { author: 'user1', content: 'Comment' });
      const resolved = addComment('item-1', { author: 'user2', content: 'To resolve' });
      resolveComment(resolved.id, 'user1');

      const threads = getCommentThreads('item-1');
      expect(threads).toHaveLength(2);
    });

    it('tracks thread status from root comment', () => {
      const root = addComment('item-1', { author: 'user1', content: 'Root' });
      addComment('item-1', { author: 'user2', content: 'Reply', parentId: root.id });
      resolveComment(root.id, 'user1');

      const threads = getCommentThreads('item-1');
      expect(threads[0].status).toBe('resolved');
    });
  });

  describe('resolveComment', () => {
    it('resolves a comment successfully', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'To resolve' });
      const resolved = resolveComment(comment.id, 'user2');

      expect(resolved).not.toBeNull();
      expect(resolved!.status).toBe('resolved');
      expect(resolved!.resolvedBy).toBe('user2');
      expect(resolved!.resolvedAt).toBeInstanceOf(Date);
    });

    it('returns null for non-existent comment', () => {
      const result = resolveComment('non-existent', 'user1');
      expect(result).toBeNull();
    });

    it('throws error when resolver name is empty', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      expect(() => resolveComment(comment.id, '')).toThrow('Resolver name is required');
    });

    it('updates the comment in store', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      resolveComment(comment.id, 'user2');

      const retrieved = getCommentById(comment.id);
      expect(retrieved!.status).toBe('resolved');
    });

    it('returns null for empty commentId', () => {
      expect(resolveComment('', 'user1')).toBeNull();
    });
  });

  describe('reopenComment', () => {
    it('reopens a resolved comment', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      resolveComment(comment.id, 'user2');
      const reopened = reopenComment(comment.id);

      expect(reopened!.status).toBe('open');
      expect(reopened!.resolvedAt).toBeNull();
      expect(reopened!.resolvedBy).toBeNull();
    });

    it('returns null for non-existent comment', () => {
      expect(reopenComment('non-existent')).toBeNull();
    });

    it('returns null for empty commentId', () => {
      expect(reopenComment('')).toBeNull();
    });
  });

  describe('closeComment', () => {
    it('closes a comment without resolving', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      const closed = closeComment(comment.id);

      expect(closed!.status).toBe('closed');
      expect(closed!.resolvedAt).toBeNull();
      expect(closed!.resolvedBy).toBeNull();
    });

    it('returns null for non-existent comment', () => {
      expect(closeComment('non-existent')).toBeNull();
    });

    it('returns null for empty commentId', () => {
      expect(closeComment('')).toBeNull();
    });
  });

  describe('updateComment', () => {
    it('updates comment content', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Original' });
      const beforeUpdate = new Date();
      const updated = updateComment(comment.id, { content: 'Updated' });

      expect(updated!.content).toBe('Updated');
      expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('updates comment category', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test', category: 'general' });
      const updated = updateComment(comment.id, { category: 'issue' });

      expect(updated!.category).toBe('issue');
    });

    it('updates comment metadata', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test', metadata: { key: 'value' } });
      const updated = updateComment(comment.id, { metadata: { newKey: 'newValue' } });

      expect(updated!.metadata.key).toBe('value');
      expect(updated!.metadata.newKey).toBe('newValue');
    });

    it('re-extracts mentions when content changes', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Hello' });
      const updated = updateComment(comment.id, { content: 'Hey @user2' });

      expect(updated!.mentions).toContain('user2');
    });

    it('throws error when updating resolved comment', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      resolveComment(comment.id, 'user2');

      expect(() => updateComment(comment.id, { content: 'New' })).toThrow('Cannot update a resolved comment');
    });

    it('returns null for non-existent comment', () => {
      expect(updateComment('non-existent', { content: 'New' })).toBeNull();
    });

    it('returns null for empty commentId', () => {
      expect(updateComment('', { content: 'New' })).toBeNull();
    });

    it('trims updated content', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Original' });
      const updated = updateComment(comment.id, { content: '  Updated  ' });

      expect(updated!.content).toBe('Updated');
    });
  });

  describe('deleteComment', () => {
    it('deletes a comment', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'To delete' });
      const result = deleteComment(comment.id);

      expect(result).toBe(true);
      expect(getCommentById(comment.id)).toBeNull();
    });

    it('deletes comment and its replies', () => {
      const root = addComment('item-1', { author: 'user1', content: 'Root' });
      const reply = addComment('item-1', { author: 'user2', content: 'Reply', parentId: root.id });

      deleteComment(root.id);

      expect(getCommentById(root.id)).toBeNull();
      expect(getCommentById(reply.id)).toBeNull();
    });

    it('returns false for non-existent comment', () => {
      expect(deleteComment('non-existent')).toBe(false);
    });

    it('returns false for empty commentId', () => {
      expect(deleteComment('')).toBe(false);
    });

    it('removes comment from item index', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      deleteComment(comment.id);

      const comments = getComments('item-1');
      expect(comments).toHaveLength(0);
    });
  });

  describe('getCommentById', () => {
    it('returns comment by ID', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      const retrieved = getCommentById(comment.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(comment.id);
    });

    it('returns null for non-existent ID', () => {
      expect(getCommentById('non-existent')).toBeNull();
    });

    it('returns null for empty ID', () => {
      expect(getCommentById('')).toBeNull();
    });
  });

  describe('getCommentStats', () => {
    it('returns zero stats for item with no comments', () => {
      const stats = getCommentStats('item-1');
      expect(stats.total).toBe(0);
      expect(stats.open).toBe(0);
      expect(stats.resolved).toBe(0);
      expect(stats.closed).toBe(0);
      expect(stats.threads).toBe(0);
    });

    it('counts total comments correctly', () => {
      addComment('item-1', { author: 'user1', content: 'Comment 1' });
      addComment('item-1', { author: 'user2', content: 'Comment 2' });

      const stats = getCommentStats('item-1');
      expect(stats.total).toBe(2);
    });

    it('counts status correctly', () => {
      const open1 = addComment('item-1', { author: 'user1', content: 'Open 1' });
      const open2 = addComment('item-1', { author: 'user2', content: 'Open 2' });
      const toResolve = addComment('item-1', { author: 'user3', content: 'To resolve' });
      const toClose = addComment('item-1', { author: 'user4', content: 'To close' });

      resolveComment(toResolve.id, 'user1');
      closeComment(toClose.id);

      const stats = getCommentStats('item-1');
      expect(stats.open).toBe(2);
      expect(stats.resolved).toBe(1);
      expect(stats.closed).toBe(1);
    });

    it('counts threads correctly', () => {
      const root1 = addComment('item-1', { author: 'user1', content: 'Root 1' });
      addComment('item-1', { author: 'user2', content: 'Root 2' });
      addComment('item-1', { author: 'user3', content: 'Reply', parentId: root1.id });

      const stats = getCommentStats('item-1');
      expect(stats.threads).toBe(2);
    });

    it('counts by category correctly', () => {
      addComment('item-1', { author: 'user1', content: 'Issue', category: 'issue' });
      addComment('item-1', { author: 'user2', content: 'Issue 2', category: 'issue' });
      addComment('item-1', { author: 'user3', content: 'Suggestion', category: 'suggestion' });
      addComment('item-1', { author: 'user4', content: 'Question', category: 'question' });

      const stats = getCommentStats('item-1');
      expect(stats.byCategory.issue).toBe(2);
      expect(stats.byCategory.suggestion).toBe(1);
      expect(stats.byCategory.question).toBe(1);
      expect(stats.byCategory.approval).toBe(0);
      expect(stats.byCategory.general).toBe(0);
    });
  });

  describe('getMentionsForUser', () => {
    it('returns comments mentioning user', () => {
      addComment('item-1', { author: 'user1', content: 'Hey @alice check this' });
      addComment('item-1', { author: 'user2', content: '@alice please review' });
      addComment('item-1', { author: 'user3', content: 'No mention here' });

      const mentions = getMentionsForUser('alice');
      expect(mentions).toHaveLength(2);
    });

    it('returns empty array when no mentions found', () => {
      addComment('item-1', { author: 'user1', content: 'Hello world' });

      const mentions = getMentionsForUser('nonexistent');
      expect(mentions).toEqual([]);
    });

    it('returns empty array for empty username', () => {
      expect(getMentionsForUser('')).toEqual([]);
    });

    it('sorts mentions by date (most recent first)', () => {
      const comment1 = addComment('item-1', { author: 'user1', content: '@alice first' });
      const start = Date.now();
      while (Date.now() - start < 5) { /* busy wait */ }
      const comment2 = addComment('item-1', { author: 'user2', content: '@alice second' });

      const mentions = getMentionsForUser('alice');
      expect(mentions.length).toBe(2);
      expect(mentions[0].createdAt.getTime()).toBeGreaterThanOrEqual(mentions[1].createdAt.getTime());
    });
  });

  describe('clearAllComments', () => {
    it('clears all comments', () => {
      addComment('item-1', { author: 'user1', content: 'Comment 1' });
      addComment('item-2', { author: 'user2', content: 'Comment 2' });

      clearAllComments();

      expect(getComments('item-1')).toEqual([]);
      expect(getComments('item-2')).toEqual([]);
    });

    it('resets total count to zero', () => {
      addComment('item-1', { author: 'user1', content: 'Test' });
      clearAllComments();

      expect(getTotalCommentCount()).toBe(0);
    });
  });

  describe('getTotalCommentCount', () => {
    it('returns zero when no comments', () => {
      expect(getTotalCommentCount()).toBe(0);
    });

    it('returns correct count of all comments', () => {
      addComment('item-1', { author: 'user1', content: 'Comment 1' });
      addComment('item-1', { author: 'user2', content: 'Comment 2' });
      addComment('item-2', { author: 'user3', content: 'Comment 3' });

      expect(getTotalCommentCount()).toBe(3);
    });

    it('decreases count after deletion', () => {
      const comment = addComment('item-1', { author: 'user1', content: 'Test' });
      expect(getTotalCommentCount()).toBe(1);

      deleteComment(comment.id);
      expect(getTotalCommentCount()).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles multiple items independently', () => {
      const item1Comment = addComment('item-1', { author: 'user1', content: 'Item 1 comment' });
      const item2Comment = addComment('item-2', { author: 'user2', content: 'Item 2 comment' });

      expect(getComments('item-1')).toHaveLength(1);
      expect(getComments('item-2')).toHaveLength(1);
      expect(getComments('item-1')[0].id).toBe(item1Comment.id);
      expect(getComments('item-2')[0].id).toBe(item2Comment.id);
    });

    it('handles very long content', () => {
      const longContent = 'a'.repeat(10000);
      const comment = addComment('item-1', { author: 'user1', content: longContent });

      expect(comment.content).toBe(longContent);
    });

    it('handles special characters in content', () => {
      const content = 'Special chars: @#$%^&*() 🎉 تاريخ מבחן';
      const comment = addComment('item-1', { author: 'user1', content });

      expect(comment.content).toBe(content);
    });

    it('deduplicates mentions', () => {
      const comment = addComment('item-1', { author: 'user1', content: '@alice @alice @bob @alice' });

      expect(comment.mentions).toHaveLength(2);
      expect(comment.mentions).toContain('alice');
      expect(comment.mentions).toContain('bob');
    });

    it('preserves original case in mentions', () => {
      const comment = addComment('item-1', { author: 'user1', content: '@Alice @BOB @charlie' });

      expect(comment.mentions).toContain('Alice');
      expect(comment.mentions).toContain('BOB');
      expect(comment.mentions).toContain('charlie');
    });
  });
});
