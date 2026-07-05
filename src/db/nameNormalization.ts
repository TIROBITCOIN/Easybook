export function normalizeNameForLookup(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
