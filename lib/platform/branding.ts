import { COMPANY } from '@/lib/company/constants'
import { loadPublicCompanyProfile } from '@/lib/platform/site-settings'
import { pickUsableMediaUrl } from '@/lib/media/usable-url'

export async function getCompanyLogoUrl(): Promise<string> {
  try {
    const profile = await loadPublicCompanyProfile()
    return pickUsableMediaUrl(profile.logoUrl, COMPANY.logoUrl)
  } catch {
    return pickUsableMediaUrl(COMPANY.logoUrl)
  }
}
