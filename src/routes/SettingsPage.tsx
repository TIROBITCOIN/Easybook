import { useEffect, useState } from 'react';
import { AiPrivacyNotice } from '../components/AiPrivacyNotice';
import { getConfiguredProvider } from '../ai/analysisProvider';
import { getSettings, updateSettings } from '../db/settingsRepository';
import type { AppSettings, AiProvider } from '../types/appSettings';

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);

  useEffect(() => {
    void getSettings().then(setSettings);
  }, []);

  const patchSettings = async (changes: Partial<Omit<AppSettings, 'id'>>) => {
    setSettings(await updateSettings(changes));
  };

  if (!settings) {
    return <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">불러오는 중...</section>;
  }

  return (
    <section className="space-y-3">
      {showPrivacyNotice ? (
        <AiPrivacyNotice
          onAccept={async () => {
            setShowPrivacyNotice(false);
            await patchSettings({ hasAcceptedAiPrivacyNotice: true });
          }}
          onDecline={() => setShowPrivacyNotice(false)}
        />
      ) : null}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h2 className="text-2xl font-black text-white">설정</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          AI 분석은 서버리스 함수로 요청되며, 브라우저 번들에 OpenAI API 키를 넣지 않습니다.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-white">AI 자동 분석</h3>
            <p className="mt-1 text-sm text-slate-400">새 북마크 저장 후 자동 분석을 실행합니다.</p>
          </div>
          <input
            checked={settings.aiAutoAnalyze}
            onChange={(event) => patchSettings({ aiAutoAnalyze: event.target.checked })}
            type="checkbox"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <label>
          <span className="mb-2 block text-sm font-bold text-slate-300">AI 제공자</span>
          <select
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => patchSettings({ preferredAiProvider: event.target.value as AiProvider })}
            value={settings.preferredAiProvider}
          >
            <option value="real">real - /api/analyze-bookmark</option>
            <option value="mock">mock - local deterministic analyzer</option>
          </select>
        </label>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          기본 provider: {getConfiguredProvider()}. API 키는 VITE 환경변수로 노출하지 않습니다.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="font-black text-white">AI 프라이버시 동의</h3>
        <p className="mt-2 text-sm text-slate-400">
          현재 상태: {settings.hasAcceptedAiPrivacyNotice ? '동의 완료' : '동의 전'}
        </p>
        <button
          className="mt-4 min-h-12 w-full rounded-2xl bg-slate-800 px-5 text-sm font-black text-white"
          onClick={() => setShowPrivacyNotice(true)}
          type="button"
        >
          동의 다시 보기
        </button>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-base font-bold text-slate-300">
        앱 잠금: 다음 PR에서 구현 예정
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-base font-bold text-slate-300">
        백업/복원: 다음 PR에서 구현 예정
      </div>
    </section>
  );
}
