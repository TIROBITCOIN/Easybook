import { analyzeBookmarkRemote } from './analyzeBookmarkClient';
import { mockAnalyzeBookmark } from './mockAnalyzeBookmark';
import type { MockAnalysisInput, MockAnalysisResult } from './analysisTypes';
import type { AiProvider } from '../types/appSettings';

export function getConfiguredProvider(): AiProvider {
  return import.meta.env.VITE_AI_PROVIDER === 'mock' ? 'mock' : 'real';
}

export async function analyzeWithMock(input: MockAnalysisInput): Promise<MockAnalysisResult> {
  return mockAnalyzeBookmark(input);
}

export async function analyzeWithRemote(input: MockAnalysisInput): Promise<MockAnalysisResult> {
  return analyzeBookmarkRemote(input);
}

export async function analyzeBookmark(input: MockAnalysisInput, provider = getConfiguredProvider()) {
  return provider === 'mock' ? analyzeWithMock(input) : analyzeWithRemote(input);
}
