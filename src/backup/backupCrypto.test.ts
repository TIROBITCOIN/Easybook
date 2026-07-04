import { describe, expect, it } from 'vitest';
import { decryptBackupPayload, encryptBackupPayload } from './backupCrypto';
import type { BackupData } from './backupTypes';

const data: BackupData = {
  bookmarks: [
    {
      id: 'bookmark-1',
      source: 'manual-url',
      sourceUrl: 'https://example.com',
      originalText: 'Example',
      title: 'Example',
      summary: '',
      tagIds: [],
      difficultyExplanation: { easy: '', medium: '', advanced: '' },
      aiMeta: { needsReview: false },
      status: 'unread',
      importance: 'medium',
      userMemo: '',
      createdAt: '2026-07-04T00:00:00.000Z',
      updatedAt: '2026-07-04T00:00:00.000Z'
    }
  ],
  categories: [],
  tags: [],
  settings: null
};

describe('backup crypto', () => {
  it('encrypts and decrypts backup data with a password', async () => {
    const encrypted = await encryptBackupPayload(data, 'secret-password');
    const decrypted = await decryptBackupPayload(encrypted, 'secret-password');

    expect(encrypted.backupType).toBe('encrypted');
    expect(encrypted.payload).not.toContain('Example');
    expect(decrypted.bookmarks[0]?.title).toBe('Example');
  });

  it('rejects an incorrect backup password', async () => {
    const encrypted = await encryptBackupPayload(data, 'secret-password');

    await expect(decryptBackupPayload(encrypted, 'wrong-password')).rejects.toThrow(
      '백업 비밀번호가 올바르지 않거나 파일이 손상되었습니다.'
    );
  });
});
