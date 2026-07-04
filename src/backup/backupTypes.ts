import type { AppSettings } from '../types/appSettings';
import type { BookmarkItem } from '../types/bookmark';
import type { Category } from '../types/category';
import type { Tag } from '../types/tag';

export const EASYBOOK_BACKUP_APP = 'Easybook';
export const EASYBOOK_BACKUP_SCHEMA_VERSION = 1;
export const BACKUP_KDF_ITERATIONS = 100000;

export type BackupType = 'plain' | 'encrypted';
export type RestoreMode = 'merge' | 'overwrite';

export type BackupData = {
  bookmarks: BookmarkItem[];
  categories: Category[];
  tags: Tag[];
  settings: AppSettings | null;
};

export type PlainBackupFile = {
  app: typeof EASYBOOK_BACKUP_APP;
  schemaVersion: typeof EASYBOOK_BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  backupType: 'plain';
  data: BackupData;
};

export type EncryptedBackupFile = {
  app: typeof EASYBOOK_BACKUP_APP;
  schemaVersion: typeof EASYBOOK_BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  backupType: 'encrypted';
  crypto: {
    algorithm: 'AES-GCM';
    kdf: 'PBKDF2';
    hash: 'SHA-256';
    iterations: number;
    salt: string;
    iv: string;
  };
  payload: string;
};

export type BackupFile = PlainBackupFile | EncryptedBackupFile;

export type BackupPreview = {
  exportedAt: string;
  backupType: BackupType;
  bookmarkCount: number;
  categoryCount: number;
  tagCount: number;
  includesSettings: boolean;
};

export type RestoreBackupOptions = {
  mode: RestoreMode;
  restoreSettings: boolean;
};
