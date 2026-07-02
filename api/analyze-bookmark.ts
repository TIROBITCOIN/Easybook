import OpenAI from 'openai';
import { z } from 'zod';

const requestSchema = z
  .object({
    originalText: z.string().max(6000).optional().default(''),
    sourceUrl: z.string().max(1000).optional(),
    existingCategories: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().min(1).max(30),
          description: z.string().max(200).optional()
        })
      )
      .max(100)
      .optional()
      .default([])
  })
  .refine((value) => value.originalText.trim() || value.sourceUrl?.trim(), {
    message: '북마크 본문 또는 링크가 필요합니다.'
  });

const analysisSchema = z.object({
  title: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(1).max(300),
  category: z.object({
    name: z.string().trim().min(1).max(30),
    isNew: z.boolean()
  }),
  tags: z.array(z.string().trim().min(1).max(20)).min(1).max(7),
  difficultyExplanation: z.object({
    easy: z.string().trim().min(20).max(250),
    medium: z.string().trim().min(80).max(700),
    advanced: z.string().trim().min(150).max(1200)
  }),
  revisitReason: z.string().trim().min(1).max(250),
  importance: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1)
});

const analysisJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'summary',
    'category',
    'tags',
    'difficultyExplanation',
    'revisitReason',
    'importance',
    'confidence'
  ],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 80 },
    summary: { type: 'string', minLength: 1, maxLength: 300 },
    category: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'isNew'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 30 },
        isNew: { type: 'boolean' }
      }
    },
    tags: {
      type: 'array',
      minItems: 1,
      maxItems: 7,
      items: { type: 'string', minLength: 1, maxLength: 20 }
    },
    difficultyExplanation: {
      type: 'object',
      additionalProperties: false,
      required: ['easy', 'medium', 'advanced'],
      properties: {
        easy: { type: 'string', minLength: 20, maxLength: 250 },
        medium: { type: 'string', minLength: 80, maxLength: 700 },
        advanced: { type: 'string', minLength: 150, maxLength: 1200 }
      }
    },
    revisitReason: { type: 'string', minLength: 1, maxLength: 250 },
    importance: { type: 'string', enum: ['low', 'medium', 'high'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 }
  }
} as const;

type ApiResponse =
  | { ok: true; analysis: z.infer<typeof analysisSchema> }
  | {
      ok: false;
      error: {
        code: ApiErrorCode;
        message: string;
      };
    };

type ApiErrorCode = 'INVALID_INPUT' | 'AI_REQUEST_FAILED' | 'AI_RESPONSE_INVALID' | 'RATE_LIMITED' | 'UNKNOWN';

type ServerRequest = {
  method?: string;
  body?: unknown;
};

type ServerResponse = {
  status(code: number): ServerResponse;
  json(body: ApiResponse): void;
};

function error(res: ServerResponse, status: number, code: ApiErrorCode, message: string): void {
  res.status(status).json({ ok: false, error: { code, message } });
}

function uniqueNames(names: string[]): string[] {
  return [...new Set(names.map((name) => name.trim()).filter(Boolean))];
}

export default async function handler(req: ServerRequest, res: ServerResponse) {
  if (req.method !== 'POST') {
    error(res, 405, 'INVALID_INPUT', '지원하지 않는 요청 방식입니다.');
    return;
  }

  const parsedBody = requestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    error(res, 400, 'INVALID_INPUT', parsedBody.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.');
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    error(res, 503, 'AI_REQUEST_FAILED', 'AI 분석 설정이 아직 완료되지 않았습니다.');
    return;
  }

  const body = parsedBody.data;
  const existingCategoryNames = uniqueNames(body.existingCategories.map((category) => category.name)).slice(0, 50);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-5.5',
      store: false,
      input: [
        {
          role: 'developer',
          content:
            '너는 X/Twitter 북마크를 개인 지식관리용으로 분류하고 설명하는 분석기다. 한국어로 답한다. 기존 카테고리를 우선 사용하고, 맞지 않을 때만 새 카테고리를 제안한다. 민감하거나 논쟁적인 내용은 판단을 단정하지 말고 맥락과 전제를 분리해서 설명한다.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            sourceUrl: body.sourceUrl,
            originalText: body.originalText,
            existingCategories: existingCategoryNames
          })
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'easybook_bookmark_analysis',
          strict: true,
          schema: analysisJsonSchema
        }
      }
    });

    const outputText = response.output_text;
    const parsedAnalysis = analysisSchema.safeParse(JSON.parse(outputText));
    if (!parsedAnalysis.success) {
      error(res, 502, 'AI_RESPONSE_INVALID', 'AI 분석 응답 형식이 올바르지 않습니다.');
      return;
    }

    const analysis = parsedAnalysis.data;
    analysis.tags = uniqueNames(analysis.tags).slice(0, 7);
    analysis.category.name = analysis.category.name.trim();

    res.status(200).json({ ok: true, analysis });
  } catch (requestError) {
    const status = typeof requestError === 'object' && requestError && 'status' in requestError ? requestError.status : undefined;
    if (status === 429) {
      error(res, 429, 'RATE_LIMITED', 'AI 요청이 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    error(res, 502, 'AI_REQUEST_FAILED', 'AI 분석 요청에 실패했습니다. 다시 시도해 주세요.');
  }
}
