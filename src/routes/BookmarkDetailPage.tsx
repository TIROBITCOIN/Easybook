import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AiPrivacyNotice } from '../components/AiPrivacyNotice';
import { AnalysisErrorBox } from '../components/AnalysisErrorBox';
import { AnalysisStatusBadge } from '../components/AnalysisStatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { DifficultyExplanation } from '../components/DifficultyExplanation';
import { TagPill } from '../components/TagPill';
import {
  analyzeBookmark,
  deleteBookmark,
  getBookmark,
  updateBookmarkImportance,
  updateBookmarkStatus
} from '../db/bookmarkRepository';
import { getCategory } from '../db/categoryRepository';
import { getSettings, updateSettings } from '../db/settingsRepository';
import { listTags } from '../db/tagRepository';
import type { BookmarkImportance, BookmarkItem, BookmarkStatus } from '../types/bookmark';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function BookmarkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookmark, setBookmark] = useState<BookmarkItem | null>(null);
  const [category, setCategory] = useState<Category | undefined>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!id) {
      setBookmark(null);
      setIsLoading(false);
      return;
    }

    try {
      const nextBookmark = (await getBookmark(id)) ?? null;
      const allTags = await listTags();
      setBookmark(nextBookmark);
      setCategory(await getCategory(nextBookmark?.categoryId));
      setTags(nextBookmark ? allTags.filter((tag) => nextBookmark.tagIds.includes(tag.id)) : []);
      setError('');
    } catch {
      setError('북마크를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setStatus = async (status: BookmarkStatus) => {
    if (!bookmark) return;
    await updateBookmarkStatus(bookmark.id, status);
    await refresh();
  };

  const setImportance = async (importance: BookmarkImportance) => {
    if (!bookmark) return;
    await updateBookmarkImportance(bookmark.id, importance);
    await refresh();
  };

  const rerunAnalysis = async () => {
    if (!bookmark) return;
    const settings = await getSettings();
    if (!settings.hasAcceptedAiPrivacyNotice) {
      setShowPrivacyNotice(true);
      return;
    }

    setIsAnalyzing(true);
    await analyzeBookmark(bookmark.id);
    await refresh();
    setIsAnalyzing(false);
  };

  if (isLoading) {
    return <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">불러오는 중...</section>;
  }

  if (error) {
    return <section className="rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">{error}</section>;
  }

  if (!bookmark) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-center">
        <h2 className="text-xl font-black text-white">북마크를 찾을 수 없습니다.</h2>
        <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" to="/bookmarks">
          목록으로
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {showPrivacyNotice ? (
        <AiPrivacyNotice
          onAccept={async () => {
            await updateSettings({ hasAcceptedAiPrivacyNotice: true });
            setShowPrivacyNotice(false);
            await rerunAnalysis();
          }}
          onDecline={() => setShowPrivacyNotice(false)}
        />
      ) : null}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-wrap gap-2">
          <AnalysisStatusBadge bookmark={bookmark} category={category} />
          <CategoryBadge category={category} />
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300">{bookmark.status}</span>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300">{bookmark.importance}</span>
        </div>
        <h2 className="mt-4 text-2xl font-black leading-tight text-white">{bookmark.title}</h2>
        {bookmark.sourceUrl ? (
          <a className="mt-3 block break-all text-sm font-bold text-sky-300" href={bookmark.sourceUrl} rel="noreferrer" target="_blank">
            {bookmark.sourceUrl}
          </a>
        ) : null}
      </section>

      <AnalysisErrorBox bookmark={bookmark} />

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="font-black text-white">요약</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">{bookmark.summary || 'AI 분석 전입니다.'}</p>
        <button
          className="mt-4 min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950 disabled:opacity-60"
          disabled={isAnalyzing}
          onClick={rerunAnalysis}
          type="button"
        >
          {isAnalyzing ? '다시 분석 중...' : '다시 분석하기'}
        </button>
      </section>

      <section className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagPill key={tag.id} tag={tag} />
        ))}
      </section>

      <section className="grid gap-3">
        <DifficultyExplanation label="하" value={bookmark.difficultyExplanation.easy} />
        <DifficultyExplanation label="중" value={bookmark.difficultyExplanation.medium} />
        <DifficultyExplanation label="상" value={bookmark.difficultyExplanation.advanced} />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <button className="min-h-12 rounded-2xl bg-slate-800 px-4 text-sm font-black text-white" onClick={() => setStatus('read')} type="button">
          읽음 처리
        </button>
        <button className="min-h-12 rounded-2xl bg-slate-800 px-4 text-sm font-black text-white" onClick={() => setStatus('unread')} type="button">
          안 읽음 처리
        </button>
        <button className="min-h-12 rounded-2xl bg-slate-800 px-4 text-sm font-black text-white" onClick={() => setStatus('archived')} type="button">
          아카이브 처리
        </button>
        <select
          className="min-h-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
          onChange={(event) => setImportance(event.target.value as BookmarkImportance)}
          value={bookmark.importance}
        >
          <option value="low">중요도 낮음</option>
          <option value="medium">중요도 중간</option>
          <option value="high">중요도 높음</option>
        </select>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="font-black text-white">원문</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
          {bookmark.originalText || '저장된 본문이 없습니다.'}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="font-black text-white">내 메모</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
          {bookmark.userMemo || '저장된 메모가 없습니다.'}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-sm leading-7 text-slate-400">
        <p>저장 날짜: {formatDate(bookmark.createdAt)}</p>
        <p>수정 날짜: {formatDate(bookmark.updatedAt)}</p>
        <p>분석 모델: {bookmark.aiMeta.model ?? '없음'}</p>
        <p>신뢰도: {bookmark.aiMeta.confidence ? Math.round(bookmark.aiMeta.confidence * 100) : 0}%</p>
      </section>

      <button
        className="min-h-12 w-full rounded-2xl border border-red-400/40 bg-red-400/10 px-5 text-sm font-black text-red-200"
        onClick={async () => {
          if (confirm('이 북마크를 삭제할까요?')) {
            await deleteBookmark(bookmark.id);
            navigate('/bookmarks');
          }
        }}
        type="button"
      >
        삭제
      </button>
    </div>
  );
}
