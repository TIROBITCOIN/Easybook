export type AiProvider = 'real' | 'mock';

export type AppSettings = {
  id: 'settings';
  aiAutoAnalyze: boolean;
  hasAcceptedAiPrivacyNotice: boolean;
  preferredAiProvider: AiProvider;
};
