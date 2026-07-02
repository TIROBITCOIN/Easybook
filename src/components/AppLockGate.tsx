import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { isSessionUnlocked } from '../auth/lockState';
import { getSettings } from '../db/settingsRepository';
import { LockPage } from '../routes/LockPage';
import { SetupPasswordPage } from '../routes/SetupPasswordPage';
import type { AppSettings } from '../types/appSettings';

export function AppLockGate({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const refresh = async () => {
    const nextSettings = await getSettings();
    setSettings(nextSettings);
    document.documentElement.dataset.theme = nextSettings.theme;
    setIsUnlocked(!nextSettings.appLockEnabled || isSessionUnlocked());
  };

  useEffect(() => {
    void refresh();
  }, []);

  if (!settings) {
    return <main className="min-h-screen bg-slate-950 p-5 text-slate-400">불러오는 중...</main>;
  }

  if (settings.appLockEnabled && (!settings.passwordHash || !settings.passwordSalt)) {
    return <SetupPasswordPage onReady={() => void refresh()} />;
  }

  if (settings.appLockEnabled && !isUnlocked) {
    return <LockPage onUnlock={() => setIsUnlocked(true)} settings={settings} />;
  }

  return <>{children}</>;
}
