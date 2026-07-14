import { withHeroMediaVersion } from '@/lib/media/hero-cache'

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
 * Prefer R2/CDN whenever a public media base is configured (same as videos),
 * so admin uploads replace what the homepage actually loads.
 */
export function getHeroImagesBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_HERO_IMAGES_BASE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const r2Base =
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ||
    process.env.R2_PUBLIC_BASE_URL?.trim()
  if (r2Base) {
    return `${r2Base.replace(/\/$/, '')}/hero`
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (supabaseUrl) {
    return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/platform-media/hero`
  }

  return '/hero'
}

export function getHeroImagePlaylist(version?: string | null): HeroImageSlide[] {
  const base = getHeroImagesBaseUrl()
  return HERO_IMAGE_FILES.map((item) => ({
    src: withHeroMediaVersion(`${base}/${item.file}`, version),
    label: item.label,
  }))
}
