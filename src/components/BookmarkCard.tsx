import { Link } from 'react-router-dom';
import type { BookmarkItem } from '../types/bookmark';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function preview(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.length > 92 ? `${trimmed.slice(0, 92)}...` : trimmed;
}

export function BookmarkCard({ bookmark }: { bookmark: BookmarkItem }) {
  return (
    <Link
      className="block rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 transition hover:border-sky-300"
      to={`/bookmarks/${bookmark.id}`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300">
          {bookmark.status}
        </span>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300">
          {bookmark.importance}
        </span>
      </div>
      <h2 className="text-lg font-black leading-snug text-white">{bookmark.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {preview(bookmark.originalText, '본문이 없습니다.')}
      </p>
      {bookmark.userMemo ? (
        <p className="mt-2 text-sm leading-6 text-slate-500">메모: {preview(bookmark.userMemo, '')}</p>
      ) : null}
      {bookmark.sourceUrl ? (
        <p className="mt-2 break-all text-xs font-bold text-sky-300">{bookmark.sourceUrl}</p>
      ) : null}
      <p className="mt-4 text-xs text-slate-500">저장 {formatDate(bookmark.createdAt)}</p>
    </Link>
  );
}
