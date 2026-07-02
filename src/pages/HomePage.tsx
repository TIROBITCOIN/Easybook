import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCard } from '../components/BookmarkCard';
import { listBookmarks, listCategories, listTags } from '../db/repo';
import type { BookmarkItem, Category, Tag } from '../types';

export function HomePage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    void Promise.all([listBookmarks(), listCategories(), listTags()]).then(
      ([nextBookmarks, nextCategories, nextTags]) => {
        setBookmarks(nextBookmarks);
        setCategories(nextCategories);
        setTags(nextTags);
      }
    );
  }, []);

  const unreadCount = bookmarks.filter((bookmark) => bookmark.status === 'unread').length;
  const needsReviewCount = bookmarks.filter((bookmark) => bookmark.aiMeta.needsReview).length;

  return (
    <main className="space-y-5">
      <section className="card">
        <p className="text-xs font-bold uppercase tracking-normal text-accent">Local-first</p>
        <h2 className="mt-2 text-3xl font-black text-ink">X 북마크를 내 언어로 정리하세요.</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          링크나 본문을 저장하면 mock AI가 카테고리, 태그, 난이도별 설명을 자동으로 채웁니다.
        </p>
        <Link className="btn mt-5 w-full sm:w-auto" to="/add">
          북마크 추가
        </Link>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="card">
          <p className="text-2xl font-black text-ink">{bookmarks.length}</p>
          <p className="text-xs text-muted">저장됨</p>
        </div>
        <div className="card">
          <p className="text-2xl font-black text-ink">{unreadCount}</p>
          <p className="text-xs text-muted">읽지 않음</p>
        </div>
        <div className="card">
          <p className="text-2xl font-black text-ink">{needsReviewCount}</p>
          <p className="text-xs text-muted">검토 필요</p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-ink">최근 북마크</h2>
          <Link className="text-sm font-bold text-accent" to="/bookmarks">
            전체 보기
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {bookmarks.slice(0, 4).map((bookmark) => (
            <BookmarkCard
              bookmark={bookmark}
              category={categories.find((category) => category.id === bookmark.categoryId)}
              key={bookmark.id}
              tags={tags.filter((tag) => bookmark.tagIds.includes(tag.id))}
            />
          ))}
          {bookmarks.length === 0 ? <div className="card text-sm text-muted">아직 저장된 북마크가 없습니다.</div> : null}
        </div>
      </section>
    </main>
  );
}
