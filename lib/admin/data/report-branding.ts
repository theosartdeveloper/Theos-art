import { jsPDF } from 'jspdf'
import { COMPANY } from '@/lib/company/constants'

const BRAND_CHARCOAL: [number, number, number] = [58, 58, 58]
const BRAND_ORANGE: [number, number, number] = [240, 138, 40]
const MUTED: [number, number, number] = [100, 116, 139]

/** Display form for reports (no protocol). */
export const REPORT_SITE_DISPLAY = 'www.theosartltd.com'

let cachedLogoDataUrl: string | null | undefined

/** Load company logo as a data URL for reliable PDF embedding. */
export async function loadReportLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl !== undefined) return cachedLogoDataUrl

  // Server: read from public assets
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
  /** Report name shown top-right in the brand bar (e.g. Money traffic & shop sales). */
  title: string
  /** Primary meta line under the logo (e.g. report range). */
  subtitle?: string
  logoDataUrl?: string | null
}

/**
 * Draws a professional letterhead on the first page.
 * Logo + company name left; report title right; range / location / contacts under the logo.
 * Returns the Y position where content should start.
 */
export function drawReportHeader(doc: jsPDF, options: ReportHeaderOptions): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  const headerTop = 10
  const barHeight = 28
  const rightEdge = pageWidth - margin

  // Brand bar
  doc.setFillColor(...BRAND_CHARCOAL)
  doc.rect(0, 0, pageWidth, barHeight + 4, 'F')
  doc.setFillColor(...BRAND_ORANGE)
  doc.rect(0, barHeight + 4, pageWidth, 1.2, 'F')

  let textLeft = margin
  if (options.logoDataUrl) {
    try {
      const format = options.logoDataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG'
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, headerTop - 1, 22, 18, 2, 2, 'F')
      doc.addImage(options.logoDataUrl, format, margin + 2, headerTop + 1, 18, 14)
      textLeft = margin + 26
    } catch {
      // Logo failed — continue with text-only header
    }
  }

  // Company identity (left, beside logo)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(COMPANY.legalName, textLeft, headerTop + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(COMPANY.slogan, textLeft, headerTop + 14)

  // Report title (top-right corner of brand bar)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  const titleLines = doc.splitTextToSize(options.title, 72)
  doc.text(titleLines, rightEdge, headerTop + 8, { align: 'right' })

  // Meta under logo: range, location, contacts — left-aligned with logo column
  let y = barHeight + 12
  const metaLeft = margin

  if (options.subtitle) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...BRAND_CHARCOAL)
    doc.text(options.subtitle, metaLeft, y)
    y += 5.5
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...MUTED)
  doc.text(`${COMPANY.address} · ${COMPANY.region}`, metaLeft, y)
  y += 4.5
  doc.text(
    `${COMPANY.email}  ·  ${COMPANY.phoneDisplay}  ·  ${REPORT_SITE_DISPLAY}`,
    metaLeft,
    y
  )
  y += 4.5
  doc.text(`Generated: ${new Date().toLocaleString()}`, metaLeft, y)
  y += 6

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)

  return y + 6
}

/** Company letterhead rows for Excel / CSV exports. */
export function companyLetterheadRows(): Array<Array<string | number>> {
  return [
    [COMPANY.legalName],
    [COMPANY.slogan],
    [COMPANY.email],
    [COMPANY.phoneDisplay],
    [COMPANY.address],
    [REPORT_SITE_DISPLAY],
    [`Generated: ${new Date().toLocaleString()}`],
    [],
  ]
}

export function drawReportFooter(doc: jsPDF, pageNumber: number, pageCount: number): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(
    `${COMPANY.legalName} · ${REPORT_SITE_DISPLAY} · Confidential · Page ${pageNumber} of ${pageCount}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  )
}
