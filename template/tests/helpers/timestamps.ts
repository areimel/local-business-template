let cachedTimestamp: string | null = null;

/**
 * Returns a consistent timestamp for the entire test run.
 * Format: YYYY-MM-DD_HH-MM-SS
 */
export function getRunTimestamp(): string {
  if (!cachedTimestamp) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    cachedTimestamp = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
    ].join('-') + '_' + [
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds()),
    ].join('-');
  }
  return cachedTimestamp;
}

/**
 * Converts a URL path to a filesystem-safe filename.
 * e.g. '/air-conditioning/ac-repair/' → 'air-conditioning--ac-repair'
 *      '/' → 'homepage'
 */
export function pathToFilename(path: string): string {
  if (path === '/') return 'homepage';
  return path
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\//g, '--');
}
