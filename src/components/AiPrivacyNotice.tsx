export function AiPrivacyNotice({
  onAccept,
  onDecline
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4">
      <section className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/30">
        <p className="text-xs font-bold uppercase tracking-normal text-sky-300">AI privacy</p>
        <h2 className="mt-2 text-2xl font-black text-white">AI 분석 동의</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          AI 분석을 켜면 저장한 북마크의 링크와 본문이 AI 분석을 위해 외부 API로 전송됩니다.
          민감한 내용도 분석될 수 있습니다. Easybook은 서버 DB에 북마크를 저장하지 않지만, AI
          제공자의 데이터 처리 정책은 별도로 적용될 수 있습니다.
        </p>
        <div className="mt-5 grid gap-3">
          <button className="min-h-12 rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" onClick={onAccept} type="button">
            동의하고 AI 분석 사용
          </button>
          <button className="min-h-12 rounded-2xl bg-slate-800 px-5 text-sm font-black text-white" onClick={onDecline} type="button">
            나중에 하기
          </button>
        </div>
      </section>
    </div>
  );
}
