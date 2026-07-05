import { describe, expect, it } from 'vitest';
import {
  calculateTextSimilarity,
  createContentFingerprint,
  normalizeTextForFingerprint
} from './contentFingerprint';

describe('content fingerprint', () => {
  it('normalizes whitespace and casing', () => {
    expect(normalizeTextForFingerprint('  Bitcoin   SELF custody  ')).toBe('bitcoin self custody');
  });

  it('removes URLs from text before fingerprinting', () => {
    expect(normalizeTextForFingerprint('Read https://x.com/test/status/1 about fees')).toBe('read about fees');
  });

  it('returns an empty fingerprint for very short text', () => {
    expect(createContentFingerprint({ originalText: 'hi' })).toBe('');
  });

  it('scores similar text highly', () => {
    expect(calculateTextSimilarity('bitcoin self custody wallet fees', 'wallet fees and bitcoin self custody')).toBeGreaterThan(0.82);
  });

  it('scores different text low', () => {
    expect(calculateTextSimilarity('bitcoin wallet fees', 'recipe ingredients pasta tomato')).toBeLessThan(0.3);
  });
});
