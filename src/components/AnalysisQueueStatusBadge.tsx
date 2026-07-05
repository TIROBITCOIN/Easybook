import type { AnalysisQueueItem } from '../analysisQueue/analysisQueueTypes';

export function AnalysisQueueStatusBadge({ queueItem }: { queueItem?: AnalysisQueueItem }) {
  if (!queueItem) {
    return null;
  }

  const labelByStatus = {
    queued: '분석 대기',
    running: '분석 중',
    succeeded: '분석 완료',
    failed: queueItem.attempts >= queueItem.maxAttempts ? '시도 한도' : '분석 실패',
    paused: '분석 일시정지',
    skipped: '분석 건너뜀'
  };
  const classByStatus = {
    queued: 'border-sky-300/40 bg-sky-300/10 text-sky-200',
    running: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
    succeeded: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
    failed: 'border-red-300/40 bg-red-300/10 text-red-200',
    paused: 'border-slate-700 bg-slate-950 text-slate-300',
    skipped: 'border-slate-700 bg-slate-950 text-slate-300'
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${classByStatus[queueItem.status]}`}>
      {labelByStatus[queueItem.status]}
    </span>
  );
}

