import { db } from './db';
import type { Tag } from '../types/tag';

export async function listTags(): Promise<Tag[]> {
  return db.tags.orderBy('name').toArray();
}

export async function ensureTag(name: string, createdBy: 'user' | 'ai' = 'ai'): Promise<Tag> {
  const normalized = name.trim().toLowerCase();
  const existing = (await db.tags.toArray()).find((tag) => tag.name.toLowerCase() === normalized);

  if (existing) {
    return existing;
  }

  const tag: Tag = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdBy,
    createdAt: new Date().toISOString()
  };

  await db.tags.add(tag);
  return tag;
}
