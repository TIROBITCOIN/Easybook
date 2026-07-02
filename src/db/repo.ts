import { db } from './schema';
import type {
  AppSettings,
  BookmarkFilters,
  BookmarkItem,
  BookmarkSource,
  Category,
  CreatedBy,
  Tag
} from '../types';

const nowIso = () => new Date().toISOString();
const createId = () => crypto.randomUUID();

export const defaultSettings: AppSettings = {
  id: 'settings',
  appLockEnabled: true,
  passwordHash: null,
  theme: 'dark',
  aiAutoAnalyze: true,
  aiAnalyzeSensitiveContent: false,
  backupMode: 'encrypted',
  hasAcceptedAiPrivacyNotice: false
};

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('settings');
  if (settings) {
    return settings;
  }

  await db.settings.put(defaultSettings);
  return defaultSettings;
}

export async function updateSettings(changes: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
  const settings = { ...(await getSettings()), ...changes };
  await db.settings.put(settings);
  return settings;
}

export async function listCategories(): Promise<Category[]> {
  return db.categories.orderBy('createdAt').toArray();
}

export async function createCategory(input: {
  name: string;
  description?: string;
  color?: string;
  createdBy?: CreatedBy;
  needsReview?: boolean;
}): Promise<Category> {
  const timestamp = nowIso();
  const category: Category = {
    id: createId(),
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    color: input.color ?? '#7dd3fc',
    createdBy: input.createdBy ?? 'user',
    needsReview: input.needsReview ?? false,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db.categories.add(category);
  return category;
}

export async function updateCategory(id: string, changes: Partial<Omit<Category, 'id'>>): Promise<void> {
  await db.categories.update(id, { ...changes, updatedAt: nowIso() });
}

export async function deleteCategory(id: string): Promise<void> {
  await db.transaction('rw', db.categories, db.bookmarks, async () => {
    await db.categories.delete(id);
    await db.bookmarks.where('categoryId').equals(id).modify({ categoryId: null });
  });
}

export async function mergeCategories(sourceId: string, targetId: string): Promise<void> {
  if (sourceId === targetId) {
    return;
  }

  await db.transaction('rw', db.categories, db.bookmarks, async () => {
    await db.bookmarks.where('categoryId').equals(sourceId).modify({ categoryId: targetId });
    await db.categories.delete(sourceId);
  });
}

export async function listTags(): Promise<Tag[]> {
  return db.tags.orderBy('name').toArray();
}

export async function ensureTag(name: string, createdBy: CreatedBy = 'user'): Promise<Tag> {
  const normalized = name.trim().toLowerCase();
  const existing = (await db.tags.toArray()).find((tag) => tag.name.toLowerCase() === normalized);
  if (existing) {
    return existing;
  }

  const tag: Tag = {
    id: createId(),
    name: name.trim(),
    createdBy,
    createdAt: nowIso()
  };

  await db.tags.add(tag);
  return tag;
}

export async function ensureCategory(name: string, createdBy: CreatedBy, needsReview: boolean): Promise<Category> {
  const normalized = name.trim().toLowerCase();
  const existing = (await db.categories.toArray()).find(
    (category) => category.name.toLowerCase() === normalized
  );

  if (existing) {
    return existing;
  }

  return createCategory({
    name,
    createdBy,
    needsReview,
    description: createdBy === 'ai' ? 'AI가 새로 제안한 카테고리입니다.' : ''
  });
}

export async function createBookmark(input: {
  source: BookmarkSource;
  sourceUrl?: string;
  originalText?: string;
  authorName?: string;
  authorHandle?: string;
  categoryId?: string | null;
}): Promise<BookmarkItem> {
  const timestamp = nowIso();
  const bookmark: BookmarkItem = {
    id: createId(),
    source: input.source,
    sourceUrl: input.sourceUrl?.trim() ?? '',
    originalText: input.originalText?.trim() ?? '',
    authorName: input.authorName?.trim() ?? '',
    authorHandle: input.authorHandle?.trim() ?? '',
    postedAt: null,
    title: '',
    summary: '',
    categoryId: input.categoryId ?? null,
    tagIds: [],
    difficultyExplanation: {
      easy: '',
      medium: '',
      advanced: ''
    },
    aiMeta: {
      analyzedAt: null,
      model: '',
      confidence: 0,
      needsReview: false
    },
    status: 'unread',
    importance: 'medium',
    userMemo: '',
    revisitAt: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db.bookmarks.add(bookmark);
  return bookmark;
}

export async function updateBookmark(id: string, changes: Partial<Omit<BookmarkItem, 'id'>>): Promise<void> {
  await db.bookmarks.update(id, { ...changes, updatedAt: nowIso() });
}

export async function deleteBookmark(id: string): Promise<void> {
  await db.bookmarks.delete(id);
}

export async function getBookmark(id: string): Promise<BookmarkItem | undefined> {
  return db.bookmarks.get(id);
}

export async function listBookmarks(): Promise<BookmarkItem[]> {
  return db.bookmarks.orderBy('createdAt').reverse().toArray();
}

export async function listFilteredBookmarks(filters: BookmarkFilters): Promise<BookmarkItem[]> {
  const query = filters.query.trim().toLowerCase();
  const bookmarks = await listBookmarks();

  return bookmarks.filter((bookmark) => {
    const matchesQuery =
      !query ||
      bookmark.title.toLowerCase().includes(query) ||
      bookmark.summary.toLowerCase().includes(query) ||
      bookmark.originalText.toLowerCase().includes(query) ||
      bookmark.sourceUrl.toLowerCase().includes(query) ||
      bookmark.userMemo.toLowerCase().includes(query);
    const matchesCategory = !filters.categoryId || bookmark.categoryId === filters.categoryId;
    const matchesTag = !filters.tagId || bookmark.tagIds.includes(filters.tagId);
    const matchesStatus = filters.status === 'all' || bookmark.status === filters.status;
    const matchesImportance = filters.importance === 'all' || bookmark.importance === filters.importance;

    return matchesQuery && matchesCategory && matchesTag && matchesStatus && matchesImportance;
  });
}

export async function replaceAllData(payload: {
  bookmarks: BookmarkItem[];
  categories: Category[];
  tags: Tag[];
  settings: AppSettings;
}): Promise<void> {
  await db.transaction('rw', db.bookmarks, db.categories, db.tags, db.settings, async () => {
    await db.bookmarks.clear();
    await db.categories.clear();
    await db.tags.clear();
    await db.settings.clear();
    await db.bookmarks.bulkPut(payload.bookmarks);
    await db.categories.bulkPut(payload.categories);
    await db.tags.bulkPut(payload.tags);
    await db.settings.put(payload.settings);
  });
}

export async function exportAllData() {
  return {
    version: 1,
    exportedAt: nowIso(),
    bookmarks: await db.bookmarks.toArray(),
    categories: await db.categories.toArray(),
    tags: await db.tags.toArray(),
    settings: await getSettings()
  };
}
