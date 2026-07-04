import { describe, expect, it } from 'vitest';
import { mergeRecordsByUpdatedAt } from './backupRepository';

describe('backup repository merge rules', () => {
  it('keeps the current record when it is newer than the backup record', () => {
    const merged = mergeRecordsByUpdatedAt(
      [{ id: 'same', name: 'current', updatedAt: '2026-07-04T10:00:00.000Z' }],
      [{ id: 'same', name: 'backup', updatedAt: '2026-07-04T09:00:00.000Z' }]
    );

    expect(merged).toEqual([{ id: 'same', name: 'current', updatedAt: '2026-07-04T10:00:00.000Z' }]);
  });

  it('uses the backup record when it is newer than the current record', () => {
    const merged = mergeRecordsByUpdatedAt(
      [{ id: 'same', name: 'current', updatedAt: '2026-07-04T09:00:00.000Z' }],
      [{ id: 'same', name: 'backup', updatedAt: '2026-07-04T10:00:00.000Z' }]
    );

    expect(merged).toEqual([{ id: 'same', name: 'backup', updatedAt: '2026-07-04T10:00:00.000Z' }]);
  });

  it('adds backup records that do not conflict by id', () => {
    const merged = mergeRecordsByUpdatedAt(
      [{ id: 'current', name: 'current', updatedAt: '2026-07-04T09:00:00.000Z' }],
      [{ id: 'backup', name: 'backup', updatedAt: '2026-07-04T10:00:00.000Z' }]
    );

    expect(merged.map((record) => record.id)).toEqual(['current', 'backup']);
  });
});
