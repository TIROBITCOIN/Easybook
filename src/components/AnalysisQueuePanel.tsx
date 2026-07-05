import { countStartedToday } from '../analysisQueue/analysisLimits';
import type { AnalysisQueueItem } from '../analysisQueue/analysisQueueTypes';

export function AnalysisQueuePanel({
  dailyLimit,
  queueItems
}: {
  dailyLimit: number;
  queueItems: AnalysisQueueItem[];
}) {
  const usedToday = countStartedToday(queueItems);
  const queuedCount = queueItems.filter((item) => item.status === 'queued').length;
  const runningCount = queueItems.filter((item) => item.status === 'running').length;
  const failedCount = queueItems.filter((item) => item.status === 'failed').length;
  const isLimitReached = usedToday >= dailyLimit;

  return (
    <section className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-normal text-sky-300">AI analysis</p>
        <h3 className="mt-2 text-lg font-black text-white">AI 분석</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-slate-950 p-4">
          <p className="text-xs font-bold text-slate-500">오늘 사용</p>
          <p className="mt-2 text-xl font-black text-white">
            {usedToday} / {dailyLimit}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-4">
          <p className="text-xs font-bold text-slate-500">대기</p>
          <p className="mt-2 text-xl font-black text-white">{queuedCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-4">
          <p className="text-xs font-bold text-slate-500">진행</p>
          <p className="mt-2 text-xl font-black text-white">{runningCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-4">
          <p className="text-xs font-bold text-slate-500">실패</p>
          <p className="mt-2 text-xl font-black text-white">{failedCount}</p>
        </div>
      </div>
      {isLimitReached ? (
        <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          오늘의 AI 분석 시도 수를 모두 사용했습니다. 내일 다시 실행되거나 설정에서 한도를 조정할 수 있습니다.
        </p>
      ) : null}
    </section>
  );
}

