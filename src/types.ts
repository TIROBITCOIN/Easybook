export type BookmarkSource = 'x-share' | 'manual-url' | 'manual-text' | 'x-api';
export type BookmarkStatus = 'unread' | 'read' | 'archived';
export type Importance = 'low' | 'medium' | 'high';
export type CreatedBy = 'user' | 'ai';
export type Theme = 'dark' | 'light';
export type BackupMode = 'encrypted' | 'plain';

export type DifficultyExplanation = {
  easy: string;
  medium: string;
  advanced: string;
};

export type BookmarkItem = {
  id: string;
  source: BookmarkSource;
  sourceUrl: string;
  originalText: string;
  authorName: string;
  authorHandle: string;
  postedAt: string | null;
  title: string;
  summary: string;
  categoryId: string | null;
  tagIds: string[];
  difficultyExplanation: DifficultyExplanation;
  aiMeta: {
    analyzedAt: string | null;
    model: string;
    confidence: number;
    needsReview: boolean;
  };
  status: BookmarkStatus;
  importance: Importance;
  userMemo: string;
  revisitAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdBy: CreatedBy;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
  createdBy: CreatedBy;
  createdAt: string;
};

export type AppSettings = {
  id: 'settings';
  appLockEnabled: boolean;
  passwordHash: string | null;
  theme: Theme;
  aiAutoAnalyze: boolean;
  aiAnalyzeSensitiveContent: boolean;
  backupMode: BackupMode;
  hasAcceptedAiPrivacyNotice: boolean;
};

export type AiAnalysisResult = {
  title: string;
  summary: string;
  category: {
    name: string;
    isNew: boolean;
  };
  tags: string[];
  difficultyExplanation: DifficultyExplanation;
  revisitReason: string;
  importance: Importance;
  confidence: number;
};

export type BookmarkFilters = {
  query: string;
  categoryId: string;
  tagId: string;
  status: 'all' | BookmarkStatus;
  importance: 'all' | Importance;
};
