import { encryptBackupPayload } from './backupCrypto';
import {
  EASYBOOK_BACKUP_APP,
  EASYBOOK_BACKUP_SCHEMA_VERSION,
  type BackupData,
  type EncryptedBackupFile,
  type PlainBackupFile
} from './backupTypes';

function timestampForFilename(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}-${hour}${minute}`;
}

export function createBackupFilename(date = new Date()): string {
  return `easybook-backup-${timestampForFilename(date)}.json`;
}

export function createPlainBackupFile(
  data: BackupData,
  exportedAt = new Date().toISOString()
): PlainBackupFile {
  return {
    app: EASYBOOK_BACKUP_APP,
    schemaVersion: EASYBOOK_BACKUP_SCHEMA_VERSION,
    exportedAt,
    backupType: 'plain',
    data
  };
}

export async function createEncryptedBackupFile(
  data: BackupData,
  password: string
): Promise<EncryptedBackupFile> {
  return encryptBackupPayload(data, password);
}

export function downloadJsonBackup(backup: PlainBackupFile | EncryptedBackupFile): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = createBackupFilename(new Date(backup.exportedAt));
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
