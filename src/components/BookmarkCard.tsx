import { Link } from 'react-router-dom';
import type { BookmarkItem, Category, Tag } from '../types';

export function BookmarkCard({
  bookmark,
  category,
  tags
}: {
  bookmark: BookmarkItem;
  category?: Category;
  tags: Tag[];
}) {
  const title = bookmark.title || bookmark.originalText || bookmark.sourceUrl || '제목 없는 북마크';

  return (
    <Link className="card block no-underline transition hover:border-accent" to={`/bookmarks/${bookmark.id}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="pill">{bookmark.status}</span>
        <span className="pill">{bookmark.importance}</span>
        {category ? (
          <span className="pill" style={{ borderColor: category.color, color: category.color }}>
            {category.name}
          </span>
        ) : null}
      </div>
      <h3 className="line-clamp-2 text-base font-black text-ink">{title}</h3>
      {bookmark.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{bookmark.summary}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.slice(0, 4).map((tag) => (
          <span className="rounded-full bg-slate-950/40 px-2 py-1 text-xs text-muted" key={tag.id}>
            #{tag.name}
          </span>
        ))}
      </div>
    </Link>
  );
}
