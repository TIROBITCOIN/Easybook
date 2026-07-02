import { exportAllData, replaceAllData } from '../db/repo';
import { decryptJson, encryptJson } from './crypto';

export async function createPlainBackup(): Promise<string> {
  return JSON.stringify(await exportAllData(), null, 2);
}

export async function createEncryptedBackup(password: string): Promise<string> {
  return encryptJson(await exportAllData(), password);
}

export async function importPlainBackup(text: string): Promise<void> {
  const payload = JSON.parse(text);
  await replaceAllData(payload);
}

export async function importEncryptedBackup(text: string, password: string): Promise<void> {
  const payload = await decryptJson<Parameters<typeof replaceAllData>[0]>(text, password);
  await replaceAllData(payload);
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
