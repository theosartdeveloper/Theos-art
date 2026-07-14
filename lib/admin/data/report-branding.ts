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

/** Load company logo as a data URL for reliable PDF embedding. */
export async function loadReportLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl

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
    const res = await fetch(COMPANY.logoUrl, { cache: 'force-cache' })
    if (!res.ok) throw new Error(`Logo HTTP ${res.status}`)
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
    cachedLogoDataUrl = dataUrl
    return dataUrl
  } catch {
    cachedLogoDataUrl = null
    return null
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
