import { updateSettings } from '../db/repo';
import type { AppSettings } from '../types';

export function PrivacyNotice({
  onAccepted
}: {
  onAccepted: (settings: AppSettings) => void;
}) {
  const accept = async () => {
    onAccepted(
      await updateSettings({
        hasAcceptedAiPrivacyNotice: true,
        aiAnalyzeSensitiveContent: true
      })
    );
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4">
      <section className="card max-w-md">
        <p className="text-xs font-bold uppercase tracking-normal text-accent">AI Notice</p>
        <h2 className="mt-2 text-xl font-black text-ink">AI 분석 동의</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          북마크에는 민감한 내용이 포함될 수 있습니다. 현재 MVP는 mock AI 분석만 사용하지만, 향후 실제
          AI API를 켜면 분석 대상 텍스트가 서버리스 함수로 전송될 수 있습니다. 서버 DB에는 저장하지 않는
          구조로 유지합니다.
        </p>
        <button className="btn mt-5 w-full" onClick={accept} type="button">
          이해했고 분석을 켭니다
        </button>
      </section>
    </div>
  );
}
