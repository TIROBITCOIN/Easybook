export type SharedBookmarkInput = {
  title?: string;
  text?: string;
  url?: string;
};

export type NormalizedSharedBookmark = {
  sourceUrl?: string;
  originalText: string;
  title?: string;
};

const URL_PATTERN = /https?:\/\/[^\s<>"']+/i;
const TRAILING_PUNCTUATION_PATTERN = /[),.;!?]+$/;

function trimOptional(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function parseShareTargetParams(searchParams: URLSearchParams): SharedBookmarkInput {
  return {
    title: trimOptional(searchParams.get('title')),
    text: trimOptional(searchParams.get('text')),
    url: trimOptional(searchParams.get('url'))
  };
}

export function extractFirstUrl(text: string): string | undefined {
  const match = text.match(URL_PATTERN);
  if (!match) {
    return undefined;
  }

  const candidate = match[0].replace(TRAILING_PUNCTUATION_PATTERN, '');

  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
}

export function normalizeSharedBookmark(input: SharedBookmarkInput): NormalizedSharedBookmark {
  const title = input.title?.trim() || undefined;
  const originalText = input.text?.trim() ?? '';
  const sourceUrl = input.url?.trim() || extractFirstUrl(originalText);

  return {
    ...(sourceUrl ? { sourceUrl } : {}),
    originalText,
    ...(title ? { title } : {})
  };
}
