import { ChangeEvent, useState } from 'react';
import {
  createEncryptedBackup,
  createPlainBackup,
  downloadTextFile,
  importEncryptedBackup,
  importPlainBackup
} from '../lib/backup';
import { hashPassword } from '../lib/crypto';
import { updateSettings } from '../db/repo';
import type { AppSettings, BackupMode, Theme } from '../types';

export function SettingsPage({
  settings,
  onSettingsChanged
}: {
  settings: AppSettings;
  onSettingsChanged: (settings: AppSettings) => void;
}) {
  const [password, setPassword] = useState('');
  const [backupPassword, setBackupPassword] = useState('');
  const [message, setMessage] = useState('');

  const patchSettings = async (changes: Partial<Omit<AppSettings, 'id'>>) => {
    onSettingsChanged(await updateSettings(changes));
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (settings.backupMode === 'encrypted') {
      await importEncryptedBackup(text, backupPassword);
    } else {
      await importPlainBackup(text);
    }
    setMessage('백업을 가져왔습니다.');
  };

  return (
    <main className="space-y-4">
      <section className="card">
        <h2 className="text-2xl font-black text-ink">설정/백업</h2>
        <p className="mt-2 text-sm text-muted">서버 DB 없이 브라우저 IndexedDB에만 데이터를 저장합니다.</p>
      </section>

      <section className="card space-y-4">
        <h3 className="font-black text-ink">앱 잠금</h3>
        <label className="flex items-center justify-between gap-3 text-sm text-muted">
          로컬 비밀번호 잠금
          <input
            checked={settings.appLockEnabled}
            onChange={(event) => patchSettings({ appLockEnabled: event.target.checked })}
            type="checkbox"
          />
        </label>
        <input className="input" onChange={(event) => setPassword(event.target.value)} placeholder="새 비밀번호" type="password" value={password} />
        <button
          className="btn-secondary w-full"
          onClick={async () => {
            if (password.length >= 4) {
              await patchSettings({ passwordHash: await hashPassword(password), appLockEnabled: true });
              setPassword('');
              setMessage('비밀번호를 변경했습니다.');
            }
          }}
          type="button"
        >
          비밀번호 변경
        </button>
      </section>

      <section className="card space-y-4">
        <h3 className="font-black text-ink">AI</h3>
        <label className="flex items-center justify-between gap-3 text-sm text-muted">
          자동 분석
          <input
            checked={settings.aiAutoAnalyze}
            onChange={(event) => patchSettings({ aiAutoAnalyze: event.target.checked })}
            type="checkbox"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-muted">
          민감한 내용 분석 동의
          <input
            checked={settings.aiAnalyzeSensitiveContent}
            onChange={(event) => patchSettings({ aiAnalyzeSensitiveContent: event.target.checked })}
            type="checkbox"
          />
        </label>
      </section>

      <section className="card space-y-4">
        <h3 className="font-black text-ink">화면</h3>
        <select
          className="input"
          onChange={(event) => patchSettings({ theme: event.target.value as Theme })}
          value={settings.theme}
        >
          <option value="dark">dark</option>
          <option value="light">light</option>
        </select>
      </section>

      <section className="card space-y-4">
        <h3 className="font-black text-ink">백업</h3>
        <select
          className="input"
          onChange={(event) => patchSettings({ backupMode: event.target.value as BackupMode })}
          value={settings.backupMode}
        >
          <option value="encrypted">암호화</option>
          <option value="plain">평문</option>
        </select>
        <p className="text-sm leading-6 text-gold">
          암호화 백업 비밀번호를 잊으면 복구할 수 없습니다. Easybook은 이 비밀번호를 저장하지 않습니다.
        </p>
        <input className="input" onChange={(event) => setBackupPassword(event.target.value)} placeholder="암호화 백업 비밀번호" type="password" value={backupPassword} />
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="btn"
            onClick={async () => {
              const content =
                settings.backupMode === 'encrypted'
                  ? await createEncryptedBackup(backupPassword)
                  : await createPlainBackup();
              downloadTextFile(`easybook-${settings.backupMode}-backup.json`, content);
            }}
            type="button"
          >
            내보내기
          </button>
          <label className="btn-secondary cursor-pointer">
            가져오기
            <input className="hidden" onChange={importFile} type="file" />
          </label>
        </div>
      </section>

      {message ? <p className="card text-sm text-accent">{message}</p> : null}
    </main>
  );
}
