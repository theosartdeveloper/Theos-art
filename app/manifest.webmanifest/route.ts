import { NextResponse } from 'next/server'
import { COMPANY } from '@/lib/company/constants'
import { getSeoLogoUrl, getSiteOrigin } from '@/lib/seo/site'
import { loadPublicCompanyProfile } from '@/lib/platform/site-settings'

export const dynamic = 'force-dynamic'

/** Dynamic PWA manifest so the icon follows the live company logo (R2), not a missing /images path. */
export async function GET() {
  const [profile, logoUrl] = await Promise.all([
    loadPublicCompanyProfile(),
    getSeoLogoUrl(),
  ])
  const origin = getSiteOrigin()
  const icon = logoUrl || `${origin}/favicon.ico`

  const manifest = {
    name: profile.brandName || COMPANY.brandName,
    short_name: profile.brandName || COMPANY.brandName,
    description: profile.seo.description || COMPANY.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3a3a3a',
    lang: 'en',
    icons: [
      {
        src: icon,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
