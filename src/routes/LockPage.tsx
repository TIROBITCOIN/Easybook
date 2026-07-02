import { FormEvent, useState } from 'react';
import { setSessionUnlocked } from '../auth/lockState';
import { verifyPassword } from '../auth/passwordCrypto';
import { PasswordInput } from '../components/PasswordInput';
import type { AppSettings } from '../types/appSettings';

export function LockPage({ settings, onUnlock }: { settings: AppSettings; onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (Date.now() < lockedUntil) {
      setError('잠시 후 다시 시도해 주세요.');
      return;
    }

    if (!settings.passwordSalt || !settings.passwordHash) {
      setError('잠금 설정이 올바르지 않습니다.');
      return;
    }

    if (await verifyPassword(password, settings.passwordSalt, settings.passwordHash)) {
      setSessionUnlocked();
      onUnlock();
      return;
    }

    const nextFailCount = failCount + 1;
    setFailCount(nextFailCount);
    if (nextFailCount >= 5) {
      setLockedUntil(Date.now() + 10000);
      setFailCount(0);
      setError('비밀번호가 올바르지 않습니다. 10초 후 다시 시도해 주세요.');
      return;
    }

    setError('비밀번호가 올바르지 않습니다.');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-50">
      <form
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-black/30"
        onSubmit={submit}
      >
        <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Easybook</p>
        <h1 className="mt-2 text-3xl font-black text-white">잠금 해제</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">로컬 데이터를 열려면 비밀번호를 입력하세요.</p>
        <div className="mt-5">
          <PasswordInput autoFocus label="비밀번호" onChange={setPassword} value={password} />
        </div>
        {error ? <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p> : null}
        <button className="mt-5 min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" type="submit">
          잠금 해제
        </button>
      </form>
    </main>
  );
}
