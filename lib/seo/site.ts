import { COMPANY } from '@/lib/company/constants'
import { absolutePublicUrl } from '@/lib/email/core'
import { pickUsableMediaUrl } from '@/lib/media/usable-url'
import { loadPublicCompanyProfile } from '@/lib/platform/site-settings'

/** Absolute site origin for metadata / JSON-LD. */
export function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') ||
    COMPANY.publicSiteUrl
  )
}

/** Absolute logo URL suitable for Google (favicon, OG, Organization schema). */
export async function getSeoLogoUrl(): Promise<string> {
  try {
    const profile = await loadPublicCompanyProfile()
    const picked = pickUsableMediaUrl(profile.logoUrl, COMPANY.logoUrl)
    const absolute = absolutePublicUrl(picked)
    return absolute || ''
  } catch {
    return absolutePublicUrl(pickUsableMediaUrl(COMPANY.logoUrl))
  }
}

export function buildOrganizationJsonLd(input: {
  name: string
  legalName: string
  url: string
  logoUrl: string
  email: string
  phone: string
  address: string
  description: string
}) {
  const logo = input.logoUrl.trim()
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    legalName: input.legalName,
    url: input.url,
    ...(logo
      ? {
          logo: {
            '@type': 'ImageObject',
            url: logo,
          },
          image: logo,
        }
      : {}),
    email: input.email,
    telephone: input.phone,
    description: input.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: input.address,
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    sameAs: [input.url],
  }
}
