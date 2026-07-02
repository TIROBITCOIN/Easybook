import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/', label: '홈' },
  { to: '/bookmarks', label: '북마크' },
  { to: '/add', label: '추가' },
  { to: '/categories', label: '카테고리' },
  { to: '/settings', label: '설정' }
];

export function AppShell() {
  return (
    <div className="screen">
      <header className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-accent">Easybook</p>
          <h1 className="text-2xl font-black text-ink">북마크 해설 노트</h1>
        </div>
      </header>

      <Outlet />

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-slate-950/90 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1">
          {tabs.map((tab) => (
            <NavLink
              className={({ isActive }) =>
                `rounded-xl px-2 py-2 text-center text-xs font-bold ${
                  isActive ? 'bg-accent text-slate-950' : 'text-muted'
                }`
              }
              key={tab.to}
              to={tab.to}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
