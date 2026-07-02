export function DifficultyExplanation({
  label,
  value
}: {
  label: '하' | '중' | '상';
  value: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <h3 className="font-black text-white">{label} 설명</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{value || 'AI 분석 전입니다.'}</p>
    </article>
  );
}
