import Dexie, { type EntityTable } from 'dexie';
import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';

export class EasybookDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkItem, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  tags!: EntityTable<Tag, 'id'>;

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
  }
}

export const db = new EasybookDatabase();
