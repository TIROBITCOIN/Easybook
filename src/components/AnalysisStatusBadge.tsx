import type { AnalysisQueueItem } from '../analysisQueue/analysisQueueTypes';
import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';

export function AnalysisStatusBadge({
  bookmark,
  category,
  queueItem
}: {
  bookmark: BookmarkItem;
  category?: Category;
  queueItem?: AnalysisQueueItem;
}) {
  const hasError = Boolean(bookmark.aiMeta.errorMessage);
  const needsReview = bookmark.aiMeta.needsReview || category?.needsReview;
  const isAnalyzed = Boolean(bookmark.difficultyExplanation.easy);
  const queueStatus = queueItem?.status;
  const hasReachedAttemptLimit = Boolean(queueItem && queueItem.attempts >= queueItem.maxAttempts);
  const label =
    queueStatus === 'queued'
      ? '분석 대기'
      : queueStatus === 'running'
      ? '분석 중'
    : queueStatus === 'failed'
    ? hasReachedAttemptLimit
      ? '시도 한도'
        : '분석 실패'
      : hasError
      ? '분석 실패'
      : needsReview
      ? '검토 필요'
      : isAnalyzed
      ? '분석 완료'
      : '분석 전';
  const className =
    queueStatus === 'queued'
      ? 'border-sky-300/40 bg-sky-300/10 text-sky-200'
      : queueStatus === 'running'
      ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
      : queueStatus === 'failed' || hasError
      ? 'border-red-300/40 bg-red-300/10 text-red-200'
      : needsReview
      ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
      : isAnalyzed
      ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200'
      : 'border-slate-700 bg-slate-950 text-slate-300';

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}
