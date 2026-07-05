export type AnalysisQueueStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'paused'
  | 'skipped';

export type AnalysisQueuePriority = 'low' | 'normal' | 'high';

export type AnalysisQueueItem = {
  id: string;
  bookmarkId: string;
  status: AnalysisQueueStatus;
  priority: AnalysisQueuePriority;
  attempts: number;
  maxAttempts: number;
  errorCode?: string;
  errorMessage?: string;
  scheduledAt: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

