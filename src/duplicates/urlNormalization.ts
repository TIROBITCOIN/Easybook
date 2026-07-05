const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'igsh',
  'ref',
  'ref_src',
  's',
  't',
  'lang'
]);

const TWITTER_HOSTS = new Set(['twitter.com', 'mobile.twitter.com', 'www.twitter.com', 'x.com', 'www.x.com']);

export function isTwitterLikeUrl(url: URL): boolean {
  return TWITTER_HOSTS.has(url.hostname.toLowerCase());
}

export function stripTrackingParams(url: URL): URL {
  const next = new URL(url.toString());
  for (const param of TRACKING_PARAMS) {
    next.searchParams.delete(param);
  }
  next.hash = '';
  return next;
}

export function normalizeTwitterUrl(url: URL): string {
  const parts = url.pathname.split('/').filter(Boolean);
  const statusIndex = parts.findIndex((part) => part.toLowerCase() === 'status');
  const tweetId = statusIndex >= 0 ? parts[statusIndex + 1] : undefined;

  if (tweetId && /^\d+$/.test(tweetId)) {
    return `https://x.com/i/status/${tweetId}`;
  }

  const next = new URL(url.toString());
  next.protocol = 'https:';
  next.hostname = 'x.com';
  next.hash = '';
  next.search = '';
  next.pathname = next.pathname.replace(/\/+$/, '') || '/';
  return next.toString().replace(/\/$/, '');
}

export function normalizeUrlForDuplicateCheck(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    parsed.protocol = 'https:';
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.hash = '';

    if (isTwitterLikeUrl(parsed)) {
      return normalizeTwitterUrl(parsed);
    }

    const stripped = stripTrackingParams(parsed);
    stripped.pathname = stripped.pathname.replace(/\/+$/, '') || '/';
    const normalized = stripped.toString();
    return normalized.endsWith('/') && !stripped.search ? normalized.slice(0, -1) : normalized;
  } catch {
    return undefined;
  }
}
