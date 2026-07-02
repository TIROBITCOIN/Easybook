import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';

export function AnalysisStatusBadge({
  bookmark,
  category
}: {
  bookmark: BookmarkItem;
  category?: Category;
}) {
  const needsReview = bookmark.aiMeta.needsReview || category?.needsReview;
  const isAnalyzed = Boolean(bookmark.difficultyExplanation.easy);
  const label = needsReview ? '검토 필요' : isAnalyzed ? '분석 완료' : '분석 전';
  const className = needsReview
    ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
    : isAnalyzed
      ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200'
      : 'border-slate-700 bg-slate-950 text-slate-300';

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}
