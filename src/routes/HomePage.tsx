import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';

export function HomePage() {
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
        <Link className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950 sm:w-auto" to="/add">
          첫 북마크 추가하기
        </Link>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="전체 북마크" value="0" />
        <StatCard label="아직 안 읽음" value="0" />
        <StatCard label="AI 분석 대기" value="0" />
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-lg font-black text-white">오늘 다시 볼 북마크</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">오늘 다시 볼 북마크가 없습니다.</p>
      </section>
    </div>
  );
}
