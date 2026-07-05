import { db } from './db';
import type { AppSettings } from '../types/appSettings';

const nowIso = () => new Date().toISOString();

export function createDefaultSettings(): AppSettings {
  const timestamp = nowIso();
  return {
    id: 'default',
    appLockEnabled: true,
    theme: 'dark',
    aiAutoAnalyze: true,
    aiAnalyzeSensitiveContent: true,
    hasAcceptedAiPrivacyNotice: false,
    aiProvider: import.meta.env.VITE_AI_PROVIDER === 'mock' ? 'mock' : 'real',
    analysisDailyLimit: 30,
    analysisMaxInputChars: 6000,
    analysisAutoRun: true,
    analysisRetryEnabled: true,
    analysisMaxAttempts: 3,
    analysisCooldownMinutes: 5,
    backupMode: 'encrypted',
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function normalizeSettings(settings: Partial<AppSettings> | undefined): AppSettings {
  const defaults = createDefaultSettings();
  return {
    ...defaults,
    ...settings,
    id: 'default',
    appLockEnabled: settings?.appLockEnabled ?? defaults.appLockEnabled,
    theme: settings?.theme ?? defaults.theme,
    aiAutoAnalyze: settings?.aiAutoAnalyze ?? defaults.aiAutoAnalyze,
    aiAnalyzeSensitiveContent: settings?.aiAnalyzeSensitiveContent ?? defaults.aiAnalyzeSensitiveContent,
    hasAcceptedAiPrivacyNotice:
      settings?.hasAcceptedAiPrivacyNotice ?? defaults.hasAcceptedAiPrivacyNotice,
    aiProvider: settings?.aiProvider ?? defaults.aiProvider,
    analysisDailyLimit: settings?.analysisDailyLimit ?? defaults.analysisDailyLimit,
    analysisMaxInputChars: settings?.analysisMaxInputChars ?? defaults.analysisMaxInputChars,
    analysisAutoRun: settings?.analysisAutoRun ?? defaults.analysisAutoRun,
    analysisRetryEnabled: settings?.analysisRetryEnabled ?? defaults.analysisRetryEnabled,
    analysisMaxAttempts: settings?.analysisMaxAttempts ?? defaults.analysisMaxAttempts,
    analysisCooldownMinutes: settings?.analysisCooldownMinutes ?? defaults.analysisCooldownMinutes,
    backupMode: settings?.backupMode ?? defaults.backupMode,
    createdAt: settings?.createdAt ?? defaults.createdAt,
    updatedAt: settings?.updatedAt ?? defaults.updatedAt
  };
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('default');
  if (settings) {
    const normalized = normalizeSettings(settings);
    await db.settings.put(normalized);
    return normalized;
  }

  const legacySettings = await db.table<Partial<AppSettings>>('settings').get('settings');
  const normalized = normalizeSettings(legacySettings);
  await db.settings.put(normalized);
  return normalized;
}

export async function updateSettings(changes: Partial<Omit<AppSettings, 'id' | 'createdAt'>>): Promise<AppSettings> {
  const settings = {
    ...(await getSettings()),
    ...changes,
    id: 'default' as const,
    updatedAt: nowIso()
  };
  await db.settings.put(settings);
  return settings;
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.bookmarks, db.categories, db.tags, db.settings, db.analysisQueue, async () => {
    await db.bookmarks.clear();
    await db.categories.clear();
    await db.tags.clear();
    await db.settings.clear();
    await db.analysisQueue.clear();
  });
}
