import { Link } from 'react-router-dom';
import type { DuplicateCandidate } from '../duplicates/duplicateTypes';

function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function matchReason(candidate: DuplicateCandidate): string {
  if (candidate.matchType === 'canonical_url') {
    return '같은 X/Twitter 게시물';
  }

  if (candidate.matchType === 'exact_url') {
    return '같은 URL';
  }

  return '본문이 유사함';
}

export function DuplicateCandidateList({
  candidates,
  onConfirmDuplicate,
  onMarkNotDuplicate
}: {
  candidates: DuplicateCandidate[];
  onConfirmDuplicate?: (candidate: DuplicateCandidate) => void;
  onMarkNotDuplicate?: (candidate: DuplicateCandidate) => void;
}) {
  return (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-4" key={candidate.bookmarkId}>
          <p className="font-bold text-white">{candidate.title}</p>
          {candidate.sourceUrl ? <p className="mt-2 break-all text-xs text-sky-200">{candidate.sourceUrl}</p> : null}
          <p className="mt-2 text-xs text-slate-400">
            {matchReason(candidate)} · 유사도 {formatScore(candidate.score)}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-slate-800 px-3 text-xs font-black text-white"
              to={`/bookmarks/${candidate.bookmarkId}`}
            >
              기존 북마크 열기
            </Link>
            {onConfirmDuplicate ? (
              <button
                className="min-h-10 rounded-2xl bg-amber-300 px-3 text-xs font-black text-slate-950"
                onClick={() => onConfirmDuplicate(candidate)}
                type="button"
              >
                중복으로 표시
              </button>
            ) : null}
            {onMarkNotDuplicate ? (
              <button
                className="min-h-10 rounded-2xl bg-slate-800 px-3 text-xs font-black text-white"
                onClick={() => onMarkNotDuplicate(candidate)}
                type="button"
              >
                중복 아님
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
