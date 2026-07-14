import {
  createCertificateHTML,
  generateCertificateId,
  type CertificateData,
} from '@/lib/certificate-template'

type ApplicationCertificateInput = {
  id: string
  full_name?: string
  name?: string
  program?: string | null
  created_at?: string
}

export async function printApplicationCertificate(row: ApplicationCertificateInput): Promise<void> {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  let branding: {
    logoUrl?: string
    stampUrl?: string
    signatoryName?: string
    signatoryTitle?: string
  } = {}
  try {
    const res = await fetch('/api/public/certificate-branding')
    if (res.ok) branding = await res.json()
  } catch {
    // defaults
  }

  const data: CertificateData = {
    fullName: row.full_name || row.name || 'Participant',
    program: row.program || 'Theos Art Training Programme',
    completionDate: row.created_at ? new Date(row.created_at) : new Date(),
    certificateId: generateCertificateId(),
    assetBaseUrl: origin,
    logoUrl: branding.logoUrl,
    stampUrl: branding.stampUrl,
    signatoryName: branding.signatoryName,
    signatoryTitle: branding.signatoryTitle,
  }

  const html = createCertificateHTML(data)
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(html)
  printWindow.document.close()
}
