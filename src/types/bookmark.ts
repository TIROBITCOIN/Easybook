export type BookmarkSource = 'manual-url' | 'manual-text' | 'x-share' | 'x-api';
export type BookmarkStatus = 'unread' | 'read' | 'archived';
export type BookmarkImportance = 'low' | 'medium' | 'high';

export type BookmarkItem = {
  id: string;
  source: BookmarkSource;
  sourceUrl?: string;
  originalText: string;
  title: string;
  summary: string;
  categoryId?: string;
  tagIds: string[];
  difficultyExplanation: {
    easy: string;
    medium: string;
    advanced: string;
  };
  aiMeta: {
    analyzedAt?: string;
    model?: string;
    confidence?: number;
    needsReview: boolean;
  };
  status: BookmarkStatus;
  importance: BookmarkImportance;
  userMemo: string;
  revisitAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookmarkInput = {
  sourceUrl?: string;
  originalText: string;
  title?: string;
  userMemo?: string;
};
