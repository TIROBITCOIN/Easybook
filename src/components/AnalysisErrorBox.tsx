import type { BookmarkItem } from '../types/bookmark';

export function AnalysisErrorBox({ bookmark }: { bookmark: BookmarkItem }) {
  if (!bookmark.aiMeta.errorMessage) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-red-400/30 bg-red-400/10 p-5 text-sm leading-6 text-red-200">
      <p className="font-black">AI 분석 실패</p>
      <p className="mt-2">{bookmark.aiMeta.errorMessage}</p>
      {bookmark.aiMeta.errorCode ? <p className="mt-2 text-xs text-red-200/80">코드: {bookmark.aiMeta.errorCode}</p> : null}
    </section>
  );
}
