import type { MockAnalysisInput, MockAnalysisResult } from './analysisTypes';

type Topic = 'Bitcoin' | 'AI' | 'Development' | 'Economy' | 'Education' | 'Other';

const topicRules: Array<{ topic: Topic; category: string; keywords: string[]; tags: string[] }> = [
  {
    topic: 'Bitcoin',
    category: '비트코인',
    keywords: ['bitcoin', 'btc', '비트코인', '사토시', '지갑', '라이트닝', '노드'],
    tags: ['비트코인', '셀프커스터디', '지갑', '보안', '라이트닝', '노드']
  },
  {
    topic: 'AI',
    category: 'AI',
    keywords: ['ai', 'gpt', 'claude', 'openai', 'cursor', 'codex', '인공지능'],
    tags: ['AI', 'GPT', '자동화', '생산성', '프롬프트', '코딩']
  },
  {
    topic: 'Development',
    category: '개발',
    keywords: ['react', 'vite', 'typescript', 'github', 'vercel', '코드', '개발', 'indexeddb'],
    tags: ['React', 'TypeScript', 'Vercel', 'GitHub', 'PWA', 'IndexedDB']
  },
  {
    topic: 'Economy',
    category: '경제',
    keywords: ['경제', '금리', '환율', '주식', '투자', '시장'],
    tags: ['경제', '투자', '금리', '환율', '시장']
  },
  {
    topic: 'Education',
    category: '교육',
    keywords: ['교육', '수업', '학생', '학습', '자료'],
    tags: ['교육', '수업', '학생', '학습', '자료']
  }
];

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function inferRule(input: MockAnalysisInput) {
  const text = `${input.originalText} ${input.sourceUrl ?? ''}`.toLowerCase();
  return topicRules.find((rule) => includesAny(text, rule.keywords)) ?? {
    topic: 'Other' as Topic,
    category: '기타',
    keywords: [],
    tags: ['읽을거리', '정리필요', '북마크']
  };
}

function firstSentence(input: MockAnalysisInput): string {
  const source = input.originalText.trim() || input.sourceUrl?.trim() || '저장한 북마크';
  return source.length > 70 ? `${source.slice(0, 70)}...` : source;
}

function explanations(category: string) {
  return {
    easy: `이 북마크는 ${category}와 관련된 내용을 쉽게 다시 보기 위한 자료입니다. 핵심만 먼저 훑고 원문을 다시 확인하면 좋습니다.`,
    medium: `${category} 관련 북마크는 단순한 주장보다 맥락을 함께 보는 것이 중요합니다. 어떤 문제를 다루는지, 왜 지금 다시 볼 만한지, 실제 행동으로 이어질 부분이 있는지를 확인해보세요. 저장한 메모와 원문 링크를 함께 보면 나중에 다시 읽기 쉽습니다.`,
    advanced: `이 북마크는 ${category}라는 주제를 더 넓은 배경 속에서 이해할 때 가치가 커집니다. 글이 전제하는 관점, 빠진 반론, 연결되는 개념을 함께 점검해야 합니다. 특히 짧은 게시물은 맥락이 생략되기 쉬우므로 작성자의 의도와 근거를 나눠서 보는 편이 좋습니다. 나중에 다시 읽을 때는 이 내용이 실제 판단이나 작업 방식에 어떤 변화를 주는지까지 확인해보세요.`
  };
}

export function mockAnalyzeBookmark(input: MockAnalysisInput): MockAnalysisResult {
  const rule = inferRule(input);
  const existingCategory = input.existingCategories.find(
    (category) => category.name.toLowerCase() === rule.category.toLowerCase()
  );
  const title = firstSentence(input);
  const difficultyExplanation = explanations(rule.category);

  return {
    title,
    summary: `${rule.category} 주제로 분류된 mock 분석 결과입니다. 원문에서 다시 볼 만한 핵심은 "${title}" 입니다.`,
    category: {
      name: rule.category,
      isNew: !existingCategory
    },
    tags: rule.tags.slice(0, 7),
    difficultyExplanation,
    revisitReason: `${rule.category} 관점에서 다시 읽고 분류를 확정하면 좋습니다.`,
    importance: rule.topic === 'Other' ? 'medium' : 'high',
    confidence: rule.topic === 'Other' ? 0.58 : 0.82
  };
}
