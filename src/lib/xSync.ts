export type XSyncProvider = {
  syncBookmarks(): Promise<void>;
};

export function createDisabledXSyncProvider(): XSyncProvider {
  return {
    async syncBookmarks() {
      throw new Error('X API sync is intentionally not implemented in the MVP.');
    }
  };
}
