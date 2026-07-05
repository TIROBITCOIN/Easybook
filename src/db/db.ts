import Dexie, { type EntityTable } from 'dexie';
import type { AnalysisQueueItem } from '../analysisQueue/analysisQueueTypes';
import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';
import type { AppSettings } from '../types/appSettings';

export class EasybookDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkItem, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  tags!: EntityTable<Tag, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;
  analysisQueue!: EntityTable<AnalysisQueueItem, 'id'>;

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

    this.version(4).stores({
      bookmarks: 'id, createdAt, updatedAt, status, importance, sourceUrl, categoryId, *tagIds',
      categories: 'id, name, createdBy, needsReview, createdAt',
      tags: 'id, name, createdBy, createdAt',
      settings: 'id'
    });

    this.version(5).stores({
      bookmarks: 'id, createdAt, updatedAt, status, importance, sourceUrl, categoryId, *tagIds',
      categories: 'id, name, createdBy, needsReview, createdAt',
      tags: 'id, name, createdBy, createdAt',
      settings: 'id',
      analysisQueue: 'id, bookmarkId, status, priority, scheduledAt, createdAt, updatedAt'
    });

    this.version(6).stores({
      bookmarks:
        'id, createdAt, updatedAt, status, importance, sourceUrl, canonicalUrl, contentFingerprint, duplicateStatus, duplicateOfBookmarkId, categoryId, *tagIds',
      categories: 'id, name, createdBy, needsReview, createdAt',
      tags: 'id, name, createdBy, createdAt',
      settings: 'id',
      analysisQueue: 'id, bookmarkId, status, priority, scheduledAt, createdAt, updatedAt'
    });
  }
}

export const db = new EasybookDatabase();
