import { db } from '../db/db';
import { getSettings } from '../db/settingsRepository';
import type {
  AnalysisQueueItem,
  AnalysisQueuePriority,
  AnalysisQueueStatus
} from './analysisQueueTypes';

const nowIso = () => new Date().toISOString();

const ACTIVE_STATUSES: AnalysisQueueStatus[] = ['queued', 'running'];

export async function listAnalysisQueueItems(): Promise<AnalysisQueueItem[]> {
  return db.analysisQueue.orderBy('createdAt').reverse().toArray();
}

export async function listAnalysisQueueItemsForBookmark(bookmarkId: string): Promise<AnalysisQueueItem[]> {
  return db.analysisQueue.where('bookmarkId').equals(bookmarkId).reverse().sortBy('createdAt');
}

export async function getLatestAnalysisQueueItemForBookmark(
  bookmarkId: string
): Promise<AnalysisQueueItem | undefined> {
  const items = await listAnalysisQueueItemsForBookmark(bookmarkId);
  return items[0];
}

export async function getActiveAnalysisQueueItemForBookmark(
  bookmarkId: string
): Promise<AnalysisQueueItem | undefined> {
  const items = await db.analysisQueue.where('bookmarkId').equals(bookmarkId).toArray();
  return items.find((item) => ACTIVE_STATUSES.includes(item.status));
}

export async function getRunningAnalysisQueueItem(): Promise<AnalysisQueueItem | undefined> {
  return db.analysisQueue.where('status').equals('running').first();
}

export async function enqueueBookmarkAnalysis(
  bookmarkId: string,
  options: {
    priority?: AnalysisQueuePriority;
    force?: boolean;
  } = {}
): Promise<AnalysisQueueItem> {
  if (!options.force) {
    const activeItem = await getActiveAnalysisQueueItemForBookmark(bookmarkId);
    if (activeItem) {
      return activeItem;
    }
  }

  const timestamp = nowIso();
  const settings = await getSettings();
  const item: AnalysisQueueItem = {
    id: crypto.randomUUID(),
    bookmarkId,
    status: 'queued',
    priority: options.priority ?? 'normal',
    attempts: 0,
    maxAttempts: settings.analysisMaxAttempts,
    scheduledAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  await db.analysisQueue.add(item);
  return item;
}

export async function updateAnalysisQueueItem(
  id: string,
  changes: Partial<Omit<AnalysisQueueItem, 'id' | 'createdAt'>>
): Promise<AnalysisQueueItem | undefined> {
  const current = await db.analysisQueue.get(id);
  if (!current) {
    return undefined;
  }

  const next: AnalysisQueueItem = {
    ...current,
    ...changes,
    updatedAt: nowIso()
  };

  await db.analysisQueue.put(next);
  return next;
}

export async function getNextDueAnalysisQueueItem(now = new Date()): Promise<AnalysisQueueItem | undefined> {
  const queuedItems = await db.analysisQueue.where('status').equals('queued').toArray();
  const dueItems = queuedItems.filter((item) => new Date(item.scheduledAt).getTime() <= now.getTime());
  const priorityWeight: Record<AnalysisQueuePriority, number> = {
    high: 0,
    normal: 1,
    low: 2
  };

  return dueItems.sort((a, b) => {
    const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  })[0];
}

export async function clearAnalysisQueueForBookmark(bookmarkId: string): Promise<void> {
  const items = await db.analysisQueue.where('bookmarkId').equals(bookmarkId).toArray();
  await Promise.all(
    items.map((item) =>
      updateAnalysisQueueItem(item.id, {
        status: 'skipped',
        finishedAt: nowIso(),
        errorCode: 'BOOKMARK_DELETED',
        errorMessage: '북마크가 삭제되어 분석 대기열에서 제외되었습니다.'
      })
    )
  );
}

