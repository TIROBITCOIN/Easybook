import { describe, expect, it } from 'vitest';
import { getNextRetryAt, isRetryableAnalysisError } from './analysisRetry';

describe('analysis retry rules', () => {
  it('retries temporary analysis errors', () => {
    expect(isRetryableAnalysisError('NETWORK_ERROR')).toBe(true);
    expect(isRetryableAnalysisError('RATE_LIMITED')).toBe(true);
    expect(isRetryableAnalysisError('AI_REQUEST_FAILED')).toBe(true);
    expect(isRetryableAnalysisError('UNKNOWN')).toBe(true);
  });

  it('does not retry invalid input or invalid response errors', () => {
    expect(isRetryableAnalysisError('INVALID_INPUT')).toBe(false);
    expect(isRetryableAnalysisError('AI_RESPONSE_INVALID')).toBe(false);
  });

  it('schedules linear backoff from the attempt count', () => {
    expect(getNextRetryAt(new Date('2026-07-06T00:00:00.000Z'), 2, 5).toISOString()).toBe(
      '2026-07-06T00:10:00.000Z'
    );
  });
});
