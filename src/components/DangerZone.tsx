import { useState } from 'react';

export function DangerZone({ onDeleteAll }: { onDeleteAll: () => Promise<void> }) {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <section className="rounded-3xl border border-red-400/30 bg-red-400/10 p-5">
      <h3 className="text-lg font-black text-red-100">위험 구역</h3>
      <p className="mt-2 text-sm leading-6 text-red-100/80">
        전체 데이터를 삭제하면 북마크, 카테고리, 태그, 설정이 모두 사라집니다. 아직 백업 기능이 없으니
        신중하게 진행하세요.
      </p>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-red-100">DELETE 입력</span>
        <input
          className="min-h-12 w-full rounded-2xl border border-red-300/40 bg-slate-950 px-4 text-base text-white outline-none"
          onChange={(event) => setConfirmation(event.target.value)}
          value={confirmation}
        />
      </label>
      <button
        className="mt-4 min-h-12 w-full rounded-2xl bg-red-300 px-5 text-sm font-black text-slate-950 disabled:opacity-60"
        disabled={confirmation !== 'DELETE' || isDeleting}
        onClick={async () => {
          setIsDeleting(true);
          await onDeleteAll();
        }}
        type="button"
      >
        전체 데이터 삭제
      </button>
    </section>
  );
}
