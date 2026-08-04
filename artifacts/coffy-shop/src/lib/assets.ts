/**
 * Resolve a public asset path against Vite's BASE_URL (Replit path router safe).
 * Absolute http(s) URLs are returned unchanged.
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // BASE_URL of "/" → "/images/x.jpg"
  if (!normalizedBase) {
    return normalizedPath;
  }

  return `${normalizedBase}${normalizedPath}`;
}
