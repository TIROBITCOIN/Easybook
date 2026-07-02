export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/20">
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-400">{label}</p>
    </article>
  );
}
