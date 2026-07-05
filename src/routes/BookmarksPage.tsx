import { useEffect, useState } from 'react';
import { BookmarkCard } from '../components/BookmarkCard';
import { EmptyState } from '../components/EmptyState';
import { SearchInput } from '../components/SearchInput';
import { listAnalysisQueueItems } from '../analysisQueue/analysisQueueRepository';
import { listCategories } from '../db/categoryRepository';
import { searchBookmarks } from '../db/bookmarkRepository';
import { listTags } from '../db/tagRepository';
import type { AnalysisQueueItem } from '../analysisQueue/analysisQueueTypes';
import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';

export function BookmarksPage() {
  const [query, setQuery] = useState('');
  const [duplicateFilter, setDuplicateFilter] = useState<'all' | 'candidate' | 'confirmed' | 'not_duplicate'>('all');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [queueItems, setQueueItems] = useState<AnalysisQueueItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    void Promise.all([searchBookmarks(query), listCategories(), listTags(), listAnalysisQueueItems()])
      .then(([nextBookmarks, nextCategories, nextTags, nextQueueItems]) => {
        if (isMounted) {
          setBookmarks(nextBookmarks);
          setCategories(nextCategories);
          setTags(nextTags);
          setQueueItems(nextQueueItems);
          setError('');
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('북마크를 불러오지 못했습니다.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-2xl font-black text-white">북마크</h2>
        <div className="mt-4">
          <SearchInput onChange={setQuery} value={query} />
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-slate-300">중복 필터</span>
          <select
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setDuplicateFilter(event.target.value as typeof duplicateFilter)}
            value={duplicateFilter}
          >
            <option value="all">전체</option>
            <option value="candidate">중복 후보</option>
            <option value="confirmed">중복 확정</option>
            <option value="not_duplicate">중복 아님</option>
          </select>
        </label>
      </section>

      {error ? (
        <section className="rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-sm text-red-200">
          {error}
        </section>
      ) : null}

      {bookmarks.length === 0 && !query ? (
        <EmptyState
          actionLabel="첫 북마크 추가하기"
          actionTo="/add"
          description="트윗 링크나 본문을 저장하면 mock 분석 결과와 함께 이곳에 표시됩니다."
          title="아직 저장된 북마크가 없습니다."
        />
      ) : null}

      {bookmarks.length === 0 && query ? (
        <EmptyState
          actionLabel="새 북마크 추가하기"
          actionTo="/add"
          description="검색어를 바꾸거나 새 북마크를 추가해보세요."
          title="검색 결과가 없습니다."
        />
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        {bookmarks
          .filter((bookmark) => duplicateFilter === 'all' || bookmark.duplicateStatus === duplicateFilter)
          .map((bookmark) => (
          <BookmarkCard
            bookmark={bookmark}
            category={categories.find((category) => category.id === bookmark.categoryId)}
            key={bookmark.id}
            queueItem={queueItems.find((item) => item.bookmarkId === bookmark.id)}
            tags={tags.filter((tag) => bookmark.tagIds.includes(tag.id))}
          />
        ))}
      </section>
    </div>
  );
}
