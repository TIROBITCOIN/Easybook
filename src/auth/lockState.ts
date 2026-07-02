const unlockKey = 'easybook-unlocked';

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(unlockKey) === 'true';
}

export function setSessionUnlocked(): void {
  sessionStorage.setItem(unlockKey, 'true');
}

export function clearSessionUnlocked(): void {
  sessionStorage.removeItem(unlockKey);
}
