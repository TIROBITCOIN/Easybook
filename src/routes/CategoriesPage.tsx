import { FormEvent, useEffect, useState } from 'react';
import {
  countBookmarksByCategory,
  deleteCategory,
  listCategories,
  updateCategoryName
} from '../db/categoryRepository';
import type { Category } from '../types/category';

type CategoryWithCount = Category & { bookmarkCount: number };

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [editingId, setEditingId] = useState('');
  const [editingName, setEditingName] = useState('');

  const refresh = async () => {
    const nextCategories = await listCategories();
    setCategories(
      await Promise.all(
        nextCategories.map(async (category) => ({
          ...category,
          bookmarkCount: await countBookmarksByCategory(category.id)
        }))
      )
    );
  };

  useEffect(() => {
    void refresh();
  }, []);

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId || !editingName.trim()) {
      return;
    }

    await updateCategoryName(editingId, editingName);
    setEditingId('');
    setEditingName('');
    await refresh();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-2xl font-black text-white">카테고리</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          mock AI가 필요한 카테고리를 자동 생성합니다. AI 생성 카테고리는 검토 필요 상태로 표시됩니다.
        </p>
      </section>

      {categories.length === 0 ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-center">
          <h3 className="text-xl font-black text-white">아직 카테고리가 없습니다.</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            북마크를 저장하면 mock AI 분석 과정에서 카테고리가 자동 생성됩니다.
          </p>
        </section>
      ) : null}

      <section className="grid gap-3">
        {categories.map((category) => (
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5" key={category.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-white">{category.name}</h3>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-300">
                    {category.createdBy}
                  </span>
                  {category.needsReview ? (
                    <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                      검토 필요
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">{category.bookmarkCount}개 북마크</p>
              </div>
              <span className="h-5 w-5 rounded-full" style={{ backgroundColor: category.color ?? '#7dd3fc' }} />
            </div>

            {editingId === category.id ? (
              <form className="mt-4 flex gap-2" onSubmit={submitEdit}>
                <input
                  className="min-h-12 flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
                  onChange={(event) => setEditingName(event.target.value)}
                  value={editingName}
                />
                <button className="rounded-2xl bg-sky-300 px-4 text-sm font-black text-slate-950" type="submit">
                  저장
                </button>
              </form>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  className="min-h-11 rounded-2xl bg-slate-800 px-4 text-sm font-black text-white"
                  onClick={() => {
                    setEditingId(category.id);
                    setEditingName(category.name);
                  }}
                  type="button"
                >
                  이름 수정
                </button>
                <button
                  className="min-h-11 rounded-2xl border border-red-400/40 bg-red-400/10 px-4 text-sm font-black text-red-200"
                  onClick={async () => {
                    const message =
                      category.bookmarkCount > 0
                        ? '이 카테고리에 속한 북마크가 있습니다. 삭제하면 해당 북마크는 미분류가 됩니다. 삭제할까요?'
                        : '이 카테고리를 삭제할까요?';

                    if (confirm(message)) {
                      await deleteCategory(category.id);
                      await refresh();
                    }
                  }}
                  type="button"
                >
                  삭제
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
