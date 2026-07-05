import { createContentFingerprint, calculateTextSimilarity } from './contentFingerprint';
import { normalizeUrlForDuplicateCheck } from './urlNormalization';
import { db } from '../db/db';
import type { BookmarkItem } from '../types/bookmark';
import type { DuplicateCandidate, DuplicateMatchType } from './duplicateTypes';

const SIMILARITY_THRESHOLD = 0.82;
const MAX_CANDIDATES = 5;

const matchPriority: Record<DuplicateMatchType, number> = {
  canonical_url: 0,
  exact_url: 1,
  content_similarity: 2
};

function toCandidate(bookmark: BookmarkItem, matchType: DuplicateMatchType, score: number): DuplicateCandidate {
  return {
    bookmarkId: bookmark.id,
    title: bookmark.title,
    sourceUrl: bookmark.sourceUrl,
    canonicalUrl: bookmark.canonicalUrl ?? (bookmark.sourceUrl ? normalizeUrlForDuplicateCheck(bookmark.sourceUrl) : undefined),
    matchType,
    score,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt
  };
}

function sortCandidates(candidates: DuplicateCandidate[]): DuplicateCandidate[] {
  return candidates.sort((a, b) => {
    const priorityDiff = matchPriority[a.matchType] - matchPriority[b.matchType];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function findDuplicateCandidatesFromBookmarks(
  bookmarks: BookmarkItem[],
  input: {
    sourceUrl?: string;
    title?: string;
    originalText?: string;
    excludeBookmarkId?: string;
  }
): DuplicateCandidate[] {
  const sourceUrl = input.sourceUrl?.trim();
  const canonicalUrl = sourceUrl ? normalizeUrlForDuplicateCheck(sourceUrl) : undefined;
  const inputFingerprint = createContentFingerprint(input);
  const inputText = [input.title, input.originalText].filter(Boolean).join(' ');
  const candidateById = new Map<string, DuplicateCandidate>();

  for (const bookmark of bookmarks) {
    if (bookmark.id === input.excludeBookmarkId) {
      continue;
    }

    if (sourceUrl && bookmark.sourceUrl?.trim() === sourceUrl) {
      candidateById.set(bookmark.id, toCandidate(bookmark, 'exact_url', 1));
      continue;
    }

    const bookmarkCanonicalUrl = bookmark.canonicalUrl ?? (bookmark.sourceUrl ? normalizeUrlForDuplicateCheck(bookmark.sourceUrl) : undefined);

    if (canonicalUrl && bookmarkCanonicalUrl === canonicalUrl) {
      candidateById.set(bookmark.id, toCandidate(bookmark, 'canonical_url', 1));
      continue;
    }

    const bookmarkFingerprint =
      bookmark.contentFingerprint ||
      createContentFingerprint({
        title: bookmark.title,
        originalText: bookmark.originalText,
        sourceUrl: bookmark.sourceUrl
      });
    const similarity = inputFingerprint && bookmarkFingerprint
      ? Math.max(
          calculateTextSimilarity(inputFingerprint, bookmarkFingerprint),
          calculateTextSimilarity(input.originalText ?? inputText, bookmark.originalText),
          calculateTextSimilarity(inputText, [bookmark.title, bookmark.originalText].join(' '))
        )
      : 0;

    if (similarity >= SIMILARITY_THRESHOLD) {
      candidateById.set(bookmark.id, toCandidate(bookmark, 'content_similarity', similarity));
    }
  }

  return sortCandidates([...candidateById.values()]).slice(0, MAX_CANDIDATES);
}

export async function findDuplicateCandidates(input: {
  sourceUrl?: string;
  title?: string;
  originalText?: string;
  excludeBookmarkId?: string;
}): Promise<DuplicateCandidate[]> {
  return findDuplicateCandidatesFromBookmarks(await db.bookmarks.toArray(), input);
}
