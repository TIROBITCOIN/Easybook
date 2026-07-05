import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { AnalysisQueuePanel } from '../components/AnalysisQueuePanel';
import { BookmarkCard } from '../components/BookmarkCard';
import { StatCard } from '../components/StatCard';
import { db } from '../db/db';

export function HomePage() {
  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('createdAt').reverse().toArray(), [], []);
  const categories = useLiveQuery(() => db.categories.toArray(), [], []);
  const tags = useLiveQuery(() => db.tags.toArray(), [], []);
  const queueItems = useLiveQuery(() => db.analysisQueue.orderBy('createdAt').reverse().toArray(), [], []);
  const settings = useLiveQuery(() => db.settings.get('default'), [], undefined);
  const totalCount = bookmarks.length;
  const unreadCount = bookmarks.filter((bookmark) => bookmark.status === 'unread').length;
  const pendingAiCount = bookmarks.filter((bookmark) => !bookmark.difficultyExplanation.easy).length;
  const reviewCategoryCount = categories.filter((category) => category.needsReview).length;
  const recentAnalyzed = bookmarks.filter((bookmark) => bookmark.aiMeta.analyzedAt).slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20">
        <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Personal bookmark explainer</p>
        <h2 className="mt-3 text-3xl font-black leading-tight text-white">
          복잡하게 쌓인 X 북마크를 차분하게 이해하세요.
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-400">
          Easybook은 저장한 북마크를 mock AI로 분류하고, 하/중/상 설명을 만들어 다시 읽기 쉽게 정리합니다.
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
        <StatCard label="검토 필요 카테고리" value={String(reviewCategoryCount)} />
      </section>

      <AnalysisQueuePanel dailyLimit={settings?.analysisDailyLimit ?? 30} queueItems={queueItems} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-white">최근 분석된 북마크</h2>
          <Link className="text-sm font-bold text-sky-300" to="/bookmarks">
            전체 보기
          </Link>
        </div>
        <div className="grid gap-3">
          {recentAnalyzed.map((bookmark) => (
            <BookmarkCard
              bookmark={bookmark}
              category={categories.find((category) => category.id === bookmark.categoryId)}
              key={bookmark.id}
              queueItem={queueItems.find((item) => item.bookmarkId === bookmark.id)}
              tags={tags.filter((tag) => bookmark.tagIds.includes(tag.id))}
            />
          ))}
          {recentAnalyzed.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-400">
              아직 분석된 북마크가 없습니다.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
