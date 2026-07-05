import { AiAnalysisError } from '../ai/analyzeBookmarkClient';
import { analyzeBookmark as runAnalysis } from '../ai/analysisProvider';
import { clearAnalysisQueueForBookmark } from '../analysisQueue/analysisQueueRepository';
import { truncateAnalysisText } from '../analysisQueue/analysisLimits';
import { createContentFingerprint } from '../duplicates/contentFingerprint';
import { normalizeUrlForDuplicateCheck } from '../duplicates/urlNormalization';
import { db } from './db';
import { ensureCategory, listCategories } from './categoryRepository';
import { ensureTag } from './tagRepository';
import { getSettings } from './settingsRepository';
import type {
  BookmarkImportance,
  BookmarkItem,
  BookmarkStatus,
  CreateBookmarkInput
} from '../types/bookmark';

const nowIso = () => new Date().toISOString();

function createTitle(input: CreateBookmarkInput): string {
  const trimmedTitle = input.title?.trim();
  if (trimmedTitle) {
    return trimmedTitle;
  }

  const fallback = input.originalText.trim() || input.sourceUrl?.trim() || '제목 없는 북마크';
  return fallback.slice(0, 40);
}

export async function createBookmark(input: CreateBookmarkInput): Promise<BookmarkItem> {
  const sourceUrl = input.sourceUrl?.trim();
  const originalText = input.originalText.trim();

  if (!sourceUrl && !originalText) {
    throw new Error('트윗 링크 또는 트윗 본문 중 하나는 반드시 입력해야 합니다.');
  }

  const timestamp = nowIso();
  const title = createTitle(input);
  const canonicalUrl = sourceUrl ? normalizeUrlForDuplicateCheck(sourceUrl) : undefined;
  const contentFingerprint = createContentFingerprint({
    title,
    originalText,
    sourceUrl
  });
  const bookmark: BookmarkItem = {
    id: crypto.randomUUID(),
    source: sourceUrl ? 'manual-url' : 'manual-text',
    sourceUrl: sourceUrl || undefined,
    canonicalUrl,
    contentFingerprint: contentFingerprint || undefined,
    duplicateStatus: input.duplicateStatus ?? 'none',
    duplicateCheckedAt: timestamp,
    originalText,
    title,
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
    userMemo: input.userMemo?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db.bookmarks.add(bookmark);
  return bookmark;
}

export async function getBookmark(id: string): Promise<BookmarkItem | undefined> {
  return db.bookmarks.get(id);
}

export async function findBookmarkBySourceUrl(sourceUrl: string): Promise<BookmarkItem | undefined> {
  const normalized = sourceUrl.trim();
  if (!normalized) {
    return undefined;
  }

  return db.bookmarks.where('sourceUrl').equals(normalized).first();
}

export async function updateBookmarkDuplicateState(
  id: string,
  changes: {
    duplicateOfBookmarkId?: string;
    duplicateStatus: BookmarkItem['duplicateStatus'];
  }
): Promise<void> {
  await db.bookmarks.update(id, {
    duplicateOfBookmarkId: changes.duplicateOfBookmarkId,
    duplicateStatus: changes.duplicateStatus,
    duplicateCheckedAt: nowIso(),
    updatedAt: nowIso()
  });
}

export async function ensureBookmarkDuplicateMetadata(bookmark: BookmarkItem): Promise<BookmarkItem> {
  const canonicalUrl = bookmark.canonicalUrl ?? (bookmark.sourceUrl ? normalizeUrlForDuplicateCheck(bookmark.sourceUrl) : undefined);
  const contentFingerprint =
    bookmark.contentFingerprint ||
    createContentFingerprint({
      title: bookmark.title,
      originalText: bookmark.originalText,
      sourceUrl: bookmark.sourceUrl
    }) ||
    undefined;

  if (canonicalUrl === bookmark.canonicalUrl && contentFingerprint === bookmark.contentFingerprint && bookmark.duplicateStatus) {
    return bookmark;
  }

  const updatedBookmark: BookmarkItem = {
    ...bookmark,
    canonicalUrl,
    contentFingerprint,
    duplicateStatus: bookmark.duplicateStatus ?? 'none',
    duplicateCheckedAt: bookmark.duplicateCheckedAt ?? nowIso()
  };
  await db.bookmarks.put(updatedBookmark);
  return updatedBookmark;
}

export async function listBookmarks(): Promise<BookmarkItem[]> {
  return db.bookmarks.orderBy('createdAt').reverse().toArray();
}

export async function searchBookmarks(query: string): Promise<BookmarkItem[]> {
  const normalized = query.trim().toLowerCase();
  const bookmarks = await listBookmarks();

  if (!normalized) {
    return bookmarks;
  }

  return bookmarks.filter((bookmark) => {
    return [bookmark.title, bookmark.summary, bookmark.originalText, bookmark.userMemo, bookmark.sourceUrl ?? ''].some(
      (value) => value.toLowerCase().includes(normalized)
    );
  });
}

export async function updateBookmarkStatus(id: string, status: BookmarkStatus): Promise<void> {
  await db.bookmarks.update(id, { status, updatedAt: nowIso() });
}

export async function updateBookmarkImportance(
  id: string,
  importance: BookmarkImportance
): Promise<void> {
  await db.bookmarks.update(id, { importance, updatedAt: nowIso() });
}

export async function analyzeBookmark(
  id: string,
  options: {
    maxInputChars?: number;
  } = {}
): Promise<BookmarkItem | undefined> {
  const bookmark = await getBookmark(id);
  if (!bookmark) {
    return undefined;
  }

  const timestamp = nowIso();

  try {
    const settings = await getSettings();
    const analysisText = options.maxInputChars
      ? truncateAnalysisText(bookmark.originalText, options.maxInputChars).originalText
      : bookmark.originalText;
    const analysis = await runAnalysis(
      {
        originalText: analysisText,
        sourceUrl: bookmark.sourceUrl,
        existingCategories: await listCategories()
      },
      settings.aiProvider
    );
    const category = await ensureCategory(analysis.category.name, analysis.category.isNew ? 'ai' : 'user');
    const tags = await Promise.all(analysis.tags.map((tagName) => ensureTag(tagName, 'ai')));

    const updatedBookmark: BookmarkItem = {
      ...bookmark,
      title: analysis.title || bookmark.title,
      summary: analysis.summary,
      categoryId: category.id,
      tagIds: tags.map((tag) => tag.id),
      difficultyExplanation: analysis.difficultyExplanation,
      aiMeta: {
        analyzedAt: timestamp,
        model: settings.aiProvider === 'mock' ? 'mock-ai-v1' : 'openai-responses',
        confidence: analysis.confidence,
        needsReview: analysis.category.isNew || analysis.confidence < 0.7,
        lastAttemptAt: timestamp
      },
      importance: analysis.importance,
      updatedAt: timestamp
    };

    await db.bookmarks.put(updatedBookmark);
    return updatedBookmark;
  } catch (error) {
    const errorCode = error instanceof AiAnalysisError ? error.code : 'UNKNOWN';
    const errorMessage =
      error instanceof Error ? error.message : 'AI 분석에 실패했습니다. 다시 시도해 주세요.';
    const failedBookmark: BookmarkItem = {
      ...bookmark,
      aiMeta: {
        ...bookmark.aiMeta,
        errorCode,
        errorMessage,
        lastAttemptAt: timestamp,
        needsReview: true
      },
      updatedAt: timestamp
    };

    await db.bookmarks.put(failedBookmark);
    return failedBookmark;
  }
}

export async function deleteBookmark(id: string): Promise<void> {
  await clearAnalysisQueueForBookmark(id);
  await db.bookmarks.delete(id);
}
