import { describe, expect, it } from 'vitest';
import { createContentFingerprint } from './contentFingerprint';
import { findDuplicateCandidatesFromBookmarks } from './duplicateDetection';
import type { BookmarkItem } from '../types/bookmark';

function bookmark(overrides: Partial<BookmarkItem>): BookmarkItem {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    source: 'manual-text',
    sourceUrl: overrides.sourceUrl,
    canonicalUrl: overrides.canonicalUrl,
    contentFingerprint: overrides.contentFingerprint,
    originalText: overrides.originalText ?? 'Bitcoin self custody wallet fees and security',
    title: overrides.title ?? 'Bitcoin wallet note',
    summary: '',
    tagIds: [],
    difficultyExplanation: {
      easy: '',
      medium: '',
      advanced: ''
    },
    aiMeta: {
      needsReview: false
    },
    status: 'unread',
    importance: 'medium',
    userMemo: '',
    createdAt: overrides.createdAt ?? '2026-07-06T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-07-06T00:00:00.000Z'
  };
}

describe('duplicate detection', () => {
  it('returns candidates for the same canonical URL', () => {
    const candidates = findDuplicateCandidatesFromBookmarks(
      [
        bookmark({
          id: 'existing',
          canonicalUrl: 'https://x.com/i/status/123',
          sourceUrl: 'https://twitter.com/a/status/123'
        })
      ],
      { sourceUrl: 'https://x.com/b/status/123' }
    );

    expect(candidates[0]).toMatchObject({
      bookmarkId: 'existing',
      matchType: 'canonical_url',
      score: 1
    });
  });

  it('returns candidates for the exact same source URL', () => {
    const candidates = findDuplicateCandidatesFromBookmarks(
      [bookmark({ id: 'existing', sourceUrl: 'https://example.com/post' })],
      { sourceUrl: 'https://example.com/post' }
    );

    expect(candidates[0]?.matchType).toBe('exact_url');
  });

  it('returns candidates for similar content', () => {
    const text = 'Bitcoin self custody wallet fees and security tradeoffs';
    const candidates = findDuplicateCandidatesFromBookmarks(
      [bookmark({ id: 'existing', originalText: text, contentFingerprint: createContentFingerprint({ originalText: text }) })],
      { originalText: 'Security and wallet fees for bitcoin self custody' }
    );

    expect(candidates[0]?.matchType).toBe('content_similarity');
    expect(candidates[0]?.score).toBeGreaterThan(0.82);
  });

  it('excludes the provided bookmark id', () => {
    const candidates = findDuplicateCandidatesFromBookmarks(
      [bookmark({ id: 'same', sourceUrl: 'https://example.com/post' })],
      { sourceUrl: 'https://example.com/post', excludeBookmarkId: 'same' }
    );

    expect(candidates).toHaveLength(0);
  });

  it('sorts by match strength and limits results to five', () => {
    const candidates = findDuplicateCandidatesFromBookmarks(
      [
        bookmark({ id: 'similar-1', originalText: 'Bitcoin wallet fees security custody', updatedAt: '2026-07-06T00:01:00.000Z' }),
        bookmark({ id: 'canonical', canonicalUrl: 'https://x.com/i/status/999', updatedAt: '2026-07-06T00:00:00.000Z' }),
        bookmark({ id: 'similar-2', originalText: 'Bitcoin wallet fees security custody self', updatedAt: '2026-07-06T00:02:00.000Z' }),
        bookmark({ id: 'similar-3', originalText: 'Bitcoin wallet fees security custody backup', updatedAt: '2026-07-06T00:03:00.000Z' }),
        bookmark({ id: 'similar-4', originalText: 'Bitcoin wallet fees security custody hardware', updatedAt: '2026-07-06T00:04:00.000Z' }),
        bookmark({ id: 'similar-5', originalText: 'Bitcoin wallet fees security custody mobile', updatedAt: '2026-07-06T00:05:00.000Z' })
      ],
      { sourceUrl: 'https://twitter.com/a/status/999', originalText: 'Bitcoin wallet fees security custody' }
    );

    expect(candidates).toHaveLength(5);
    expect(candidates[0].bookmarkId).toBe('canonical');
  });
});
