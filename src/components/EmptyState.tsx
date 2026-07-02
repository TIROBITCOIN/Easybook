import { Link } from 'react-router-dom';

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-center shadow-2xl shadow-black/20">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel && actionTo ? (
        <Link className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
