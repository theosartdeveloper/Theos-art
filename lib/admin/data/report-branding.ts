import { jsPDF } from 'jspdf'
import { COMPANY } from '@/lib/company/constants'

const BRAND_CHARCOAL: [number, number, number] = [58, 58, 58]
/** Soft charcoal / “light black” panel under the top identity strip */
const HEADER_PANEL: [number, number, number] = [72, 72, 74]
const BRAND_ORANGE: [number, number, number] = [240, 138, 40]
const MUTED_ON_DARK: [number, number, number] = [200, 204, 210]
const WHITE: [number, number, number] = [255, 255, 255]

/** Display form for reports (no protocol). */
export const REPORT_SITE_DISPLAY = 'www.theosartltd.com'

let cachedLogoDataUrl: string | null | undefined
let cachedAuthority:
  | {
      stampDataUrl: string | null
      signatoryName: string
      signatoryRole: string
    }
  | undefined

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function fetchImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.size) return null
    return blobToDataUrl(blob)
  } catch {
    return null
  }
}

/** Absolutize branding URLs without pulling email/server modules into the client bundle. */
function toAbsoluteMediaUrl(pathOrUrl: string): string {
  const value = pathOrUrl.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  if (value.startsWith('/images/')) return ''
  const base = COMPANY.publicSiteUrl.replace(/\/$/, '')
  return `${base}${value.startsWith('/') ? '' : '/'}${value}`
}

type PublicBrandingPayload = {
  logoUrl?: string
  stampUrl?: string
  signatoryName?: string
  signatoryTitle?: string
}

async function loadPublicBranding(): Promise<PublicBrandingPayload> {
  // Browser: hit the public API (works from admin Client Components).
  if (typeof window !== 'undefined') {
    const res = await fetch('/api/public/certificate-branding', { cache: 'no-store' })
    if (!res.ok) return {}
    return (await res.json()) as PublicBrandingPayload
  }

  // Server (e.g. emailed leadership PDF): resolve settings directly.
  const { loadCertificateBranding } = await import('@/lib/certificate/branding')
  const branding = await loadCertificateBranding()
  return {
    logoUrl: toAbsoluteMediaUrl(branding.logoUrl) || branding.logoUrl,
    stampUrl: toAbsoluteMediaUrl(branding.stampUrl) || branding.stampUrl,
    signatoryName: branding.signatoryName,
    signatoryTitle: branding.signatoryTitle,
  }
}

/** Load company logo as a data URL for reliable PDF embedding. */
export async function loadReportLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl

  try {
    const branding = await loadPublicBranding()
    if (branding.logoUrl) {
      const fromBranding = await fetchImageDataUrl(branding.logoUrl)
      if (fromBranding) {
        cachedLogoDataUrl = fromBranding
        return cachedLogoDataUrl
      }
    }
  } catch {
    // fall through
  }

  if (typeof window === 'undefined') {
    try {
      const { promises: fs } = await import('fs')
      const path = await import('path')
      const file = path.join(process.cwd(), 'public', 'images', 'theos-art-logo-v2.png')
      const buf = await fs.readFile(file)
      cachedLogoDataUrl = `data:image/png;base64,${buf.toString('base64')}`
      return cachedLogoDataUrl
    } catch {
      cachedLogoDataUrl = null
      return null
    }
  }

  try {
    const absolute = toAbsoluteMediaUrl(COMPANY.logoUrl)
    if (!absolute) {
      cachedLogoDataUrl = null
      return null
    }
    cachedLogoDataUrl = await fetchImageDataUrl(absolute)
    return cachedLogoDataUrl
  } catch {
    cachedLogoDataUrl = null
    return null
  }
}

/** Stamp + Managing Director assets for report signature blocks. */
export async function loadReportAuthorityAssets(): Promise<{
  stampDataUrl: string | null
  signatoryName: string
  signatoryRole: string
}> {
  if (cachedAuthority) return cachedAuthority

  const fallback = {
    stampDataUrl: null as string | null,
    signatoryName: 'Elie BISAMAZA',
    signatoryRole: 'Managing Director',
  }

  try {
    const branding = await loadPublicBranding()
    const role =
      String(branding.signatoryTitle || '')
        .split('·')[0]
        ?.trim() || 'Managing Director'
    cachedAuthority = {
      stampDataUrl: branding.stampUrl ? await fetchImageDataUrl(branding.stampUrl) : null,
      signatoryName: branding.signatoryName?.trim() || fallback.signatoryName,
      signatoryRole: role,
    }
    return cachedAuthority
  } catch {
    cachedAuthority = fallback
    return cachedAuthority
  }
}

export type ReportHeaderOptions = {
  /** Report name shown top-right (e.g. Money traffic & shop sales). */
  title: string
  /** Report range label, e.g. "All time". */
  reportRange?: string
  /** Optional subtitle when reportRange is not used (shown as context under title). */
  subtitle?: string
  logoDataUrl?: string | null
  generatedAt?: Date
}

/**
 * Professional letterhead:
 * - Left: logo, company, slogan → Location + Contacts under slogan
 * - Right: report title → Report range + Generated under title
 * Both columns sit on a light-black (soft charcoal) header panel.
 * Returns Y where page content should start.
 */
