import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiPrivacyNotice } from '../components/AiPrivacyNotice';
import { analyzeBookmark, createBookmark } from '../db/bookmarkRepository';
import { getSettings, updateSettings } from '../db/settingsRepository';

export function AddBookmarkPage() {
  const navigate = useNavigate();
  const [sourceUrl, setSourceUrl] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [title, setTitle] = useState('');
  const [userMemo, setUserMemo] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingBookmarkId, setPendingBookmarkId] = useState('');

  const analyzeAndNavigate = async (bookmarkId: string) => {
    await analyzeBookmark(bookmarkId);
    navigate(`/bookmarks/${bookmarkId}`);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!sourceUrl.trim() && !originalText.trim()) {
      setError('트윗 링크 또는 트윗 본문 중 하나는 반드시 입력해야 합니다.');
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
          <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Add bookmark</p>
          <h2 className="mt-2 text-2xl font-black text-white">북마크 추가</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            저장하면 AI 분석 동의 후 실제 분석 API 또는 mock provider가 실행됩니다.
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">트윗 링크</span>
          <input
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://x.com/..."
            value={sourceUrl}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">제목</span>
          <input
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="비워두면 본문 첫 40자를 사용합니다."
            value={title}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">트윗 본문</span>
          <textarea
            className="min-h-36 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setOriginalText(event.target.value)}
            placeholder="본문을 붙여넣으세요."
            value={originalText}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-300">내 메모</span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => setUserMemo(event.target.value)}
            placeholder="나중에 다시 볼 이유를 남겨보세요."
            value={userMemo}
          />
        </label>
        {error ? <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p> : null}
        <button
          className="min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950 disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </form>
    </>
  );
}
