import { COMPANY } from '@/lib/company/constants'
import { loadAllSiteSettingRows } from '@/lib/platform/site-settings'
import { pickUsableMediaUrl } from '@/lib/media/usable-url'

export type CertificateBranding = {
  logoUrl: string
  stampUrl: string
  signatoryName: string
  signatoryTitle: string
}

const DEFAULTS: CertificateBranding = {
  logoUrl: '',
  stampUrl: '',
  signatoryName: 'Elie BISAMAZA',
  signatoryTitle: `Managing Director · ${COMPANY.legalName}`,
}

export async function loadCertificateBranding(): Promise<CertificateBranding> {
  try {
    const rows = await loadAllSiteSettingRows()
    // Prefer certificate-specific assets, but never keep stale `/images/...` seeds
    // once company logo/stamp has been moved to R2 (https://…).
    const logoUrl = pickUsableMediaUrl(
      rows.certificate_logo_url,
      rows.company_logo_url,
      COMPANY.logoUrl
    )
    const stampUrl = pickUsableMediaUrl(rows.certificate_stamp_url)

    return {
      logoUrl,
      stampUrl,
      signatoryName: rows.certificate_signatory_name?.trim() || rows.founder_name?.trim() || DEFAULTS.signatoryName,
      signatoryTitle:
        rows.certificate_signatory_title?.trim() ||
        (rows.founder_title?.trim()
          ? `${rows.founder_title.trim()} · ${COMPANY.legalName}`
          : DEFAULTS.signatoryTitle),
    }
  } catch {
    return {
      ...DEFAULTS,
      logoUrl: pickUsableMediaUrl(COMPANY.logoUrl),
    }
  }
}

export function resolveCertificateAsset(assetBaseUrl: string, pathOrUrl: string): string {
  const value = pathOrUrl.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  const base = assetBaseUrl.replace(/\/$/, '')
  return `${base}${value.startsWith('/') ? '' : '/'}${value}`
}
