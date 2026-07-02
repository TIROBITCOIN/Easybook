import { FormEvent, useState } from 'react';
import { setSessionUnlocked } from '../auth/lockState';
import { generateSalt, hashPassword } from '../auth/passwordCrypto';
import { PasswordInput } from '../components/PasswordInput';
import { updateSettings } from '../db/settingsRepository';

export function SetupPasswordPage({ onReady }: { onReady: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = password.trim();

    if (trimmed.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (trimmed !== password) {
      setError('비밀번호 앞뒤 공백은 사용할 수 없습니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호와 확인 입력이 일치하지 않습니다.');
      return;
    }

    const salt = generateSalt();
    await updateSettings({
      appLockEnabled: true,
      passwordSalt: salt,
      passwordHash: await hashPassword(password, salt)
    });
    setSessionUnlocked();
    onReady();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-50">
      <form
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-black/30"
        onSubmit={submit}
      >
        <p className="text-xs font-bold uppercase tracking-normal text-sky-300">Easybook</p>
        <h1 className="mt-2 text-3xl font-black text-white">로컬 잠금 설정</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          이 비밀번호는 계정 로그인이 아니라 같은 브라우저 안의 Easybook 데이터를 여는 로컬 잠금입니다.
          평문으로 저장하지 않고 PBKDF2 해시로 저장합니다.
        </p>
        <div className="mt-5 space-y-4">
          <PasswordInput autoFocus label="비밀번호" onChange={setPassword} value={password} />
          <PasswordInput label="비밀번호 확인" onChange={setConfirmPassword} value={confirmPassword} />
        </div>
        {error ? <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p> : null}
        <button className="mt-5 min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" type="submit">
          시작하기
        </button>
      </form>
    </main>
  );
}
