const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const SPECIAL_PATTERN = /[^\p{L}\p{N}\s]/gu;
const MIN_FINGERPRINT_LENGTH = 12;
const STOP_WORDS = new Set(['and', 'or', 'the', 'a', 'an', 'for', 'to', 'of', 'in', 'on', 'with']);

function tokenize(text: string): Set<string> {
  return new Set(
    normalizeTextForFingerprint(text)
      .split(' ')
      .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
  );
}

export function normalizeTextForFingerprint(text: string): string {
  return text
    .toLowerCase()
    .replace(URL_PATTERN, ' ')
    .replace(SPECIAL_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createContentFingerprint(input: {
  title?: string;
  originalText?: string;
  sourceUrl?: string;
}): string {
  const normalized = normalizeTextForFingerprint(
    [input.title, input.originalText, input.sourceUrl].filter(Boolean).join(' ')
  );

  if (normalized.length < MIN_FINGERPRINT_LENGTH) {
    return '';
  }

  return [...new Set(normalized.split(' ').filter(Boolean))].sort().join(' ');
}

export function calculateTextSimilarity(a: string, b: string): number {
  const aTokens = tokenize(a);
  const bTokens = tokenize(b);

  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}
