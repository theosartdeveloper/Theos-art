/**
 * Shared helpers for public media URLs (logos, stamps) after the R2 migration.
 * Legacy relative `/images/...` defaults often 404 because those files are no longer in `public/`.
 */

export function isLegacyLocalImagePath(url: string | null | undefined): boolean {
  const value = String(url ?? '').trim()
  if (!value) return true
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return false
  return value.startsWith('/images/')
}

/** Prefer the first usable media URL (absolute HTTPS/data preferred; skip broken legacy /images paths). */
export function pickUsableMediaUrl(...candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim()
    if (!value) continue
    if (isLegacyLocalImagePath(value)) continue
    return value
  }
  return ''
}

export function isAbsoluteMediaUrl(url: string | null | undefined): boolean {
  const value = String(url ?? '').trim()
  return /^https?:\/\//i.test(value) || value.startsWith('data:')
}
