import { FormEvent, useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  listCategories,
  mergeCategories,
  updateCategory
} from '../db/repo';
import type { Category } from '../types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');

  const refresh = async () => setCategories(await listCategories());

  useEffect(() => {
    void refresh();
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createCategory({ name, description });
    setName('');
    setDescription('');
    await refresh();
  };

  return (
    <main className="space-y-4">
      <section className="card">
        <h2 className="text-2xl font-black text-ink">카테고리</h2>
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <input className="input" onChange={(event) => setName(event.target.value)} placeholder="카테고리 이름" value={name} />
          <input
            className="input"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="설명"
            value={description}
          />
          <button className="btn" type="submit">
            추가
          </button>
        </form>
      </section>

      <section className="card">
        <h3 className="font-black text-ink">카테고리 병합</h3>
        <p className="mt-2 text-sm text-muted">왼쪽 카테고리의 북마크를 오른쪽 카테고리로 옮긴 뒤 왼쪽을 삭제합니다.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select className="input" onChange={(event) => setSourceId(event.target.value)} value={sourceId}>
            <option value="">병합할 카테고리</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className="input" onChange={(event) => setTargetId(event.target.value)} value={targetId}>
            <option value="">대상 카테고리</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            className="btn"
            disabled={!sourceId || !targetId || sourceId === targetId}
            onClick={async () => {
              await mergeCategories(sourceId, targetId);
              setSourceId('');
              setTargetId('');
              await refresh();
            }}
            type="button"
          >
            병합
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        {categories.map((category) => (
          <article className="card" key={category.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-ink">{category.name}</h3>
                  {category.needsReview ? <span className="pill text-gold">needsReview</span> : null}
                  <span className="pill">{category.createdBy}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{category.description || '설명 없음'}</p>
              </div>
              <span className="h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} />
            </div>
            <div className="mt-4 flex gap-2">
              {category.needsReview ? (
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    await updateCategory(category.id, { needsReview: false });
                    await refresh();
                  }}
                  type="button"
                >
                  승인
                </button>
              ) : null}
              <button
                className="btn-secondary border-red-900/70 text-red-200"
                onClick={async () => {
                  await deleteCategory(category.id);
                  await refresh();
                }}
                type="button"
              >
                삭제
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
