import type { DuplicateCandidate } from '../duplicates/duplicateTypes';
import { DuplicateCandidateList } from './DuplicateCandidateList';

export function DuplicateWarningBox({
  candidates,
  isSaving,
  onCancel,
  onSaveAnyway
}: {
  candidates: DuplicateCandidate[];
  isSaving?: boolean;
  onCancel: () => void;
  onSaveAnyway: () => void;
}) {
  if (candidates.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">
      <div>
        <p className="font-black text-white">비슷한 북마크가 이미 있습니다.</p>
        <p className="mt-1">같은 링크이거나 내용이 매우 유사한 북마크가 발견되었습니다.</p>
      </div>
      <DuplicateCandidateList candidates={candidates} />
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="min-h-12 rounded-2xl bg-sky-300 px-4 text-sm font-black text-slate-950 disabled:opacity-60"
          disabled={isSaving}
          onClick={onSaveAnyway}
          type="button"
        >
          그래도 새로 저장
        </button>
        <button className="min-h-12 rounded-2xl bg-slate-800 px-4 text-sm font-black text-white" onClick={onCancel} type="button">
          취소
        </button>
      </div>
    </section>
  );
}
