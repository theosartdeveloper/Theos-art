import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getActiveHero } from '@/lib/platform/queries'
import { HeroVideoRotator } from '@/components/home/hero-video-rotator'
import { HeroImageRotator } from '@/components/home/hero-image-rotator'
import { HeroBackgroundMedia } from '@/components/home/hero-background-media'
import { getHeroVideoPlaylist } from '@/lib/media/hero-videos'
import { getHeroImagePlaylist } from '@/lib/media/hero-images'
import { COMPANY } from '@/lib/company/constants'
import type { HeroContent } from '@/types/platform'
import { loadHomePersonalization, resolveHomeHeroCtas } from '@/lib/home/personalization'

const defaultHero: HeroContent = {
  id: 'default',
  title: `${COMPANY.brandName}`,
  subtitle:
    'Original artworks and quality art materials in Kigali — create, collect, and supply your studio with Theos Art.',
  background_image: '/hero/playlist',
  cta_primary_label: 'Browse shop',
  cta_primary_url: '/shop',
  cta_secondary_label: 'About us',
  cta_secondary_url: '/about',
  is_active: true,
}

function useHeroImagePlaylist(background: string | null | undefined): boolean {
  if (!background?.trim()) return true
  const value = background.trim()
  if (value === '/hero/playlist' || value === '/hero') return true
  if (value === '/hero-laboratory.jpg') return true
  return false
}

function useHeroVideoPlaylist(background: string | null | undefined): boolean {
  if (!background?.trim()) return false
  const value = background.trim()
  if (value === '/videos/playlist' || value === '/videos') return true
  return false
}

export async function HomeHeroSection({ fullViewport = false }: { fullViewport?: boolean }) {
  const [hero, personalization] = await Promise.all([getActiveHero(), loadHomePersonalization()])
  const resolvedHero = hero ?? defaultHero
  const ctas = resolveHomeHeroCtas(personalization, {
    primaryLabel: resolvedHero.cta_primary_label,
    primaryUrl: resolvedHero.cta_primary_url,
    secondaryLabel: resolvedHero.cta_secondary_label,
    secondaryUrl: resolvedHero.cta_secondary_url,
  })
  const showImages = useHeroImagePlaylist(resolvedHero.background_image)
  const showVideos = !showImages && useHeroVideoPlaylist(resolvedHero.background_image)
  const imagePlaylist = getHeroImagePlaylist()
  const videoPlaylist = getHeroVideoPlaylist()

  return (
    <section
      className={`relative flex items-end lg:items-center overflow-hidden bg-black ${
        fullViewport ? 'hero-viewport-full' : 'hero-viewport'
      }`}
    >
      {showImages ? (
        <div className="absolute inset-0">
          <HeroImageRotator playlist={imagePlaylist} />
        </div>
      ) : showVideos ? (
        <div className="absolute inset-0">
          <HeroVideoRotator playlist={videoPlaylist} />
        </div>
      ) : resolvedHero.background_image ? (
        <HeroBackgroundMedia src={resolvedHero.background_image} alt={resolvedHero.title} />
      ) : null}
      <div className="absolute inset-0 z-[1] bg-black/55 md:bg-black/45" aria-hidden />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 pb-10 sm:pb-12 lg:pb-0 pt-24 sm:pt-28 lg:pt-[calc(var(--site-header-h)+2rem)]">
        <div className="max-w-2xl lg:max-w-3xl text-on-dark text-left">
          <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-3">
            {COMPANY.brandName}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl font-bold mb-3 sm:mb-4 lg:mb-5 leading-[1.15] tracking-tight">
            {resolvedHero.title === COMPANY.brandName
              ? 'Original art & materials'
              : resolvedHero.title}
          </h1>
          {resolvedHero.subtitle && (
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 lg:mb-9 leading-relaxed max-w-2xl">
              {resolvedHero.subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
            <Link href={ctas.primaryUrl} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-w-[11rem] bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90 font-semibold"
              >
                {ctas.primaryLabel}
              </Button>
            </Link>
            <Link href={ctas.secondaryUrl} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-w-[11rem] border-white text-white hover:bg-white/10 bg-transparent font-semibold"
              >
                {ctas.secondaryLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
