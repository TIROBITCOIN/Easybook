import { analyzeBookmark, getBookmark } from '../db/bookmarkRepository';
import { getSettings } from '../db/settingsRepository';
import { countStartedToday, isBookmarkAnalysisComplete } from './analysisLimits';
import {
  enqueueBookmarkAnalysis as enqueueAnalysisQueueItem,
  getNextDueAnalysisQueueItem,
  getRunningAnalysisQueueItem,
  listAnalysisQueueItems,
  updateAnalysisQueueItem
} from './analysisQueueRepository';
import type { AnalysisQueueItem, AnalysisQueuePriority } from './analysisQueueTypes';
import { getNextRetryAt, isRetryableAnalysisError } from './analysisRetry';

export async function enqueueBookmarkAnalysis(
  bookmarkId: string,
  options: {
    priority?: AnalysisQueuePriority;
    force?: boolean;
  } = {}
): Promise<AnalysisQueueItem> {
  if (!options.force) {
    const bookmark = await getBookmark(bookmarkId);
    if (bookmark && isBookmarkAnalysisComplete(bookmark)) {
      const timestamp = new Date().toISOString();
      return {
        id: crypto.randomUUID(),
        bookmarkId,
        status: 'skipped',
        priority: options.priority ?? 'normal',
        attempts: 0,
        maxAttempts: (await getSettings()).analysisMaxAttempts,
        errorCode: 'ALREADY_ANALYZED',
        errorMessage: '이미 분석이 완료된 북마크입니다.',
        scheduledAt: timestamp,
        finishedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    }
  }

  return enqueueAnalysisQueueItem(bookmarkId, options);
}

export async function runNextAnalysisQueueItem(now = new Date()): Promise<void> {
  const settings = await getSettings();
  if (!settings.analysisAutoRun || !settings.hasAcceptedAiPrivacyNotice) {
    return;
  }

  if (await getRunningAnalysisQueueItem()) {
    return;
  }

  const queueItems = await listAnalysisQueueItems();
  if (countStartedToday(queueItems, now) >= settings.analysisDailyLimit) {
    return;
  }

  const item = await getNextDueAnalysisQueueItem(now);
  if (!item) {
    return;
  }

  const startedAt = now.toISOString();
  const runningItem = await updateAnalysisQueueItem(item.id, {
    status: 'running',
    attempts: item.attempts + 1,
    startedAt,
    errorCode: undefined,
    errorMessage: undefined
  });

  if (!runningItem) {
    return;
  }

  const bookmark = await getBookmark(item.bookmarkId);
  if (!bookmark) {
    await updateAnalysisQueueItem(item.id, {
      status: 'skipped',
      finishedAt: new Date().toISOString(),
      errorCode: 'BOOKMARK_DELETED',
      errorMessage: '북마크가 삭제되어 분석을 건너뛰었습니다.'
    });
    return;
  }

  const analyzedBookmark = await analyzeBookmark(item.bookmarkId, {
    maxInputChars: settings.analysisMaxInputChars
  });
  const finishedAt = new Date();
  const errorCode = analyzedBookmark?.aiMeta.errorCode;
  const errorMessage = analyzedBookmark?.aiMeta.errorMessage;

  if (!errorMessage) {
    await updateAnalysisQueueItem(item.id, {
      status: 'succeeded',
      finishedAt: finishedAt.toISOString(),
      errorCode: undefined,
      errorMessage: undefined
    });
    return;
  }

  const canRetry =
    settings.analysisRetryEnabled &&
    runningItem.attempts < runningItem.maxAttempts &&
    isRetryableAnalysisError(errorCode);

  if (canRetry) {
    await updateAnalysisQueueItem(item.id, {
      status: 'queued',
      scheduledAt: getNextRetryAt(finishedAt, runningItem.attempts, settings.analysisCooldownMinutes).toISOString(),
      errorCode,
      errorMessage
    });
    return;
  }

  await updateAnalysisQueueItem(item.id, {
    status: 'failed',
    finishedAt: finishedAt.toISOString(),
    errorCode,
    errorMessage
  });
}

export async function runAnalysisQueue(): Promise<void> {
  for (let processed = 0; processed < 10; processed += 1) {
    const before = await getNextDueAnalysisQueueItem();
    if (!before) {
      return;
    }

    await runNextAnalysisQueueItem();
    const after = await getNextDueAnalysisQueueItem();
    if (!after || after.id === before.id) {
      return;
    }
  }
}

