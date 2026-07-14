/** Append a cache-busting query so CDN/browser serve freshly uploaded hero media. */
export function withHeroMediaVersion(src: string, version: string | null | undefined): string {
  const v = String(version ?? '').trim()
  if (!v || !src) return src
  const join = src.includes('?') ? '&' : '?'
  return `${src}${join}v=${encodeURIComponent(v)}`
}

/** Normalize playlist background values (ignore cache-bust / trailing junk). */
export function normalizeHeroBackgroundMode(background: string | null | undefined): string {
  if (!background?.trim()) return ''
  const raw = background.trim().split('?')[0]?.replace(/\/$/, '') || ''
  return raw
}

export function isHeroImagePlaylistMode(background: string | null | undefined): boolean {
  const value = normalizeHeroBackgroundMode(background)
  if (!value) return true
  return value === '/hero/playlist' || value === '/hero' || value === '/hero-laboratory.jpg'
}

export function isHeroVideoPlaylistMode(background: string | null | undefined): boolean {
  const value = normalizeHeroBackgroundMode(background)
  return value === '/videos/playlist' || value === '/videos'
}
