export type DuplicateStatus = 'none' | 'candidate' | 'confirmed' | 'not_duplicate';

export type DuplicateMatchType = 'canonical_url' | 'exact_url' | 'content_similarity';

export type DuplicateCandidate = {
  bookmarkId: string;
  title: string;
  sourceUrl?: string;
  canonicalUrl?: string;
  matchType: DuplicateMatchType;
  score: number;
  createdAt: string;
  updatedAt: string;
};
