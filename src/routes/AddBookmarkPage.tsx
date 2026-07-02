import { FormEvent, useState } from 'react';

export function AddBookmarkPage() {
  const [message, setMessage] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('다음 PR에서 저장 기능이 추가됩니다.');
  };

  return (
    <form className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/20" onSubmit={submit}>
      <div>
        <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Add bookmark</p>
        <h2 className="mt-2 text-2xl font-black text-white">북마크 추가</h2>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-300">트윗 링크</span>
        <input className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300" placeholder="https://x.com/..." />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-300">트윗 본문</span>
        <textarea className="min-h-36 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-sky-300" placeholder="본문을 붙여넣으세요." />
      </label>
      <button className="min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" type="submit">
        저장
      </button>
      {message ? <p className="rounded-2xl border border-sky-300/30 bg-sky-300/10 p-4 text-sm text-sky-200">{message}</p> : null}
    </form>
  );
}
