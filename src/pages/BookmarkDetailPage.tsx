import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { analyzeAndSaveBookmark } from '../lib/ai';
import {
  deleteBookmark,
  getBookmark,
  listCategories,
  listTags,
  updateBookmark
} from '../db/repo';
import type { BookmarkItem, BookmarkStatus, Category, Importance, Tag } from '../types';

export function BookmarkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookmark, setBookmark] = useState<BookmarkItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [memo, setMemo] = useState('');

  const refresh = useCallback(async () => {
    if (!id) return;
    const [nextBookmark, nextCategories, nextTags] = await Promise.all([
      getBookmark(id),
      listCategories(),
      listTags()
    ]);
    setBookmark(nextBookmark ?? null);
    setMemo(nextBookmark?.userMemo ?? '');
    setCategories(nextCategories);
    setTags(nextTags);
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!bookmark) {
    return (
      <main className="card">
        <p className="text-muted">북마크를 찾을 수 없습니다.</p>
        <Link className="btn mt-4" to="/bookmarks">
          목록으로
        </Link>
      </main>
    );
  }

  const selectedTags = tags.filter((tag) => bookmark.tagIds.includes(tag.id));

  return (
    <main className="space-y-4">
      <section className="card">
        <div className="flex flex-wrap gap-2">
          <span className="pill">{bookmark.source}</span>
          <span className="pill">{bookmark.status}</span>
          <span className="pill">{bookmark.importance}</span>
          {bookmark.aiMeta.needsReview ? <span className="pill text-gold">needsReview</span> : null}
        </div>
        <h2 className="mt-4 text-2xl font-black text-ink">{bookmark.title || '제목 없는 북마크'}</h2>
        {bookmark.sourceUrl ? (
          <a className="mt-3 block break-all text-sm font-bold text-accent" href={bookmark.sourceUrl} rel="noreferrer" target="_blank">
            원본 링크 열기
          </a>
        ) : null}
      </section>

      <section className="card space-y-3">
        <h3 className="font-black text-ink">상태</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="input"
            onChange={async (event) => {
              await updateBookmark(bookmark.id, { status: event.target.value as BookmarkStatus });
              await refresh();
            }}
            value={bookmark.status}
          >
            <option value="unread">unread</option>
            <option value="read">read</option>
            <option value="archived">archived</option>
          </select>
          <select
            className="input"
            onChange={async (event) => {
              await updateBookmark(bookmark.id, { importance: event.target.value as Importance });
              await refresh();
            }}
            value={bookmark.importance}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <select
            className="input"
            onChange={async (event) => {
              await updateBookmark(bookmark.id, { categoryId: event.target.value || null });
              await refresh();
            }}
            value={bookmark.categoryId ?? ''}
          >
            <option value="">카테고리 없음</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="card">
        <h3 className="font-black text-ink">요약</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{bookmark.summary || '아직 분석 결과가 없습니다.'}</p>
        <button
          className="btn-secondary mt-4 w-full"
          onClick={async () => {
            await analyzeAndSaveBookmark(bookmark);
            await refresh();
          }}
          type="button"
        >
          AI 분석 재시도
        </button>
      </section>

      <section className="grid gap-3">
        <Explanation title="하" value={bookmark.difficultyExplanation.easy} />
        <Explanation title="중" value={bookmark.difficultyExplanation.medium} />
        <Explanation title="상" value={bookmark.difficultyExplanation.advanced} />
      </section>

      <section className="card">
        <h3 className="font-black text-ink">원문</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
          {bookmark.originalText || '공유된 본문이 없습니다.'}
        </p>
      </section>

      <section className="card">
        <h3 className="font-black text-ink">태그</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span className="pill" key={tag.id}>
              #{tag.name}
            </span>
          ))}
          {selectedTags.length === 0 ? <p className="text-sm text-muted">태그가 없습니다.</p> : null}
        </div>
      </section>

      <section className="card">
        <label>
          <span className="label">내 메모</span>
          <textarea className="input min-h-32" onChange={(event) => setMemo(event.target.value)} value={memo} />
        </label>
        <button
          className="btn mt-3 w-full"
          onClick={async () => {
            await updateBookmark(bookmark.id, { userMemo: memo });
            await refresh();
          }}
          type="button"
        >
          메모 저장
        </button>
      </section>

      <button
        className="btn-secondary w-full border-red-900/70 text-red-200"
        onClick={async () => {
          await deleteBookmark(bookmark.id);
          navigate('/bookmarks');
        }}
        type="button"
      >
        삭제
      </button>
    </main>
  );
}

function Explanation({ title, value }: { title: string; value: string }) {
  return (
    <section className="card">
      <h3 className="font-black text-ink">{title} 설명</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{value || '아직 분석 결과가 없습니다.'}</p>
    </section>
  );
}
