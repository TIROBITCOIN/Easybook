import type { AiAnalysisErrorCode } from '../ai/analyzeBookmarkClient';

const NON_RETRYABLE_ERROR_CODES = new Set<AiAnalysisErrorCode>([
  'INVALID_INPUT',
  'AI_RESPONSE_INVALID'
]);

export function isRetryableAnalysisError(errorCode: string | undefined): boolean {
  if (!errorCode) {
    return true;
  }

  return !NON_RETRYABLE_ERROR_CODES.has(errorCode as AiAnalysisErrorCode);
}

export function getNextRetryAt(now: Date, attempts: number, cooldownMinutes: number): Date {
  return new Date(now.getTime() + cooldownMinutes * attempts * 60_000);
}

