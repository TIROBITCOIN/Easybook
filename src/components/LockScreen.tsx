import { FormEvent, useState } from 'react';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { updateSettings } from '../db/repo';
import type { AppSettings } from '../types';

export function LockScreen({
  settings,
  onUnlocked,
  onSettingsChanged
}: {
  settings: AppSettings;
  onUnlocked: () => void;
  onSettingsChanged: (settings: AppSettings) => void;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isSetup = settings.appLockEnabled && !settings.passwordHash;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('비밀번호는 4자 이상으로 설정해 주세요.');
      return;
    }

    if (isSetup || !settings.appLockEnabled) {
      const nextSettings = await updateSettings({
        appLockEnabled: true,
        passwordHash: await hashPassword(password)
      });
      onSettingsChanged(nextSettings);
      onUnlocked();
      return;
    }

    if (settings.passwordHash && (await verifyPassword(password, settings.passwordHash))) {
      onUnlocked();
      return;
    }

    setError('비밀번호가 맞지 않습니다.');
  };

  return (
    <main className="screen flex items-center justify-center">
      <form className="card w-full max-w-sm" onSubmit={submit}>
        <p className="text-xs font-bold uppercase tracking-normal text-accent">Easybook Lock</p>
        <h1 className="mt-2 text-2xl font-black text-ink">{isSetup ? '잠금 설정' : '잠금 해제'}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          비밀번호는 평문으로 저장하지 않고 SHA-256 해시로 브라우저 IndexedDB에 저장됩니다.
        </p>
        <label className="mt-5 block">
          <span className="label">로컬 비밀번호</span>
          <input
            className="input"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button className="btn mt-5 w-full" type="submit">
          {isSetup ? '설정하고 시작' : '열기'}
        </button>
      </form>
    </main>
  );
}
