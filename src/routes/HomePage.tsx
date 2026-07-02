import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../db/db';
import { StatCard } from '../components/StatCard';

function isToday(value?: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function HomePage() {
  const bookmarks = useLiveQuery(() => db.bookmarks.toArray(), [], []);
  const totalCount = bookmarks.length;
  const unreadCount = bookmarks.filter((bookmark) => bookmark.status === 'unread').length;
  const pendingAiCount = bookmarks.filter((bookmark) => !bookmark.difficultyExplanation.easy).length;
  const revisitTodayCount = bookmarks.filter((bookmark) => isToday(bookmark.revisitAt)).length;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20">
        <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Personal bookmark explainer</p>
        <h2 className="mt-3 text-3xl font-black leading-tight text-white">
          복잡하게 쌓인 X 북마크를 차분하게 이해하세요.
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-400">
          Easybook은 북마크를 분류하고 단계별 설명으로 다시 읽기 쉽게 만드는 개인용 앱입니다.
        </p>
        <Link
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950 sm:w-auto"
          to="/add"
        >
          첫 북마크 추가하기
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="전체 북마크" value={String(totalCount)} />
        <StatCard label="아직 안 읽음" value={String(unreadCount)} />
        <StatCard label="AI 분석 대기" value={String(pendingAiCount)} />
        <StatCard label="오늘 다시 볼 항목" value={String(revisitTodayCount)} />
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-lg font-black text-white">오늘 다시 볼 북마크</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {revisitTodayCount > 0
            ? `${revisitTodayCount}개의 북마크가 오늘 다시 볼 항목입니다.`
            : '오늘 다시 볼 북마크가 없습니다.'}
        </p>
      </section>
    </div>
  );
}
