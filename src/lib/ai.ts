import { ensureCategory, ensureTag, getSettings, updateBookmark } from '../db/repo';
import type { AiAnalysisResult, BookmarkItem } from '../types';

function inferCategory(bookmark: BookmarkItem): string {
  const text = `${bookmark.sourceUrl} ${bookmark.originalText}`.toLowerCase();
  if (text.includes('bitcoin') || text.includes('btc')) return 'Bitcoin';
  if (text.includes('ai') || text.includes('llm') || text.includes('openai')) return 'AI';
  if (text.includes('design') || text.includes('ux')) return 'Design';
  if (text.includes('startup') || text.includes('business')) return 'Business';
  return 'Review Queue';
}

function inferTags(bookmark: BookmarkItem): string[] {
  const text = `${bookmark.sourceUrl} ${bookmark.originalText}`.toLowerCase();
  const tags = new Set<string>();
  if (text.includes('bitcoin') || text.includes('btc')) tags.add('bitcoin');
  if (text.includes('ai') || text.includes('llm')) tags.add('ai');
  if (text.includes('thread')) tags.add('thread');
  if (text.includes('guide') || text.includes('how')) tags.add('guide');
  if (tags.size === 0) tags.add('inbox');
  return [...tags].slice(0, 5);
}

export async function analyzeBookmarkMock(bookmark: BookmarkItem): Promise<AiAnalysisResult> {
  const categoryName = inferCategory(bookmark);
  const sourceText = bookmark.originalText || bookmark.sourceUrl || '공유된 북마크';
  const shortText = sourceText.length > 90 ? `${sourceText.slice(0, 90)}...` : sourceText;

  return {
    title: bookmark.title || shortText,
    summary: `저장한 내용의 핵심을 빠르게 다시 볼 수 있도록 정리한 mock 요약입니다. 원문: ${shortText}`,
    category: {
      name: categoryName,
      isNew: categoryName === 'Review Queue'
    },
    tags: inferTags(bookmark),
    difficultyExplanation: {
      easy: '처음 보는 사람도 핵심만 잡을 수 있게 쉬운 말로 풀어쓴 설명입니다.',
      medium:
        '이 북마크의 핵심 개념과 왜 저장할 만한지에 대한 맥락을 정리합니다. 관련된 키워드와 다시 볼 포인트를 함께 남깁니다.',
      advanced:
        '이 내용이 전제하는 배경, 연결되는 개념, 놓치기 쉬운 반론까지 함께 검토합니다. 실제 판단에는 원문 맥락과 작성자의 의도를 같이 확인해야 합니다.'
    },
    revisitReason: '나중에 분류와 메모를 보강하면 좋은 항목입니다.',
    importance: categoryName === 'Review Queue' ? 'medium' : 'high',
    confidence: categoryName === 'Review Queue' ? 0.62 : 0.82
  };
}

export async function analyzeAndSaveBookmark(bookmark: BookmarkItem): Promise<void> {
  const settings = await getSettings();
  if (!settings.aiAutoAnalyze || !settings.hasAcceptedAiPrivacyNotice) {
    return;
  }

  const result = await analyzeBookmarkMock(bookmark);
  const category = await ensureCategory(result.category.name, result.category.isNew ? 'ai' : 'user', result.category.isNew);
  const tags = await Promise.all(result.tags.map((tag) => ensureTag(tag, 'ai')));

  await updateBookmark(bookmark.id, {
    title: result.title,
    summary: result.summary,
    categoryId: category.id,
    tagIds: tags.map((tag) => tag.id),
    difficultyExplanation: result.difficultyExplanation,
    importance: result.importance,
    aiMeta: {
      analyzedAt: new Date().toISOString(),
      model: 'mock-ai-v1',
      confidence: result.confidence,
      needsReview: result.category.isNew || result.confidence < 0.7
    }
  });
}
