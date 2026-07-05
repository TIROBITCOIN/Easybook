import type { BackupData, RestoreBackupOptions } from '../backup/backupTypes';
import type { AppSettings } from '../types/appSettings';
import { db } from './db';

type RecordWithOptionalUpdatedAt = {
  id?: string;
  updatedAt?: string;
};

function isBackupNewer<T extends RecordWithOptionalUpdatedAt>(current: T, backup: T): boolean {
  if (!backup.updatedAt) {
    return false;
  }

  if (!current.updatedAt) {
    return true;
  }

  return new Date(backup.updatedAt).getTime() > new Date(current.updatedAt).getTime();
}

export function mergeRecordsByUpdatedAt<T extends RecordWithOptionalUpdatedAt>(
  currentRecords: T[],
  backupRecords: T[]
): T[] {
  const merged = new Map<string, T>();
  const withoutIds: T[] = [];

  currentRecords.forEach((record) => {
    if (record.id) {
      merged.set(record.id, record);
    } else {
      withoutIds.push(record);
    }
  });

  backupRecords.forEach((record) => {
    if (!record.id) {
      withoutIds.push(record);
      return;
    }

    const current = merged.get(record.id);
    if (!current || isBackupNewer(current, record)) {
      merged.set(record.id, record);
    }
  });

  return [...merged.values(), ...withoutIds];
}

export async function collectBackupData(): Promise<BackupData> {
  const [bookmarks, categories, tags, settings] = await Promise.all([
    db.bookmarks.toArray(),
    db.categories.toArray(),
    db.tags.toArray(),
    db.settings.get('default')
  ]);

  return {
    bookmarks,
    categories,
    tags,
    settings: settings ?? null
  };
}

async function restoreSettingsForMerge(settings: AppSettings | null): Promise<void> {
  if (!settings) {
    return;
  }

  const current = await db.settings.get('default');
  if (!current || isBackupNewer(current, settings)) {
    await db.settings.put({ ...settings, id: 'default' });
  }
}

export async function restoreBackupData(
  data: BackupData,
  options: RestoreBackupOptions
): Promise<void> {
  await db.transaction('rw', db.bookmarks, db.categories, db.tags, db.settings, db.analysisQueue, async () => {
    if (options.mode === 'overwrite') {
      const currentSettings = await db.settings.get('default');
      await db.bookmarks.clear();
      await db.categories.clear();
      await db.tags.clear();
      await db.analysisQueue.clear();
      await db.bookmarks.bulkPut(data.bookmarks);
      await db.categories.bulkPut(data.categories);
      await db.tags.bulkPut(data.tags);

      if (options.restoreSettings && data.settings) {
        await db.settings.clear();
        await db.settings.put({ ...data.settings, id: 'default' });
      } else if (currentSettings) {
        await db.settings.put(currentSettings);
      }
      return;
    }

    const [currentBookmarks, currentCategories, currentTags] = await Promise.all([
      db.bookmarks.toArray(),
      db.categories.toArray(),
      db.tags.toArray()
    ]);

    await db.bookmarks.bulkPut(mergeRecordsByUpdatedAt(currentBookmarks, data.bookmarks));
    await db.categories.bulkPut(mergeRecordsByUpdatedAt(currentCategories, data.categories));
    await db.tags.bulkPut(mergeRecordsByUpdatedAt(currentTags, data.tags));

    if (options.restoreSettings) {
      await restoreSettingsForMerge(data.settings);
    }
  });
}
