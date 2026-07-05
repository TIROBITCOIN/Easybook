import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AiPrivacyNotice } from '../components/AiPrivacyNotice';
import {
  analyzeBookmark,
  createBookmark,
  findBookmarkBySourceUrl
} from '../db/bookmarkRepository';
import { getSettings, updateSettings } from '../db/settingsRepository';
import { normalizeSharedBookmark, parseShareTargetParams } from '../pwa/shareTarget';
import type { BookmarkItem } from '../types/bookmark';

export function ShareTargetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sharedBookmark = useMemo(
    () => normalizeSharedBookmark(parseShareTargetParams(searchParams)),
    [searchParams]
  );
  const [sourceUrl, setSourceUrl] = useState(sharedBookmark.sourceUrl ?? '');
  const [originalText, setOriginalText] = useState(sharedBookmark.originalText);
  const [title, setTitle] = useState(sharedBookmark.title ?? '');
  const [userMemo, setUserMemo] = useState('');
  const [duplicateBookmark, setDuplicateBookmark] = useState<BookmarkItem | null>(null);
  const [allowDuplicateSave, setAllowDuplicateSave] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingBookmarkId, setPendingBookmarkId] = useState('');

  useEffect(() => {
    setSourceUrl(sharedBookmark.sourceUrl ?? '');
    setOriginalText(sharedBookmark.originalText);
    setTitle(sharedBookmark.title ?? '');
    setAllowDuplicateSave(false);
  }, [sharedBookmark]);

  useEffect(() => {
    let isMounted = true;
    const trimmedUrl = sourceUrl.trim();

    if (!trimmedUrl) {
      setDuplicateBookmark(null);
      return;
    }

    void findBookmarkBySourceUrl(trimmedUrl).then((bookmark) => {
      if (isMounted) {
        setDuplicateBookmark(bookmark ?? null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [sourceUrl]);

  const analyzeAndNavigate = async (bookmarkId: string) => {
    await analyzeBookmark(bookmarkId);
    navigate(`/bookmarks/${bookmarkId}`);
  };

  const submit = async (event?: FormEvent<HTMLFormElement>, forceDuplicateSave = false) => {
    event?.preventDefault();
    setError('');

    if (!sourceUrl.trim() && !originalText.trim()) {
      setError('공유된 링크나 텍스트가 없습니다. 링크를 붙여넣거나 본문을 입력해 주세요.');
      return;
    }

    if (duplicateBookmark && !allowDuplicateSave && !forceDuplicateSave) {
      setError('같은 URL의 북마크가 이미 있습니다. 기존 북마크를 열거나 그래도 새로 저장할 수 있습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const bookmark = await createBookmark({ sourceUrl, originalText, title, userMemo });
      const settings = await getSettings();

      if (!settings.aiAutoAnalyze) {
        navigate(`/bookmarks/${bookmark.id}`);
        return;
      }

      if (!settings.hasAcceptedAiPrivacyNotice) {
        setPendingBookmarkId(bookmark.id);
        return;
      }

      await analyzeAndNavigate(bookmark.id);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '북마크 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDuplicate = () => {
    setAllowDuplicateSave(true);
    void submit(undefined, true);
  };

  const hasSharedContent = Boolean(sharedBookmark.sourceUrl || sharedBookmark.originalText);

  return (
    <>
      {pendingBookmarkId ? (
        <AiPrivacyNotice
          onAccept={async () => {
            await updateSettings({ hasAcceptedAiPrivacyNotice: true });
            const bookmarkId = pendingBookmarkId;
            setPendingBookmarkId('');
            setIsSaving(true);
            await analyzeAndNavigate(bookmarkId);
          }}
          onDecline={() => {
            const bookmarkId = pendingBookmarkId;
            setPendingBookmarkId('');
            navigate(`/bookmarks/${bookmarkId}`);
          }}
        />
      ) : null}

      <form
        className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20"
        onSubmit={submit}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Share target</p>
          <h2 className="mt-2 text-2xl font-black text-white">공유된 북마크 가져오기</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            공유된 링크와 텍스트를 확인한 뒤 Easybook의 로컬 북마크로 저장합니다.
          </p>
        </div>

        {!hasSharedContent ? (
          <section className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            공유 데이터가 없습니다. 브라우저 공유 메뉴가 지원되지 않으면 링크를 복사해서 아래에 붙여넣으세요.
          </section>
        ) : null}

        {duplicateBookmark ? (
          <section className="space-y-3 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
            <p className="font-bold">같은 URL의 북마크가 이미 있습니다.</p>
            <p>{duplicateBookmark.title}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
                to={`/bookmarks/${duplicateBookmark.id}`}
              >
                기존 북마크 열기
              </Link>
              <button
                className="min-h-12 rounded-2xl bg-sky-300 px-4 text-sm font-black text-slate-950 disabled:opacity-60"
                disabled={isSaving}
                onClick={saveDuplicate}
                type="button"
              >
                그래도 새로 저장
              </button>
            </div>
          </section>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">공유된 링크</span>
          <input
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => {
              setSourceUrl(event.target.value);
              setAllowDuplicateSave(false);
            }}
            placeholder="https://x.com/..."
            value={sourceUrl}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">제목</span>
          <input
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="비워두면 본문이나 링크에서 제목을 만듭니다."
            value={title}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">공유된 텍스트</span>
          <textarea
            className="min-h-36 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setOriginalText(event.target.value)}
            placeholder="공유된 본문 또는 직접 붙여넣은 텍스트"
            value={originalText}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">내 메모</span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setUserMemo(event.target.value)}
            placeholder="나중에 다시 볼 이유를 적어두세요."
            value={userMemo}
          />
        </label>

        {error ? <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p> : null}

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className="min-h-12 rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950 disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
          <button
            className="min-h-12 rounded-2xl bg-slate-800 px-5 text-sm font-black text-white"
            onClick={() => navigate('/add')}
            type="button"
          >
            취소
          </button>
        </div>
      </form>
    </>
  );
}
