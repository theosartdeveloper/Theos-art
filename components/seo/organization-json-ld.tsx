import { COMPANY } from '@/lib/company/constants'
import {
  buildOrganizationJsonLd,
  getSeoLogoUrl,
  getSiteOrigin,
} from '@/lib/seo/site'
import { loadPublicCompanyProfile } from '@/lib/platform/site-settings'

/** JSON-LD Organization so Google can associate the brand logo with the site name. */
export async function OrganizationJsonLd() {
  const [profile, logoUrl] = await Promise.all([
    loadPublicCompanyProfile(),
    getSeoLogoUrl(),
  ])
  const url = getSiteOrigin()
  const data = buildOrganizationJsonLd({
    name: profile.brandName || COMPANY.brandName,
    legalName: profile.legalName || COMPANY.legalName,
    url,
    logoUrl,
    email: profile.email || COMPANY.email,
    phone: profile.phoneDisplay || COMPANY.phoneDisplay,
    address: profile.address || COMPANY.address,
    description: profile.seo.description || COMPANY.tagline,
  })

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
