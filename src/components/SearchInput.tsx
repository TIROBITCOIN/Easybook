export function SearchInput({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">검색</span>
      <input
        className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
        onChange={(event) => onChange(event.target.value)}
        placeholder="제목, 본문, 메모, 링크 검색"
        value={value}
      />
    </label>
  );
}
