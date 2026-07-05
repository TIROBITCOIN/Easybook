import { describe, expect, it } from 'vitest';
import type { AnalysisQueueItem } from './analysisQueueTypes';
import {
  countStartedToday,
  isBookmarkAnalysisComplete,
  truncateAnalysisText
} from './analysisLimits';
import type { BookmarkItem } from '../types/bookmark';

function queueItem(startedAt?: string): AnalysisQueueItem {
  return {
    id: crypto.randomUUID(),
    bookmarkId: 'bookmark-1',
    status: startedAt ? 'succeeded' : 'queued',
    priority: 'normal',
    attempts: startedAt ? 1 : 0,
    maxAttempts: 3,
    scheduledAt: '2026-07-06T00:00:00.000Z',
    startedAt,
    createdAt: '2026-07-06T00:00:00.000Z',
    updatedAt: '2026-07-06T00:00:00.000Z'
  };
}

function bookmark(explanation: Partial<BookmarkItem['difficultyExplanation']>): BookmarkItem {
  return {
    id: 'bookmark-1',
    source: 'manual-text',
    originalText: 'body',
    title: 'title',
    summary: '',
    tagIds: [],
    difficultyExplanation: {
      easy: explanation.easy ?? '',
      medium: explanation.medium ?? '',
      advanced: explanation.advanced ?? ''
    },
    aiMeta: {
      needsReview: false
    },
    status: 'unread',
    importance: 'medium',
    userMemo: '',
    createdAt: '2026-07-06T00:00:00.000Z',
    updatedAt: '2026-07-06T00:00:00.000Z'
  };
}

describe('analysis limits', () => {
  it('counts only queue items started on the local day', () => {
    const items = [
      queueItem('2026-07-06T00:05:00.000Z'),
      queueItem('2026-07-06T23:55:00.000Z'),
      queueItem('2026-07-05T23:59:00.000Z'),
      queueItem()
    ];

    expect(countStartedToday(items, new Date('2026-07-06T12:00:00.000Z'))).toBe(2);
  });

  it('treats a bookmark as complete only when all difficulty levels exist', () => {
    expect(isBookmarkAnalysisComplete(bookmark({ easy: 'easy', medium: 'medium', advanced: 'advanced' }))).toBe(true);
    expect(isBookmarkAnalysisComplete(bookmark({ easy: 'easy', medium: 'medium' }))).toBe(false);
  });

  it('truncates only the analysis input text and keeps a note for the prompt', () => {
    const result = truncateAnalysisText('abcdef', 4);

    expect(result.originalText).toBe('abcd');
    expect(result.wasTruncated).toBe(true);
    expect(result.note).toContain('4');
  });
});
