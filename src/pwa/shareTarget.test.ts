import { describe, expect, it } from 'vitest';
import {
  extractFirstUrl,
  normalizeSharedBookmark,
  parseShareTargetParams
} from './shareTarget';

describe('share target parsing', () => {
  it('reads shared title, text, and url query parameters', () => {
    const params = new URLSearchParams({
      title: 'Shared title',
      text: 'Shared body',
      url: 'https://x.com/test/status/123'
    });

    expect(parseShareTargetParams(params)).toEqual({
      title: 'Shared title',
      text: 'Shared body',
      url: 'https://x.com/test/status/123'
    });
  });

  it('uses an explicit shared url before extracting a url from text', () => {
    const normalized = normalizeSharedBookmark({
      title: 'Tweet title',
      text: 'Read this https://example.com/fallback',
      url: 'https://x.com/test/status/123'
    });

    expect(normalized).toEqual({
      title: 'Tweet title',
      originalText: 'Read this https://example.com/fallback',
      sourceUrl: 'https://x.com/test/status/123'
    });
  });

  it('extracts the first url from shared text when no url parameter exists', () => {
    const normalized = normalizeSharedBookmark({
      text: 'First https://mobile.twitter.com/test/status/1 and then https://example.com'
    });

    expect(normalized.sourceUrl).toBe('https://mobile.twitter.com/test/status/1');
    expect(normalized.originalText).toBe(
      'First https://mobile.twitter.com/test/status/1 and then https://example.com'
    );
  });

  it('allows url-only shares to keep an empty original text', () => {
    expect(
      normalizeSharedBookmark({
        url: 'https://twitter.com/test/status/123'
      })
    ).toEqual({
      originalText: '',
      sourceUrl: 'https://twitter.com/test/status/123'
    });
  });

  it('does not throw when shared text contains a malformed url-like value', () => {
    expect(extractFirstUrl('not quite https://')).toBeUndefined();
    expect(() => normalizeSharedBookmark({ text: 'not quite https://' })).not.toThrow();
  });
});
