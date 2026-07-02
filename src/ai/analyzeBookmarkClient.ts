import { z } from 'zod';
import type { MockAnalysisInput, MockAnalysisResult } from './analysisTypes';

export type AiAnalysisErrorCode =
  | 'INVALID_INPUT'
  | 'AI_REQUEST_FAILED'
  | 'AI_RESPONSE_INVALID'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

export class AiAnalysisError extends Error {
  code: AiAnalysisErrorCode;

  constructor(code: AiAnalysisErrorCode, message: string) {
    super(message);
    this.name = 'AiAnalysisError';
    this.code = code;
  }
}

const analysisSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  category: z.object({
    name: z.string().min(1),
    isNew: z.boolean()
  }),
  tags: z.array(z.string().min(1)).min(1),
  difficultyExplanation: z.object({
    easy: z.string().min(1),
    medium: z.string().min(1),
    advanced: z.string().min(1)
  }),
  revisitReason: z.string().min(1),
  importance: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1)
});

const apiResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), analysis: analysisSchema }),
  z.object({
    ok: z.literal(false),
    error: z.object({
      code: z.enum(['INVALID_INPUT', 'AI_REQUEST_FAILED', 'AI_RESPONSE_INVALID', 'RATE_LIMITED', 'UNKNOWN']),
      message: z.string()
    })
  })
]);

export async function analyzeBookmarkRemote(input: MockAnalysisInput): Promise<MockAnalysisResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('/api/analyze-bookmark', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        originalText: input.originalText,
        sourceUrl: input.sourceUrl,
        existingCategories: input.existingCategories.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description
        }))
      }),
      signal: controller.signal
    });

    const parsed = apiResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new AiAnalysisError('AI_RESPONSE_INVALID', 'AI 분석 응답 형식이 올바르지 않습니다.');
    }

    if (!parsed.data.ok) {
      throw new AiAnalysisError(parsed.data.error.code, parsed.data.error.message);
    }

    return {
      ...parsed.data.analysis,
      tags: [...new Set(parsed.data.analysis.tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 7),
      category: {
        ...parsed.data.analysis.category,
        name: parsed.data.analysis.category.name.trim()
      }
    };
  } catch (error) {
    if (error instanceof AiAnalysisError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AiAnalysisError('TIMEOUT', 'AI 분석 시간이 초과되었습니다. 다시 시도해 주세요.');
    }

    throw new AiAnalysisError('NETWORK_ERROR', 'AI 분석 서버에 연결하지 못했습니다.');
  } finally {
    window.clearTimeout(timeoutId);
  }
}
