import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { analyzeAndSaveBookmark } from '../lib/ai';
import { getSharedInputFromUrl } from '../lib/share';
import { createBookmark } from '../db/repo';
import type { BookmarkSource } from '../types';

export function AddBookmarkPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sharedInput = useMemo(() => getSharedInputFromUrl(location.search), [location.search]);
  const [source, setSource] = useState<BookmarkSource>(sharedInput?.source ?? 'manual-url');
  const [sourceUrl, setSourceUrl] = useState(sharedInput?.sourceUrl ?? '');
  const [originalText, setOriginalText] = useState(sharedInput?.originalText ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sharedInput) {
      setSource(sharedInput.source);
      setSourceUrl(sharedInput.sourceUrl);
      setOriginalText(sharedInput.originalText);
    }
  }, [sharedInput]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sourceUrl.trim() && !originalText.trim()) {
      return;
    }

    setIsSaving(true);
    const bookmark = await createBookmark({ source, sourceUrl, originalText });
    await analyzeAndSaveBookmark(bookmark);
    navigate(`/bookmarks/${bookmark.id}`);
  };

  return (
    <main className="space-y-4">
      <section className="card">
        <p className="text-xs font-bold uppercase tracking-normal text-accent">Add</p>
        <h2 className="mt-2 text-2xl font-black text-ink">북마크 추가</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          X 앱 공유하기로 들어온 URL/text도 이 화면에서 저장됩니다.
        </p>
      </section>

      <form className="card space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="label">소스</span>
          <select className="input" onChange={(event) => setSource(event.target.value as BookmarkSource)} value={source}>
            <option value="x-share">X 공유</option>
            <option value="manual-url">URL 직접 입력</option>
            <option value="manual-text">본문 직접 입력</option>
            <option disabled value="x-api">
              X API 예정
            </option>
          </select>
        </label>
        <label className="block">
          <span className="label">원본 링크</span>
          <input className="input" onChange={(event) => setSourceUrl(event.target.value)} value={sourceUrl} />
        </label>
        <label className="block">
          <span className="label">본문 또는 메모</span>
          <textarea
            className="input min-h-40"
            onChange={(event) => setOriginalText(event.target.value)}
            value={originalText}
          />
        </label>
        <button className="btn w-full" disabled={isSaving} type="submit">
          저장하고 AI 분석
        </button>
      </form>
    </main>
  );
}
