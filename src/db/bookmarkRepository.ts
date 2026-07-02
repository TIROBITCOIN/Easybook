import { mockAnalyzeBookmark } from '../ai/mockAnalyzeBookmark';
import { db } from './db';
import { ensureCategory, listCategories } from './categoryRepository';
import { ensureTag } from './tagRepository';
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
  const bookmark: BookmarkItem = {
    id: crypto.randomUUID(),
    source: sourceUrl ? 'manual-url' : 'manual-text',
    sourceUrl: sourceUrl || undefined,
    originalText,
    title: createTitle(input),
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

export async function analyzeBookmark(id: string): Promise<BookmarkItem | undefined> {
  const bookmark = await getBookmark(id);
  if (!bookmark) {
    return undefined;
  }

  const analysis = mockAnalyzeBookmark({
    originalText: bookmark.originalText,
    sourceUrl: bookmark.sourceUrl,
    existingCategories: await listCategories()
  });
  const category = await ensureCategory(analysis.category.name, analysis.category.isNew ? 'ai' : 'user');
  const tags = await Promise.all(analysis.tags.map((tagName) => ensureTag(tagName, 'ai')));
  const timestamp = nowIso();

  const updatedBookmark: BookmarkItem = {
    ...bookmark,
    title: analysis.title || bookmark.title,
    summary: analysis.summary,
    categoryId: category.id,
    tagIds: tags.map((tag) => tag.id),
    difficultyExplanation: analysis.difficultyExplanation,
    aiMeta: {
      analyzedAt: timestamp,
      model: 'mock-ai-v1',
      confidence: analysis.confidence,
      needsReview: analysis.category.isNew || analysis.confidence < 0.7
    },
    importance: analysis.importance,
    updatedAt: timestamp
  };

  await db.bookmarks.put(updatedBookmark);
  return updatedBookmark;
}

export async function deleteBookmark(id: string): Promise<void> {
  await db.bookmarks.delete(id);
}
