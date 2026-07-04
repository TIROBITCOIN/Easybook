import { describe, expect, it } from 'vitest';
import {
  parseBackupFile,
  validateDecryptedBackupData,
  validatePlainBackupFile
} from './backupValidation';

const backupData = {
  bookmarks: [],
  categories: [],
  tags: [],
  settings: null
};

describe('backup validation', () => {
  it('accepts a valid Easybook plain backup file', () => {
    const backup = validatePlainBackupFile({
      app: 'Easybook',
      schemaVersion: 1,
      exportedAt: '2026-07-04T00:00:00.000Z',
      backupType: 'plain',
      data: backupData
    });

    expect(backup.backupType).toBe('plain');
    expect(backup.data.bookmarks).toHaveLength(0);
  });

  it('rejects files from a different app', () => {
    expect(() =>
      parseBackupFile({
        app: 'Other',
        schemaVersion: 1,
        exportedAt: '2026-07-04T00:00:00.000Z',
        backupType: 'plain',
        data: backupData
      })
    ).toThrow('Easybook 백업 파일이 아닙니다.');
  });

  it('rejects unsupported schema versions', () => {
    expect(() =>
      parseBackupFile({
        app: 'Easybook',
        schemaVersion: 99,
        exportedAt: '2026-07-04T00:00:00.000Z',
        backupType: 'plain',
        data: backupData
      })
    ).toThrow('지원하지 않는 백업 버전입니다.');
  });

  it('rejects malformed backup data collections', () => {
    expect(() =>
      validateDecryptedBackupData({
        bookmarks: {},
        categories: [],
        tags: [],
        settings: null
      })
    ).toThrow('백업 파일 형식이 올바르지 않습니다.');
  });
});
