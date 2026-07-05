import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSessionUnlocked } from '../auth/lockState';
import { generateSalt, hashPassword, verifyPassword } from '../auth/passwordCrypto';
import { getConfiguredProvider } from '../ai/analysisProvider';
import { AnalysisLimitSettings } from '../components/AnalysisLimitSettings';
import { AiPrivacyNotice } from '../components/AiPrivacyNotice';
import { BackupPanel } from '../components/BackupPanel';
import { DangerZone } from '../components/DangerZone';
import { InstallPwaCard } from '../components/InstallPwaCard';
import { PasswordInput } from '../components/PasswordInput';
import { SettingsToggle } from '../components/SettingsToggle';
import { clearAllData, getSettings, updateSettings } from '../db/settingsRepository';
import type { AiProvider, AppSettings, ThemeMode } from '../types/appSettings';

export function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void getSettings().then((nextSettings) => {
      setSettings(nextSettings);
      document.documentElement.dataset.theme = nextSettings.theme;
    });
  }, []);

  const patchSettings = async (changes: Partial<Omit<AppSettings, 'id' | 'createdAt'>>) => {
    const nextSettings = await updateSettings(changes);
    setSettings(nextSettings);
    document.documentElement.dataset.theme = nextSettings.theme;
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!settings?.passwordHash || !settings.passwordSalt) {
      setError('현재 비밀번호 설정이 없습니다.');
      return;
    }

    if (!(await verifyPassword(currentPassword, settings.passwordSalt, settings.passwordHash))) {
      setError('현재 비밀번호가 올바르지 않습니다.');
      return;
    }

    if (newPassword.trim().length < 6 || newPassword !== newPassword.trim()) {
      setError('새 비밀번호는 공백 없이 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('새 비밀번호와 확인 입력이 일치하지 않습니다.');
      return;
    }

    const salt = generateSalt();
    await patchSettings({
      passwordSalt: salt,
      passwordHash: await hashPassword(newPassword, salt),
      appLockEnabled: true
    });
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setMessage('비밀번호를 변경했습니다.');
  };

  const disableLock = async () => {
    setError('');
    setMessage('');

    if (!settings?.passwordHash || !settings.passwordSalt) {
      await patchSettings({ appLockEnabled: false, passwordHash: undefined, passwordSalt: undefined });
      setMessage('앱 잠금을 껐습니다.');
      return;
    }

    if (!(await verifyPassword(disablePassword, settings.passwordSalt, settings.passwordHash))) {
      setError('현재 비밀번호가 올바르지 않습니다.');
      return;
    }

    await patchSettings({ appLockEnabled: false, passwordHash: undefined, passwordSalt: undefined });
    setDisablePassword('');
    setMessage('앱 잠금을 껐습니다.');
  };

  if (!settings) {
    return <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-slate-400">불러오는 중...</section>;
  }

  return (
    <section className="space-y-4">
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
          설정은 IndexedDB에 저장됩니다. 비밀번호는 평문이 아니라 PBKDF2 해시와 salt로 저장합니다.
        </p>
      </div>

      {message ? <p className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-200">{message}</p> : null}
      {error ? <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p> : null}

      <InstallPwaCard />

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="text-lg font-black text-white">보안</h3>
        <SettingsToggle
          checked={settings.appLockEnabled}
          description="앱을 열 때 로컬 비밀번호를 요구합니다."
          onChange={(checked) => {
            if (checked) {
              void patchSettings({ appLockEnabled: true }).then(() => {
                clearSessionUnlocked();
                window.location.reload();
              });
            }
          }}
          title="앱 잠금"
        />
        {settings.appLockEnabled ? (
          <>
            <form className="space-y-3" onSubmit={changePassword}>
              <PasswordInput label="현재 비밀번호" onChange={setCurrentPassword} value={currentPassword} />
              <PasswordInput label="새 비밀번호" onChange={setNewPassword} value={newPassword} />
              <PasswordInput label="새 비밀번호 확인" onChange={setNewPasswordConfirm} value={newPasswordConfirm} />
              <button className="min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" type="submit">
                비밀번호 변경
              </button>
            </form>
            <div className="space-y-3">
              <PasswordInput label="앱 잠금 끄기 확인 비밀번호" onChange={setDisablePassword} value={disablePassword} />
              <button className="min-h-12 w-full rounded-2xl bg-slate-800 px-5 text-sm font-black text-white" onClick={disableLock} type="button">
                앱 잠금 끄기
              </button>
            </div>
          </>
        ) : (
          <button
            className="min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950"
            onClick={() => {
              void patchSettings({ appLockEnabled: true });
              clearSessionUnlocked();
              window.location.reload();
            }}
            type="button"
          >
            앱 잠금 다시 설정
          </button>
        )}
        <button
          className="min-h-12 w-full rounded-2xl bg-slate-800 px-5 text-sm font-black text-white"
          onClick={() => {
            clearSessionUnlocked();
            navigate('/');
            window.location.reload();
          }}
          type="button"
        >
          지금 잠그기
        </button>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="text-lg font-black text-white">AI 분석</h3>
        <SettingsToggle
          checked={settings.aiAutoAnalyze}
          description="새 북마크를 저장하면 자동 분석을 실행합니다."
          onChange={(checked) => void patchSettings({ aiAutoAnalyze: checked })}
          title="AI 자동 분석"
        />
        <SettingsToggle
          checked={settings.aiAnalyzeSensitiveContent}
          description="민감한 내용 분석 동의 상태를 로컬 설정에 저장합니다."
          onChange={(checked) => void patchSettings({ aiAnalyzeSensitiveContent: checked })}
          title="민감한 내용 분석"
        />
        <label>
          <span className="mb-2 block text-sm font-bold text-slate-300">AI 제공자</span>
          <select
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => void patchSettings({ aiProvider: event.target.value as AiProvider })}
            value={settings.aiProvider}
          >
            <option value="real">real - /api/analyze-bookmark</option>
            <option value="mock">mock - local deterministic analyzer</option>
          </select>
        </label>
        <p className="text-xs leading-5 text-slate-500">환경변수 기본값: {getConfiguredProvider()}</p>
        <p className="text-sm text-slate-400">
          AI 프라이버시 동의: {settings.hasAcceptedAiPrivacyNotice ? '동의 완료' : '동의 전'}
        </p>
        <button className="min-h-12 w-full rounded-2xl bg-slate-800 px-5 text-sm font-black text-white" onClick={() => setShowPrivacyNotice(true)} type="button">
          동의 문구 다시 보기
        </button>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="text-lg font-black text-white">화면</h3>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-slate-300">테마</span>
          <select
            className="min-h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-sky-300"
            onChange={(event) => void patchSettings({ theme: event.target.value as ThemeMode })}
            value={settings.theme}
          >
            <option value="dark">dark</option>
            <option value="light">light</option>
          </select>
        </label>
      </section>

      <AnalysisLimitSettings settings={settings} onChange={(changes) => void patchSettings(changes)} />

      <BackupPanel
        onRestored={async () => {
          const nextSettings = await getSettings();
          setSettings(nextSettings);
          document.documentElement.dataset.theme = nextSettings.theme;
        }}
      />

      <DangerZone
        onDeleteAll={async () => {
          await clearAllData();
          clearSessionUnlocked();
          window.location.reload();
        }}
      />
    </section>
  );
}
