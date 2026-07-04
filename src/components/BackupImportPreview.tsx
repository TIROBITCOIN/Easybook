import type { BackupPreview, RestoreMode } from '../backup/backupTypes';
import { BackupWarningBox } from './BackupWarningBox';

export function BackupImportPreview({
  preview,
  restoreMode,
  restoreSettings,
  overwriteConfirmation,
  isRestoring,
  onRestoreModeChange,
  onRestoreSettingsChange,
  onOverwriteConfirmationChange,
  onRestore
}: {
  preview: BackupPreview;
  restoreMode: RestoreMode;
  restoreSettings: boolean;
  overwriteConfirmation: string;
  isRestoring: boolean;
  onRestoreModeChange: (mode: RestoreMode) => void;
  onRestoreSettingsChange: (restoreSettings: boolean) => void;
  onOverwriteConfirmationChange: (confirmation: string) => void;
  onRestore: () => Promise<void>;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
      <div>
        <h4 className="font-black text-white">복원 전 미리보기</h4>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">백업 생성일</dt>
            <dd className="mt-1 font-bold text-slate-200">{new Date(preview.exportedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-slate-500">백업 유형</dt>
            <dd className="mt-1 font-bold text-slate-200">
              {preview.backupType === 'encrypted' ? '암호화' : '평문'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">북마크</dt>
            <dd className="mt-1 font-bold text-slate-200">{preview.bookmarkCount}개</dd>
          </div>
          <div>
            <dt className="text-slate-500">카테고리</dt>
            <dd className="mt-1 font-bold text-slate-200">{preview.categoryCount}개</dd>
          </div>
          <div>
            <dt className="text-slate-500">태그</dt>
            <dd className="mt-1 font-bold text-slate-200">{preview.tagCount}개</dd>
          </div>
          <div>
            <dt className="text-slate-500">설정</dt>
            <dd className="mt-1 font-bold text-slate-200">
              {preview.includesSettings ? '포함됨' : '포함되지 않음'}
            </dd>
          </div>
        </dl>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-black text-slate-200">복원 방식</legend>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-700 p-3 text-sm text-slate-300">
          <input
            checked={restoreMode === 'merge'}
            className="mt-1"
            onChange={() => onRestoreModeChange('merge')}
            type="radio"
          />
          <span>
            <span className="block font-bold text-white">기존 데이터에 병합</span>
            id가 같은 항목은 백업 파일의 updatedAt이 더 최신일 때만 덮어씁니다.
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-700 p-3 text-sm text-slate-300">
          <input
            checked={restoreMode === 'overwrite'}
            className="mt-1"
            onChange={() => onRestoreModeChange('overwrite')}
            type="radio"
          />
          <span>
            <span className="block font-bold text-white">기존 데이터 삭제 후 덮어쓰기</span>
            현재 브라우저의 북마크, 카테고리, 태그를 삭제하고 백업 파일 내용으로 교체합니다.
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-black text-slate-200">설정 복원 옵션</legend>
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input
            checked={!restoreSettings}
            onChange={() => onRestoreSettingsChange(false)}
            type="radio"
          />
          설정은 복원하지 않기
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input checked={restoreSettings} onChange={() => onRestoreSettingsChange(true)} type="radio" />
          설정까지 복원하기
        </label>
        {restoreSettings ? (
          <BackupWarningBox title="설정 복원 주의" tone="danger">
            settings까지 복원하면 현재 앱 잠금 비밀번호, AI 설정, 테마 설정이 백업 파일의 값으로 바뀔 수
            있습니다.
          </BackupWarningBox>
        ) : null}
      </fieldset>

      {restoreMode === 'overwrite' ? (
        <BackupWarningBox title="덮어쓰기 경고" tone="danger">
          현재 브라우저의 Easybook 데이터를 삭제하고 백업 파일 내용으로 교체합니다. 이 작업은 되돌릴 수
          없습니다.
          <label className="mt-3 block">
            <span className="mb-2 block text-sm font-bold">DELETE 입력</span>
            <input
              className="min-h-12 w-full rounded-2xl border border-red-300/40 bg-slate-950 px-4 text-base text-white outline-none"
              onChange={(event) => onOverwriteConfirmationChange(event.target.value)}
              value={overwriteConfirmation}
            />
          </label>
        </BackupWarningBox>
      ) : null}

      <button
        className="min-h-12 w-full rounded-2xl bg-emerald-300 px-5 text-sm font-black text-slate-950 disabled:opacity-60"
        disabled={isRestoring || (restoreMode === 'overwrite' && overwriteConfirmation !== 'DELETE')}
        onClick={() => void onRestore()}
        type="button"
      >
        {isRestoring ? '복원 중...' : '백업 복원 실행'}
      </button>
    </div>
  );
}