export function drawReportHeader(doc: jsPDF, options: ReportHeaderOptions): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  const rightEdge = pageWidth - margin
  const generated = (options.generatedAt ?? new Date()).toLocaleString()

  const rangeLine =
    options.reportRange != null
      ? options.reportRange
      : options.subtitle?.replace(/^Report range:\s*/i, '') || undefined

  const leftInfo = [
    `Location  ${COMPANY.address} · ${COMPANY.region}`,
    `Contacts  ${COMPANY.email}  ·  ${COMPANY.phoneDisplay}  ·  ${REPORT_SITE_DISPLAY}`,
  ]
  const rightInfo: string[] = []
  if (rangeLine) rightInfo.push(`Report range  ${rangeLine}`)
  rightInfo.push(`Generated  ${generated}`)

  const leftColWidth = pageWidth * 0.55 - margin
  const rightColWidth = pageWidth * 0.42 - margin

  // Measure wrapped info so the panel height fits
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  const leftWrapped = leftInfo.flatMap((line) => doc.splitTextToSize(line, leftColWidth))
  const rightWrapped = rightInfo.flatMap((line) => doc.splitTextToSize(line, rightColWidth))
  const infoLines = Math.max(leftWrapped.length, rightWrapped.length, 2)

  const topStripH = 22
  const infoBlockH = 6 + infoLines * 4.2 + 4
  const totalHeaderH = topStripH + infoBlockH

  // Light-black / soft charcoal full-width header
  doc.setFillColor(...HEADER_PANEL)
  doc.rect(0, 0, pageWidth, totalHeaderH, 'F')

  // Slightly darker top identity strip
  doc.setFillColor(...BRAND_CHARCOAL)
  doc.rect(0, 0, pageWidth, topStripH, 'F')

  doc.setFillColor(...BRAND_ORANGE)
  doc.rect(0, totalHeaderH, pageWidth, 1.2, 'F')

  const headerTop = 7
  let textLeft = margin

  if (options.logoDataUrl) {
    try {
      const format = options.logoDataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG'
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, headerTop - 1, 18, 14, 1.5, 1.5, 'F')
      doc.addImage(options.logoDataUrl, format, margin + 1.5, headerTop + 0.5, 15, 11)
      textLeft = margin + 22
    } catch {
      // continue text-only
    }
  }

  // Company + slogan (left)
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(COMPANY.legalName, textLeft, headerTop + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED_ON_DARK)
  doc.text(COMPANY.slogan, textLeft, headerTop + 11)

  // Report title (right)
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const titleLines = doc.splitTextToSize(options.title, rightColWidth)
  doc.text(titleLines, rightEdge, headerTop + 7, { align: 'right' })

  // Under slogan (left) + under title (right) on the soft charcoal panel
  const infoY = topStripH + 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED_ON_DARK)

  let ly = infoY
  for (const line of leftWrapped) {
    doc.text(line, margin, ly)
    ly += 4.2
  }

  let ry = infoY
  for (const line of rightWrapped) {
    doc.text(line, rightEdge, ry, { align: 'right' })
    ry += 4.2
  }

  return totalHeaderH + 8
}

/** Company letterhead rows for Excel / CSV exports. */
export function companyLetterheadRows(reportRange?: string): Array<Array<string | number>> {
  return [
    [COMPANY.legalName],
    [COMPANY.slogan],
    [`Location: ${COMPANY.address} · ${COMPANY.region}`],
    [`Contacts: ${COMPANY.email} · ${COMPANY.phoneDisplay} · ${REPORT_SITE_DISPLAY}`],
    ...(reportRange ? [[`Report range: ${reportRange}`] as Array<string | number>] : []),
    [`Generated: ${new Date().toLocaleString()}`],
    [],
  ]
}

export function drawReportFooter(doc: jsPDF, pageNumber: number, pageCount: number): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(
    `${COMPANY.legalName} · ${REPORT_SITE_DISPLAY} · Confidential · Page ${pageNumber} of ${pageCount}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  )
}

/**
 * Certificate-style authority block: stamp centered over Managing Director name + title.
 * Pass startY (after last table). Adds a new page when space is insufficient.
 */
export function drawReportAuthorityBlock(
  doc: jsPDF,
  options: {
    stampDataUrl?: string | null
    signatoryName: string
    signatoryRole?: string
    startY?: number
  }
): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const role = options.signatoryRole || 'Managing Director'
  const blockH = 42
  const footerReserve = 16
  let y = options.startY ?? pageHeight - blockH - footerReserve

  if (y + blockH > pageHeight - footerReserve) {
    doc.addPage()
    y = 24
  }

  const centerX = pageWidth / 2
  const nameY = y + 22
  const titleY = nameY + 8
  const ruleY = nameY + 3

  // Text first (paper), then stamp on top — same layering as certificates
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(58, 58, 58)
  doc.text(options.signatoryName.toUpperCase(), centerX, nameY, { align: 'center' })

  doc.setDrawColor(45, 55, 72)
  doc.setLineWidth(0.4)
  doc.line(centerX - 28, ruleY, centerX + 28, ruleY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(90, 100, 114)
  doc.text(role, centerX, titleY, { align: 'center' })

  if (options.stampDataUrl) {
    try {
      const format = options.stampDataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG'
      const stampSize = 34
      doc.addImage(
        options.stampDataUrl,
        format,
        centerX - stampSize / 2,
        nameY - stampSize / 2 + 2,
        stampSize,
        stampSize,
        undefined,
        'FAST'
      )
    } catch {
      // text-only signature if stamp fails
    }
  }
}

/** Convenience: authority after last autoTable, with page break if needed. */
export function drawReportAuthorityAfterContent(
  doc: jsPDF,
  authority: {
    stampDataUrl?: string | null
    signatoryName: string
    signatoryRole?: string
  },
  fallbackY = 40
): void {
  const lastTable = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
  const startY = (lastTable?.finalY ?? fallbackY) + 16
  drawReportAuthorityBlock(doc, { ...authority, startY })
}
