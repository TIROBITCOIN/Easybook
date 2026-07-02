import type { BookmarkSource } from '../types';

export function getSharedInputFromUrl(search: string): {
  source: BookmarkSource;
  sourceUrl: string;
  originalText: string;
} | null {
  const params = new URLSearchParams(search);
  const title = params.get('title') ?? '';
  const text = params.get('text') ?? '';
  const url = params.get('url') ?? '';
  const combined = [title, text].filter(Boolean).join('\n\n').trim();

  if (!combined && !url) {
    return null;
  }

  return {
    source: url.includes('x.com') || url.includes('twitter.com') ? 'x-share' : 'manual-url',
    sourceUrl: url,
    originalText: combined
  };
}
