const items = ['앱 잠금: 준비 중', 'AI 자동 분석: 준비 중', '백업/복원: 준비 중', 'PWA 공유 기능: 준비 중'];

export function SettingsPage() {
  return (
    <section className="space-y-3">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-2xl font-black text-white">설정</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          이번 PR에서는 북마크 로컬 저장만 연결했습니다. 나머지 기능은 다음 단계에서 추가됩니다.
        </p>
      </div>
      {items.map((item) => (
        <div
          className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-base font-bold text-slate-300"
          key={item}
        >
          {item}
        </div>
      ))}
    </section>
  );
}
