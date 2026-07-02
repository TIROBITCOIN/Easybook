import type { Category } from '../types/category';

export function CategoryBadge({ category }: { category?: Category }) {
  if (!category) {
    return <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-400">미분류</span>;
  }

  return (
    <span
      className="rounded-full border px-3 py-1 text-xs font-bold"
      style={{ borderColor: category.color ?? '#7dd3fc', color: category.color ?? '#7dd3fc' }}
    >
      {category.name}
    </span>
  );
}
