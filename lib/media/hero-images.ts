/** Hero still-image definitions (filename only — base URL resolved at runtime). */
export const HERO_IMAGE_FILES = [
  { file: 'hero-01.png', label: 'Studio mentorship' },
  { file: 'hero-02.png', label: 'Live painting' },
  { file: 'hero-03.png', label: 'Gallery session' },
  { file: 'hero-04.png', label: 'Creative workshop' },
  { file: 'hero-05.png', label: 'Artist at work' },
] as const

export type HeroImageSlide = {
  src: string
  label: string
}

/** Seconds each hero image shows before rotating. */
export const HERO_IMAGE_SECONDS = 5

/**
 * Resolve public URL base for hero images.
 * Default: local `/hero`. When R2/CDN is ready, set
 * `NEXT_PUBLIC_HERO_IMAGES_BASE_URL` or `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` (+ `/hero`).
 */
export function getHeroImagesBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_HERO_IMAGES_BASE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const r2Base =
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ||
    process.env.R2_PUBLIC_BASE_URL?.trim()
  // Only use R2 for images when explicitly opted in (local PNGs ship with the repo).
  if (r2Base && process.env.NEXT_PUBLIC_HERO_USE_R2 === 'true') {
    return `${r2Base.replace(/\/$/, '')}/hero`
  }

  return '/hero'
}

export function getHeroImagePlaylist(): HeroImageSlide[] {
  const base = getHeroImagesBaseUrl()
  return HERO_IMAGE_FILES.map((item) => ({
    src: `${base}/${item.file}`,
    label: item.label,
  }))
}
