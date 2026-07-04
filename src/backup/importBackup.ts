import { decryptBackupPayload } from './backupCrypto';
import type { BackupData, BackupFile, BackupPreview, EncryptedBackupFile } from './backupTypes';
import { parseBackupFile } from './backupValidation';

export function parseBackupJson(jsonText: string): BackupFile {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  return parseBackupFile(parsed);
}

export async function decryptBackupFile(
  backup: EncryptedBackupFile,
  password: string
): Promise<BackupData> {
  return decryptBackupPayload(backup, password);
}

export function createBackupPreview(backup: BackupFile, data: BackupData): BackupPreview {
  return {
    exportedAt: backup.exportedAt,
    backupType: backup.backupType,
    bookmarkCount: data.bookmarks.length,
    categoryCount: data.categories.length,
    tagCount: data.tags.length,
    includesSettings: Boolean(data.settings)
  };
}
