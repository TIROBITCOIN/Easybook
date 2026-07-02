import { Link } from 'react-router-dom';
import { AnalysisStatusBadge } from './AnalysisStatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { TagPill } from './TagPill';
import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';

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

export function BookmarkCard({
  bookmark,
  category,
  tags
}: {
  bookmark: BookmarkItem;
  category?: Category;
  tags: Tag[];
}) {
  return (
    <Link
      className="block rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20 transition hover:border-sky-300"
      to={`/bookmarks/${bookmark.id}`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <AnalysisStatusBadge bookmark={bookmark} category={category} />
        <CategoryBadge category={category} />
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300">
          {bookmark.importance}
        </span>
      </div>
      <h2 className="text-lg font-black leading-snug text-white">{bookmark.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        {preview(bookmark.summary || bookmark.originalText, '본문이 없습니다.')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.slice(0, 3).map((tag) => (
          <TagPill key={tag.id} tag={tag} />
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">저장 {formatDate(bookmark.createdAt)}</p>
    </Link>
  );
}
