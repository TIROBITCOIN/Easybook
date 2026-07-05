import { describe, expect, it } from 'vitest';
import { normalizeUrlForDuplicateCheck } from './urlNormalization';

describe('duplicate URL normalization', () => {
  it('normalizes twitter.com and x.com status URLs to the same canonical URL', () => {
    expect(normalizeUrlForDuplicateCheck('https://twitter.com/someone/status/123?s=20')).toBe(
      'https://x.com/i/status/123'
    );
    expect(normalizeUrlForDuplicateCheck('https://x.com/someone/status/123')).toBe(
      'https://x.com/i/status/123'
    );
  });

  it('normalizes mobile.twitter.com status URLs', () => {
    expect(normalizeUrlForDuplicateCheck('https://mobile.twitter.com/someone/status/123?ref_src=twsrc')).toBe(
      'https://x.com/i/status/123'
    );
  });

  it('strips tracking query params and fragments from regular URLs', () => {
    expect(
      normalizeUrlForDuplicateCheck(
        'https://Example.com/path/?utm_source=x&ref=share&keep=1#section'
      )
    ).toBe('https://example.com/path?keep=1');
  });

  it('removes trailing slash for regular URLs', () => {
    expect(normalizeUrlForDuplicateCheck('http://Example.com/path/')).toBe('https://example.com/path');
  });

  it('returns undefined for invalid URLs', () => {
    expect(normalizeUrlForDuplicateCheck('not a url')).toBeUndefined();
  });
});
