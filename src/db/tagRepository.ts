import { db } from './db';
import { normalizeNameForLookup } from './nameNormalization';
import type { Tag } from '../types/tag';

export async function listTags(): Promise<Tag[]> {
  return db.tags.orderBy('name').toArray();
}

export async function ensureTag(name: string, createdBy: 'user' | 'ai' = 'ai'): Promise<Tag> {
  const trimmedName = name.trim().replace(/\s+/g, ' ');
  const normalized = normalizeNameForLookup(name);
  const existing = (await db.tags.toArray()).find((tag) => normalizeNameForLookup(tag.name) === normalized);

  if (existing) {
    return existing;
  }

  const tag: Tag = {
    id: crypto.randomUUID(),
    name: trimmedName,
    createdBy,
    createdAt: new Date().toISOString()
  };

  await db.tags.add(tag);
  return tag;
}
