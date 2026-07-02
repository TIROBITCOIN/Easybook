const items = ['앱 잠금: 준비 중', 'AI 자동 분석: 준비 중', '백업/복원: 준비 중', 'PWA 공유 기능: 준비 중'];

export function SettingsPage() {
  return (
    <section className="space-y-3">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-2xl font-black text-white">설정</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">핵심 기능은 다음 PR부터 순서대로 연결됩니다.</p>
      </div>
      {items.map((item) => (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-base font-bold text-slate-300" key={item}>
          {item}
        </div>
      ))}
    </section>
  );
}
