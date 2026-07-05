import type { AnalysisQueueItem } from './analysisQueueTypes';
import type { BookmarkItem } from '../types/bookmark';

export type TruncatedAnalysisText = {
  originalText: string;
  wasTruncated: boolean;
  note?: string;
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function countStartedToday(items: AnalysisQueueItem[], now = new Date()): number {
  const today = localDateKey(now);

  return items.filter((item) => {
    if (!item.startedAt) {
      return false;
    }

    return localDateKey(new Date(item.startedAt)) === today;
  }).length;
}

export function isBookmarkAnalysisComplete(bookmark: BookmarkItem): boolean {
  return Boolean(
    bookmark.difficultyExplanation.easy.trim() &&
      bookmark.difficultyExplanation.medium.trim() &&
      bookmark.difficultyExplanation.advanced.trim()
  );
}

export function truncateAnalysisText(originalText: string, maxInputChars: number): TruncatedAnalysisText {
  if (originalText.length <= maxInputChars) {
    return {
      originalText,
      wasTruncated: false
    };
  }

  return {
    originalText: originalText.slice(0, maxInputChars),
    wasTruncated: true,
    note: `원문이 길어 앞부분 ${maxInputChars}자까지만 AI 분석에 전달했습니다.`
  };
}

