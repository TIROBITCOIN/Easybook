import { useEffect, useState } from 'react';
import { BookmarkCard } from '../components/BookmarkCard';
import { listCategories, listFilteredBookmarks, listTags } from '../db/repo';
import type { BookmarkFilters, BookmarkItem, Category, Tag } from '../types';

const defaultFilters: BookmarkFilters = {
  query: '',
  categoryId: '',
  tagId: '',
  status: 'all',
  importance: 'all'
};

export function BookmarksPage() {
  const [filters, setFilters] = useState<BookmarkFilters>(defaultFilters);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    void Promise.all([listFilteredBookmarks(filters), listCategories(), listTags()]).then(
      ([nextBookmarks, nextCategories, nextTags]) => {
        setBookmarks(nextBookmarks);
        setCategories(nextCategories);
        setTags(nextTags);
      }
    );
  }, [filters]);

  return (
    <main className="space-y-4">
      <section className="card">
        <h2 className="text-2xl font-black text-ink">북마크</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <input
            className="input md:col-span-2"
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            placeholder="검색"
            value={filters.query}
          />
          <select className="input" onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}>
            <option value="">모든 카테고리</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className="input" onChange={(event) => setFilters({ ...filters, tagId: event.target.value })}>
            <option value="">모든 태그</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                #{tag.name}
              </option>
            ))}
          </select>
          <select className="input" onChange={(event) => setFilters({ ...filters, status: event.target.value as BookmarkFilters['status'] })}>
            <option value="all">모든 상태</option>
            <option value="unread">unread</option>
            <option value="read">read</option>
            <option value="archived">archived</option>
          </select>
          <select className="input md:col-span-5" onChange={(event) => setFilters({ ...filters, importance: event.target.value as BookmarkFilters['importance'] })}>
            <option value="all">모든 중요도</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {bookmarks.map((bookmark) => (
          <BookmarkCard
            bookmark={bookmark}
            category={categories.find((category) => category.id === bookmark.categoryId)}
            key={bookmark.id}
            tags={tags.filter((tag) => bookmark.tagIds.includes(tag.id))}
          />
        ))}
        {bookmarks.length === 0 ? <div className="card text-sm text-muted">조건에 맞는 북마크가 없습니다.</div> : null}
      </section>
    </main>
  );
}
