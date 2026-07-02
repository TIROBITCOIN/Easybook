import type { BookmarkImportance } from '../types/bookmark';
import type { Category } from '../types/category';

export type MockAnalysisInput = {
  originalText: string;
  sourceUrl?: string;
  existingCategories: Category[];
};

export type MockAnalysisResult = {
  title: string;
  summary: string;
  category: {
    name: string;
    isNew: boolean;
  };
  tags: string[];
  difficultyExplanation: {
    easy: string;
    medium: string;
    advanced: string;
  };
  revisitReason: string;
  importance: BookmarkImportance;
  confidence: number;
};
