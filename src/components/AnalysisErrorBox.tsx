import type { AnalysisQueueItem } from '../analysisQueue/analysisQueueTypes';
import type { BookmarkItem } from '../types/bookmark';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function AnalysisErrorBox({
  bookmark,
  queueItem
}: {
  bookmark: BookmarkItem;
  queueItem?: AnalysisQueueItem;
}) {
  if (!bookmark.aiMeta.errorMessage && queueItem?.status !== 'failed') {
    return null;
  }

  return (
    <section className="rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-sm leading-6 text-red-200">
      <p className="font-black">AI 분석 실패</p>
      {bookmark.aiMeta.errorMessage ? <p className="mt-2">{bookmark.aiMeta.errorMessage}</p> : null}
      {bookmark.aiMeta.errorCode ? <p className="mt-2 text-xs text-red-200/80">코드: {bookmark.aiMeta.errorCode}</p> : null}
      {queueItem ? (
        <div className="mt-3 text-xs leading-5 text-red-100/80">
          <p>
            시도: {queueItem.attempts} / {queueItem.maxAttempts}
          </p>
          {queueItem.startedAt ? <p>마지막 시도: {formatDate(queueItem.startedAt)}</p> : null}
          {queueItem.status === 'queued' ? <p>다음 시도: {formatDate(queueItem.scheduledAt)}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
