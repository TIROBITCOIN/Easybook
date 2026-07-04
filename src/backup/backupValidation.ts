import { z } from 'zod';
import type { BackupData, BackupFile, EncryptedBackupFile, PlainBackupFile } from './backupTypes';
import { EASYBOOK_BACKUP_APP, EASYBOOK_BACKUP_SCHEMA_VERSION } from './backupTypes';

const recordSchema = z.record(z.string(), z.unknown());

const backupDataSchema = z.object({
  bookmarks: z.array(recordSchema),
  categories: z.array(recordSchema),
  tags: z.array(recordSchema),
  settings: recordSchema.nullable()
});

const encryptedCryptoSchema = z.object({
  algorithm: z.literal('AES-GCM'),
  kdf: z.literal('PBKDF2'),
  hash: z.literal('SHA-256'),
  iterations: z.number().int().min(100000),
  salt: z.string().min(1),
  iv: z.string().min(1)
});

function asObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  return input as Record<string, unknown>;
}

function validateEnvelope(input: unknown): Record<string, unknown> {
  const file = asObject(input);

  if (file.app !== EASYBOOK_BACKUP_APP) {
    throw new Error('Easybook 백업 파일이 아닙니다.');
  }

  if (file.schemaVersion !== EASYBOOK_BACKUP_SCHEMA_VERSION) {
    throw new Error('지원하지 않는 백업 버전입니다.');
  }

  if (file.backupType !== 'plain' && file.backupType !== 'encrypted') {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  if (typeof file.exportedAt !== 'string') {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  return file;
}

export function validateDecryptedBackupData(input: unknown): BackupData {
  const parsed = backupDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  return parsed.data as BackupData;
}

export function validatePlainBackupFile(input: unknown): PlainBackupFile {
  const file = validateEnvelope(input);

  if (file.backupType !== 'plain') {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  return {
    app: EASYBOOK_BACKUP_APP,
    schemaVersion: EASYBOOK_BACKUP_SCHEMA_VERSION,
    exportedAt: file.exportedAt as string,
    backupType: 'plain',
    data: validateDecryptedBackupData(file.data)
  };
}

export function validateEncryptedBackupFile(input: unknown): EncryptedBackupFile {
  const file = validateEnvelope(input);

  if (file.backupType !== 'encrypted') {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  const crypto = encryptedCryptoSchema.safeParse(file.crypto);
  if (!crypto.success || typeof file.payload !== 'string') {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }

  return {
    app: EASYBOOK_BACKUP_APP,
    schemaVersion: EASYBOOK_BACKUP_SCHEMA_VERSION,
    exportedAt: file.exportedAt as string,
    backupType: 'encrypted',
    crypto: crypto.data,
    payload: file.payload
  };
}

export function parseBackupFile(input: unknown): BackupFile {
  const file = validateEnvelope(input);
  return file.backupType === 'plain'
    ? validatePlainBackupFile(file)
    : validateEncryptedBackupFile(file);
}
