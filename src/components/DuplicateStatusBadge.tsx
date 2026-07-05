import type { BookmarkDuplicateStatus } from '../types/bookmark';

export function DuplicateStatusBadge({ status }: { status?: BookmarkDuplicateStatus }) {
  if (!status || status === 'none') {
    return null;
  }

  const label = {
    candidate: '중복 후보',
    confirmed: '중복 확정',
    not_duplicate: '중복 아님',
    none: ''
  }[status];
  const className =
    status === 'confirmed'
      ? 'border-red-300/40 bg-red-300/10 text-red-200'
      : status === 'candidate'
      ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
      : 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200';

  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${className}`}>{label}</span>;
}
