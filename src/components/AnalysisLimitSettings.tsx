import { SettingsToggle } from './SettingsToggle';
import type { AppSettings } from '../types/appSettings';

type AnalysisLimitChanges = Partial<Omit<AppSettings, 'id' | 'createdAt'>>;

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function NumberSetting({
  label,
  max,
  min,
  onChange,
  value
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">{label}</span>
      <input
        className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
        max={max}
        min={min}
        onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
        type="number"
        value={value}
      />
      <span className="mt-1 block text-xs text-slate-500">
        {min}~{max}
      </span>
    </label>
  );
}

export function AnalysisLimitSettings({
  onChange,
  settings
}: {
  onChange: (changes: AnalysisLimitChanges) => void;
  settings: AppSettings;
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <div>
        <h3 className="text-lg font-black text-white">AI 분석 제한</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          자동 분석 비용이 과도하게 늘지 않도록 하루 시도 수, 입력 길이, 재시도 정책을 조정합니다.
        </p>
      </div>
      <SettingsToggle
        checked={settings.analysisAutoRun}
        description="저장된 북마크를 대기열에 넣고 조건이 맞으면 자동으로 분석합니다."
        onChange={(analysisAutoRun) => onChange({ analysisAutoRun })}
        title="자동 분석 실행"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberSetting
          label="하루 분석 시도 한도"
          max={500}
          min={1}
          onChange={(analysisDailyLimit) => onChange({ analysisDailyLimit })}
          value={settings.analysisDailyLimit}
        />
        <NumberSetting
          label="최대 입력 글자 수"
          max={20000}
          min={500}
          onChange={(analysisMaxInputChars) => onChange({ analysisMaxInputChars })}
          value={settings.analysisMaxInputChars}
        />
      </div>
      <SettingsToggle
        checked={settings.analysisRetryEnabled}
        description="일시적인 네트워크/API 오류가 나면 대기 시간을 둔 뒤 다시 시도합니다."
        onChange={(analysisRetryEnabled) => onChange({ analysisRetryEnabled })}
        title="실패 재시도"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberSetting
          label="최대 재시도 횟수"
          max={10}
          min={0}
          onChange={(analysisMaxAttempts) => onChange({ analysisMaxAttempts })}
          value={settings.analysisMaxAttempts}
        />
        <NumberSetting
          label="재시도 대기 시간(분)"
          max={120}
          min={1}
          onChange={(analysisCooldownMinutes) => onChange({ analysisCooldownMinutes })}
          value={settings.analysisCooldownMinutes}
        />
      </div>
    </section>
  );
}

