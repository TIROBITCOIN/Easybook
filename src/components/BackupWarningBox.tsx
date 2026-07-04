import type { ReactNode } from 'react';

export function BackupWarningBox({
  title,
  children,
  tone = 'warning'
}: {
  title: string;
  children: ReactNode;
  tone?: 'warning' | 'danger';
}) {
  const classes =
    tone === 'danger'
      ? 'border-red-400/30 bg-red-400/10 text-red-100'
      : 'border-amber-300/30 bg-amber-300/10 text-amber-100';

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className="text-sm font-black">{title}</p>
      <div className="mt-2 text-sm leading-6 opacity-90">{children}</div>
    </div>
  );
}
