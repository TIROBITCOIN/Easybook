import Dexie, { type EntityTable } from 'dexie';
import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';
import type { AppSettings } from '../types/appSettings';

export class EasybookDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkItem, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  tags!: EntityTable<Tag, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('easybook-db');

    this.version(1).stores({
      bookmarks: 'id, createdAt, updatedAt, status, importance, sourceUrl'
    });

    this.version(2).stores({
      bookmarks: 'id, createdAt, updatedAt, status, importance, sourceUrl, categoryId, *tagIds',
      categories: 'id, name, createdBy, needsReview, createdAt',
      tags: 'id, name, createdBy, createdAt'
    });

    this.version(3).stores({
      bookmarks: 'id, createdAt, updatedAt, status, importance, sourceUrl, categoryId, *tagIds',
      categories: 'id, name, createdBy, needsReview, createdAt',
      tags: 'id, name, createdBy, createdAt',
      settings: 'id'
    });
  }
}

export const db = new EasybookDatabase();
