import { jsPDF } from 'jspdf'
import { COMPANY } from '@/lib/company/constants'

const BRAND_CHARCOAL: [number, number, number] = [58, 58, 58]
const BRAND_ORANGE: [number, number, number] = [240, 138, 40]
const MUTED: [number, number, number] = [100, 116, 139]
const META_BG: [number, number, number] = [248, 250, 252]

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
  /** Report range label, e.g. "All time" or "2024-01-01 → 2024-12-31". */
  reportRange?: string
  /** Optional subtitle when reportRange is not used. */
  subtitle?: string
  logoDataUrl?: string | null
  generatedAt?: Date
}

/**
 * Draws a professional letterhead + meta block on the current page.
 * Logo / company left; report title right; range, location, contacts, generated
 * in an aligned header panel — then reporting details continue on the same page.
 * Returns the Y position where content should start.
 */
export function drawReportHeader(doc: jsPDF, options: ReportHeaderOptions): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  const headerTop = 9
  const barHeight = 26
  const rightEdge = pageWidth - margin
  const contentWidth = pageWidth - margin * 2
  const generated = (options.generatedAt ?? new Date()).toLocaleString()

  // Brand bar
  doc.setFillColor(...BRAND_CHARCOAL)
  doc.rect(0, 0, pageWidth, barHeight + 3, 'F')
  doc.setFillColor(...BRAND_ORANGE)
  doc.rect(0, barHeight + 3, pageWidth, 1.2, 'F')

  let textLeft = margin
  if (options.logoDataUrl) {
    try {
      const format = options.logoDataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG'
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, headerTop - 1, 20, 16, 2, 2, 'F')
      doc.addImage(options.logoDataUrl, format, margin + 1.5, headerTop + 0.5, 17, 13)
      textLeft = margin + 24
    } catch {
      // Logo failed — continue with text-only header
    }
  }

  // Company identity (left, beside logo)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(COMPANY.legalName, textLeft, headerTop + 6)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(COMPANY.slogan, textLeft, headerTop + 12)

  // Report title (top-right)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const titleLines = doc.splitTextToSize(options.title, 78)
  doc.text(titleLines, rightEdge, headerTop + 7, { align: 'right' })

  // Meta panel: professionally aligned label / value rows under the brand bar
  const rangeLine =
    options.reportRange != null
      ? options.reportRange
      : options.subtitle?.replace(/^Report range:\s*/i, '') || undefined

  const metaRows: Array<[string, string]> = []
  if (rangeLine) metaRows.push(['Report range', rangeLine])
  metaRows.push(['Location', `${COMPANY.address} · ${COMPANY.region}`])
  metaRows.push([
    'Contact',
    `${COMPANY.email}  ·  ${COMPANY.phoneDisplay}  ·  ${REPORT_SITE_DISPLAY}`,
  ])
  metaRows.push(['Generated', generated])

  const panelTop = barHeight + 7
  const rowH = 5.2
  const panelPadY = 4
  const panelH = panelPadY * 2 + metaRows.length * rowH
  const labelW = 28
  const valueX = margin + 4 + labelW

  doc.setFillColor(...META_BG)
  doc.roundedRect(margin, panelTop, contentWidth, panelH, 1.5, 1.5, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.25)
  doc.roundedRect(margin, panelTop, contentWidth, panelH, 1.5, 1.5, 'S')

  let y = panelTop + panelPadY + 3.5
  for (const [label, value] of metaRows) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(label, margin + 4, y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...BRAND_CHARCOAL)
    const wrapped = doc.splitTextToSize(value, contentWidth - labelW - 10)
    doc.text(wrapped, valueX, y)
    y += rowH * Math.max(1, wrapped.length)
  }

  const bottom = panelTop + panelH + 5
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, bottom, pageWidth - margin, bottom)

  return bottom + 5
}

/** Company letterhead rows for Excel / CSV exports. */
export function companyLetterheadRows(reportRange?: string): Array<Array<string | number>> {
  return [
    [COMPANY.legalName],
    [COMPANY.slogan],
    ...(reportRange ? [[`Report range: ${reportRange}`] as Array<string | number>] : []),
    [`Location: ${COMPANY.address} · ${COMPANY.region}`],
    [`Contact: ${COMPANY.email} · ${COMPANY.phoneDisplay} · ${REPORT_SITE_DISPLAY}`],
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
