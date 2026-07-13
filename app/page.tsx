import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { HomeHeroSection } from '@/components/home/home-hero'
import { FounderSection } from '@/components/home/founder-section'
import { ProgrammesCoursesSection } from '@/components/home/programmes-courses-section'
import { ShopTeaserSection } from '@/components/home/shop-teaser-section'
import { ReviewsTrustSection } from '@/components/home/reviews-trust-section'
import { HomeStickyNav } from '@/components/home/home-sticky-nav'
import { HomeSignedInStrip } from '@/components/home/home-signed-in-strip'
import { ArtEventsSection } from '@/components/home/art-events-section'
import { StudioAnnouncementsSection } from '@/components/home/studio-announcements-section'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <HomeStickyNav />
      <div className="relative">
        <SiteHeader overlay />
        <HomeHeroSection fullViewport />
      </div>
      <HomeSignedInStrip />
      <ShopTeaserSection />
      <ProgrammesCoursesSection />
      <ArtEventsSection />
      <StudioAnnouncementsSection />
      <ReviewsTrustSection compact />
      <FounderSection compact />
      <SiteFooter />
    </main>
  )
}
