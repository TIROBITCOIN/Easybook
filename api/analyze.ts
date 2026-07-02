import type { IncomingMessage, ServerResponse } from 'node:http';

type RequestBody = {
  sourceUrl?: string;
  originalText?: string;
  categories?: string[];
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8');
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const rawBody = await readBody(req);
  const body = JSON.parse(rawBody || '{}') as RequestBody;
  const sourceText = body.originalText || body.sourceUrl || '공유된 북마크';

  // No server-side persistence. This route is the future real-model integration point.
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(
    JSON.stringify({
      title: sourceText.slice(0, 80),
      summary: '서버리스 AI 연결 지점의 mock 응답입니다. 요청 내용은 저장하지 않습니다.',
      category: {
        name: body.categories?.[0] ?? 'Review Queue',
        isNew: !body.categories?.length
      },
      tags: ['shared', 'review'],
      difficultyExplanation: {
        easy: '간단히 다시 읽을 수 있도록 쉬운 설명을 제공합니다.',
        medium: '핵심 맥락과 저장 이유를 함께 정리합니다.',
        advanced: '배경, 전제, 반론, 연결 개념까지 확장해 설명합니다.'
      },
      revisitReason: '추후 원문과 함께 다시 검토하면 좋습니다.',
      importance: 'medium',
      confidence: 0.6
    })
  );
}
