import { db } from './db';
import type { AppSettings } from '../types/appSettings';

export const defaultSettings: AppSettings = {
  id: 'settings',
  aiAutoAnalyze: true,
  hasAcceptedAiPrivacyNotice: false,
  preferredAiProvider: import.meta.env.VITE_AI_PROVIDER === 'mock' ? 'mock' : 'real'
};

export async function getSettings(): Promise<AppSettings> {
  const settings = await db.settings.get('settings');
  if (settings) {
    return settings;
  }

  await db.settings.put(defaultSettings);
  return defaultSettings;
}

export async function updateSettings(changes: Partial<Omit<AppSettings, 'id'>>): Promise<AppSettings> {
  const settings = {
    ...(await getSettings()),
    ...changes
  };
  await db.settings.put(settings);
  return settings;
}
