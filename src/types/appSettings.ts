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
  backupMode: BackupMode;
  createdAt: string;
  updatedAt: string;
};
