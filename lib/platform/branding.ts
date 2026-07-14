import { COMPANY } from '@/lib/company/constants'
import { loadAllSiteSettingRows, loadPublicCompanyProfile } from '@/lib/platform/site-settings'
import { pickUsableMediaUrl } from '@/lib/media/usable-url'

/**
 * Logo used on the website header, emails, favicon/SEO, and as the default
 * certificate logo. Prefer company_logo_url (R2 https); fall back to certificate
 * logo if the company field is still a stale /images/ path.
 */
export async function getCompanyLogoUrl(): Promise<string> {
  try {
    const [profile, rows] = await Promise.all([
      loadPublicCompanyProfile(),
      loadAllSiteSettingRows(),
    ])
    return pickUsableMediaUrl(
      profile.logoUrl,
      rows.company_logo_url,
      rows.certificate_logo_url,
      COMPANY.logoUrl
    )
  } catch {
    return pickUsableMediaUrl(COMPANY.logoUrl)
  }
}
