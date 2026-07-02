import Dexie, { type EntityTable } from 'dexie';
import type { BookmarkItem } from '../types/bookmark';

export class EasybookDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkItem, 'id'>;

  constructor() {
    super('easybook-db');

    this.version(1).stores({
      bookmarks: 'id, createdAt, updatedAt, status, importance, sourceUrl'
    });
  }
}

export const db = new EasybookDatabase();
