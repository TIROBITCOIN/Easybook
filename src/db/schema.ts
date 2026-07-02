import Dexie, { type EntityTable } from 'dexie';
import type { AppSettings, BookmarkItem, Category, Tag } from '../types';

export class EasybookDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkItem, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  tags!: EntityTable<Tag, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('easybook-pwa');

    this.version(1).stores({
      bookmarks: 'id, source, categoryId, status, importance, createdAt, updatedAt, *tagIds',
      categories: 'id, name, createdBy, needsReview, createdAt',
      tags: 'id, name, createdBy, createdAt',
      settings: 'id'
    });
  }
}

export const db = new EasybookDatabase();
