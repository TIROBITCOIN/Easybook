import { db } from './db';
import { normalizeNameForLookup } from './nameNormalization';
import type { Category } from '../types/category';

const nowIso = () => new Date().toISOString();

const colors = ['#7dd3fc', '#a78bfa', '#facc15', '#34d399', '#fb7185', '#f97316'];

function colorForName(name: string): string {
  const total = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[total % colors.length];
}

export async function listCategories(): Promise<Category[]> {
  return db.categories.orderBy('createdAt').toArray();
}

export async function getCategory(id?: string): Promise<Category | undefined> {
  return id ? db.categories.get(id) : undefined;
}

export async function ensureCategory(name: string, createdBy: 'user' | 'ai'): Promise<Category> {
  const trimmedName = name.trim().replace(/\s+/g, ' ');
  const normalized = normalizeNameForLookup(name);
  const existing = (await db.categories.toArray()).find(
    (category) => normalizeNameForLookup(category.name) === normalized
  );

  if (existing) {
    return existing;
  }

  const timestamp = nowIso();
  const category: Category = {
    id: crypto.randomUUID(),
    name: trimmedName,
    description: createdBy === 'ai' ? 'Mock AI가 제안한 카테고리입니다.' : '',
    color: colorForName(trimmedName),
    createdBy,
    needsReview: createdBy === 'ai',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db.categories.add(category);
  return category;
}

export async function updateCategoryName(id: string, name: string): Promise<void> {
  await db.categories.update(id, {
    name: name.trim(),
    needsReview: false,
    updatedAt: nowIso()
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await db.transaction('rw', db.categories, db.bookmarks, async () => {
    await db.bookmarks.where('categoryId').equals(id).modify({ categoryId: undefined });
    await db.categories.delete(id);
  });
}

export async function countBookmarksByCategory(categoryId: string): Promise<number> {
  return db.bookmarks.where('categoryId').equals(categoryId).count();
}
