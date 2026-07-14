import { COMPANY } from '@/lib/company/constants'
import { loadAllSiteSettingRows } from '@/lib/platform/site-settings'

export type CertificateBranding = {
  logoUrl: string
  stampUrl: string
  signatoryName: string
  signatoryTitle: string
}

const DEFAULTS: CertificateBranding = {
  logoUrl: COMPANY.logoUrl,
  stampUrl: '/images/company-stamp.png',
  signatoryName: 'Elie BISAMAZA',
  signatoryTitle: `Managing Director · ${COMPANY.legalName}`,
}

export async function loadCertificateBranding(): Promise<CertificateBranding> {
  try {
    const rows = await loadAllSiteSettingRows()
    return {
      logoUrl: rows.certificate_logo_url?.trim() || rows.company_logo_url?.trim() || DEFAULTS.logoUrl,
      stampUrl: rows.certificate_stamp_url?.trim() || DEFAULTS.stampUrl,
      signatoryName: rows.certificate_signatory_name?.trim() || rows.founder_name?.trim() || DEFAULTS.signatoryName,
      signatoryTitle:
        rows.certificate_signatory_title?.trim() ||
        (rows.founder_title?.trim()
          ? `${rows.founder_title.trim()} · ${COMPANY.legalName}`
          : DEFAULTS.signatoryTitle),
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function resolveCertificateAsset(assetBaseUrl: string, pathOrUrl: string): string {
  const value = pathOrUrl.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  const base = assetBaseUrl.replace(/\/$/, '')
  return `${base}${value.startsWith('/') ? '' : '/'}${value}`
}
