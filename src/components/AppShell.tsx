import { NavLink, Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-28 pt-5 sm:px-6 lg:max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Easybook</p>
          <h1 className="text-2xl font-black tracking-tight text-white">북마크 해설 앱</h1>
        </div>
        <NavLink className="rounded-2xl bg-sky-300 px-4 py-3 text-sm font-black text-slate-950" to="/add">
          추가
        </NavLink>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
      </div>
      <BottomNav />
    </div>
  );
}
