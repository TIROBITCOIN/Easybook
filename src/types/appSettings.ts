export type AiProvider = 'real' | 'mock';
export type ThemeMode = 'dark' | 'light';
export type BackupMode = 'encrypted' | 'plain';

export type AppSettings = {
  id: 'default';
  appLockEnabled: boolean;
  passwordHash?: string;
  passwordSalt?: string;
  theme: ThemeMode;
  aiAutoAnalyze: boolean;
  aiAnalyzeSensitiveContent: boolean;
  hasAcceptedAiPrivacyNotice: boolean;
  aiProvider: AiProvider;
  analysisDailyLimit: number;
  analysisMaxInputChars: number;
  analysisAutoRun: boolean;
  analysisRetryEnabled: boolean;
  analysisMaxAttempts: number;
  analysisCooldownMinutes: number;
  backupMode: BackupMode;
  createdAt: string;
  updatedAt: string;
};
