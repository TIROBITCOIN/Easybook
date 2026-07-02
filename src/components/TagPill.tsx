import type { Tag } from '../types/tag';

export function TagPill({ tag }: { tag: Tag }) {
  return <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300">#{tag.name}</span>;
}
