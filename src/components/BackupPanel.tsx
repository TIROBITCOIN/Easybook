import { useRef, useState } from 'react';
import { createBackupPreview, decryptBackupFile, parseBackupJson } from '../backup/importBackup';
import { createEncryptedBackupFile, createPlainBackupFile, downloadJsonBackup } from '../backup/exportBackup';
import type { BackupData, BackupFile, BackupPreview, EncryptedBackupFile, RestoreMode } from '../backup/backupTypes';
import { collectBackupData, restoreBackupData } from '../db/backupRepository';
import { PasswordInput } from './PasswordInput';
import { BackupImportPreview } from './BackupImportPreview';
import { BackupWarningBox } from './BackupWarningBox';

const plainBackupWarning =
  '평문 백업에는 북마크 원문, 링크, 메모, AI 설명, 카테고리, 태그, 설정 정보가 그대로 포함됩니다. 이 파일을 다른 사람이 열면 모든 내용을 볼 수 있습니다.';

type ImportCandidate = {
  backup: BackupFile;
  data: BackupData;
  preview: BackupPreview;
};

export function BackupPanel({ onRestored }: { onRestored: () => Promise<void> }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [encryptedPassword, setEncryptedPassword] = useState('');
  const [encryptedPasswordConfirm, setEncryptedPasswordConfirm] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [pendingEncryptedBackup, setPendingEncryptedBackup] = useState<EncryptedBackupFile | null>(null);
  const [importCandidate, setImportCandidate] = useState<ImportCandidate | null>(null);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>('merge');
  const [restoreSettings, setRestoreSettings] = useState(false);
  const [overwriteConfirmation, setOverwriteConfirmation] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const resetMessages = () => {
    setStatus('');
    setError('');
  };

  const handleEncryptedExport = async () => {
    resetMessages();

    if (encryptedPassword.trim().length < 6 || encryptedPassword !== encryptedPassword.trim()) {
      setError('백업 비밀번호는 공백 없이 6자 이상이어야 합니다.');
      return;
    }

    if (encryptedPassword !== encryptedPasswordConfirm) {
      setError('백업 비밀번호와 확인 입력이 일치하지 않습니다.');
      return;
    }

    try {
      setIsExporting(true);
      const data = await collectBackupData();
      const backup = await createEncryptedBackupFile(data, encryptedPassword);
      downloadJsonBackup(backup);
      setEncryptedPassword('');
      setEncryptedPasswordConfirm('');
      setStatus('암호화 백업 파일을 다운로드했습니다.');
    } catch {
      setError('백업 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePlainExport = async () => {
    resetMessages();

    if (!window.confirm(plainBackupWarning)) {
      return;
    }

    try {
      setIsExporting(true);
      const backup = createPlainBackupFile(await collectBackupData());
      downloadJsonBackup(backup);
      setStatus('평문 백업 파일을 다운로드했습니다.');
    } catch {
      setError('백업 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const setPreviewCandidate = (backup: BackupFile, data: BackupData) => {
    setImportCandidate({
      backup,
      data,
      preview: createBackupPreview(backup, data)
    });
    setRestoreMode('merge');
    setRestoreSettings(false);
    setOverwriteConfirmation('');
  };

  const handleImportFile = async (file: File | undefined) => {
    resetMessages();
    setPendingEncryptedBackup(null);
    setImportCandidate(null);
    setImportPassword('');

    if (!file) {
      return;
    }

    try {
      const backup = parseBackupJson(await file.text());
      if (backup.backupType === 'plain') {
        setPreviewCandidate(backup, backup.data);
        setStatus('평문 백업 파일을 읽었습니다. 복원 전 미리보기를 확인하세요.');
      } else {
        setPendingEncryptedBackup(backup);
        setStatus('암호화 백업 파일을 읽었습니다. 백업 비밀번호를 입력하세요.');
      }
    } catch (readError) {
      const message = readError instanceof Error ? readError.message : '백업 파일을 읽을 수 없습니다.';
      setError(message || '백업 파일을 읽을 수 없습니다.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDecryptImport = async () => {
    resetMessages();

    if (!pendingEncryptedBackup) {
      return;
    }

    try {
      setIsDecrypting(true);
      const data = await decryptBackupFile(pendingEncryptedBackup, importPassword);
      setPreviewCandidate(pendingEncryptedBackup, data);
      setPendingEncryptedBackup(null);
      setImportPassword('');
      setStatus('암호화 백업을 복호화했습니다. 복원 전 미리보기를 확인하세요.');
    } catch {
      setError('백업 비밀번호가 올바르지 않거나 파일이 손상되었습니다.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleRestore = async () => {
    resetMessages();

    if (!importCandidate) {
      return;
    }

    if (restoreMode === 'overwrite' && overwriteConfirmation !== 'DELETE') {
      setError('덮어쓰려면 DELETE를 입력해야 합니다.');
      return;
    }

    try {
      setIsRestoring(true);
      await restoreBackupData(importCandidate.data, { mode: restoreMode, restoreSettings });
      await onRestored();
      setImportCandidate(null);
      setOverwriteConfirmation('');
      setStatus('백업 복원이 완료되었습니다.');
    } catch {
      setError('복원 중 오류가 발생했습니다.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <div>
        <h3 className="text-lg font-black text-white">데이터 백업/복원</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          백업 파일은 브라우저에서만 생성하고 복원합니다. Easybook 서버로 백업 내용이나 파일을 전송하지
          않습니다.
        </p>
      </div>

      {status ? (
        <p className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-200">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-emerald-300/30 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-black text-white">암호화 백업</h4>
            <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-slate-950">추천</span>
          </div>
          <p className="text-sm leading-6 text-slate-400">비밀번호로 암호화된 백업 파일을 다운로드합니다.</p>
          <BackupWarningBox title="비밀번호 주의">
            이 백업 비밀번호를 잊으면 암호화 백업 파일을 복구할 수 없습니다. Easybook은 이 비밀번호를
            저장하지 않습니다.
          </BackupWarningBox>
          <PasswordInput label="백업 비밀번호" onChange={setEncryptedPassword} value={encryptedPassword} />
          <PasswordInput
            label="백업 비밀번호 확인"
            onChange={setEncryptedPasswordConfirm}
            value={encryptedPasswordConfirm}
          />
          <button
            className="min-h-12 w-full rounded-2xl bg-emerald-300 px-5 text-sm font-black text-slate-950 disabled:opacity-60"
            disabled={isExporting}
            onClick={() => void handleEncryptedExport()}
            type="button"
          >
            암호화 백업 내보내기
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-amber-300/30 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-black text-white">평문 백업</h4>
            <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">고급 옵션</span>
          </div>
          <p className="text-sm leading-6 text-slate-400">암호화되지 않은 JSON 파일을 다운로드합니다.</p>
          <BackupWarningBox title="평문 백업 위험" tone="danger">
            {plainBackupWarning}
          </BackupWarningBox>
          <button
            className="min-h-12 w-full rounded-2xl bg-amber-300 px-5 text-sm font-black text-slate-950 disabled:opacity-60"
            disabled={isExporting}
            onClick={() => void handlePlainExport()}
            type="button"
          >
            평문 백업 내보내기
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-sky-300/30 bg-slate-950/60 p-4">
          <h4 className="font-black text-white">백업 가져오기</h4>
          <p className="text-sm leading-6 text-slate-400">이전에 내보낸 Easybook 백업 파일을 가져옵니다.</p>
          <input
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void handleImportFile(event.target.files?.[0])}
            ref={fileInputRef}
            type="file"
          />
          <button
            className="min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            백업 파일 선택
          </button>

          {pendingEncryptedBackup ? (
            <div className="space-y-3">
              <PasswordInput label="백업 비밀번호" onChange={setImportPassword} value={importPassword} />
              <button
                className="min-h-12 w-full rounded-2xl bg-slate-800 px-5 text-sm font-black text-white disabled:opacity-60"
                disabled={isDecrypting}
                onClick={() => void handleDecryptImport()}
                type="button"
              >
                암호화 백업 복호화
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {importCandidate ? (
        <BackupImportPreview
          isRestoring={isRestoring}
          onOverwriteConfirmationChange={setOverwriteConfirmation}
          onRestore={handleRestore}
          onRestoreModeChange={setRestoreMode}
          onRestoreSettingsChange={setRestoreSettings}
          overwriteConfirmation={overwriteConfirmation}
          preview={importCandidate.preview}
          restoreMode={restoreMode}
          restoreSettings={restoreSettings}
        />
      ) : null}
    </section>
  );
}
