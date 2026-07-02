import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: '홈' },
  { to: '/bookmarks', label: '북마크' },
  { to: '/add', label: '추가' },
  { to: '/categories', label: '카테고리' },
  { to: '/settings', label: '설정' }
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {tabs.map((tab) => (
          <NavLink
            className={({ isActive }) =>
              `min-h-12 rounded-2xl px-2 py-2 text-center text-xs font-bold transition ${
                isActive ? 'bg-sky-300 text-slate-950' : 'text-slate-400'
              }`
            }
            end={tab.to === '/'}
            key={tab.to}
            to={tab.to}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
