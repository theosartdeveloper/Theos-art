import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { FinancialSummary } from '@/lib/admin/data/financial-analytics'
import { COMPANY } from '@/lib/company/constants'
import {
  companyLetterheadRows,
  drawReportFooter,
  drawReportHeader,
  loadReportLogoDataUrl,
} from '@/lib/admin/data/report-branding'

function escapeCsv(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatRwf(n: number): string {
  return `${Math.round(n).toLocaleString()} RWF`
}

function rangeLabel(data: FinancialSummary): string {
  if (data.range.from && data.range.to) return `${data.range.from} → ${data.range.to}`
  if (data.range.from) return `From ${data.range.from}`
  if (data.range.to) return `Until ${data.range.to}`
  return 'All time'
}

export function moneyTrafficFileStamp(data: FinancialSummary): string {
  const a = data.range.from || 'all'
  const b = data.range.to || 'now'
  return `${a}_to_${b}`
}

/** Excel-compatible SpreadsheetML (.xls) — opens in Excel / Google Sheets without extra packages. */
export function buildMoneyTrafficExcelXml(data: FinancialSummary): string {
  const letterhead = companyLetterheadRows()
  const summaryRows: Array<[string, string | number]> = [
    ['Report', 'Money traffic & shop sales'],
    ['Report range', rangeLabel(data)],
    ['Total website revenue', data.totalRevenue],
    ['E-learning revenue', data.learningRevenue],
    ['Support revenue', data.supportRevenue],
    ['Shop gross revenue', data.shopGrossRevenue],
    ['Shop COGS', data.shopCogs],
    ['Shop net profit', data.shopNetProfit],
    ['POS revenue', data.posRevenue],
    ['Online shop revenue', data.onlineShopRevenue],
    ['Paid shop orders', data.shopOrdersPaid],
    ['Pending shop orders', data.shopOrdersPending],
    ['Cancelled / lost order value', data.shopLossAmount],
    ['Pending payment receipts', data.pendingPaymentsCount],
    ['Inventory at cost', data.inventoryValueCost],
    ['Inventory at retail', data.inventoryValueRetail],
    ['Low stock SKUs', data.lowStockCount],
    ['Out of stock SKUs', data.outOfStockCount],
  ]

  const sheet = (name: string, headers: string[], rows: Array<Array<string | number>>) => {
    const headerXml = headers
      .map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`)
      .join('')
    const bodyXml = rows
      .map((row) => {
        const cells = row
          .map((cell) => {
            const isNum = typeof cell === 'number'
            return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${escapeXml(cell)}</Data></Cell>`
          })
          .join('')
        return `<Row>${cells}</Row>`
      })
      .join('')
    return `<Worksheet ss:Name="${escapeXml(name)}"><Table><Row>${headerXml}</Row>${bodyXml}</Table></Worksheet>`
  }

  const coverRows = [
    ...letterhead.map((r) => (r.length === 1 ? [r[0]!, ''] : [r[0] ?? '', r[1] ?? ''])),
    ...summaryRows,
  ]

  const summarySheet = sheet('Summary', ['Metric', 'Value'], coverRows)
  const productSheet = sheet(
    'Product sales',
    ['Product', 'Units sold', 'Revenue', 'COGS', 'Profit', 'Stock', 'Cost price', 'Retail price'],
    data.productSales.map((p) => [
      p.name,
      p.unitsSold,
      p.revenue,
      p.cogs,
      p.profit,
      p.stock,
      p.costPrice,
      p.retailPrice,
    ])
  )
  const dailySheet = sheet(
    'Daily traffic',
    ['Date', 'Shop', 'E-learning', 'Support', 'Total'],
    data.dailyTraffic.map((d) => [d.date, d.shopRevenue, d.learningRevenue, d.supportRevenue, d.total])
  )
  const ordersSheet = sheet(
    'Recent orders',
    ['Order', 'Customer', 'Amount', 'Payment', 'Channel', 'Date', 'Profit'],
    data.recentShopOrders.map((o) => [
      o.order_number,
      o.customer_name,
      o.total_amount,
      o.payment_status,
      o.channel,
      o.order_date,
      o.profit ?? '',
    ])
  )

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${summarySheet}
${productSheet}
${dailySheet}
${ordersSheet}
</Workbook>`
}

export function buildMoneyTrafficCsv(data: FinancialSummary): string {
  const lines: Array<Array<string | number>> = [
    ...companyLetterheadRows(),
    ['Money traffic & shop sales'],
    ['Range', rangeLabel(data)],
    [],
    ['Metric', 'Value (RWF unless noted)'],
    ['Total website revenue', data.totalRevenue],
    ['E-learning revenue', data.learningRevenue],
    ['Support revenue', data.supportRevenue],
    ['Shop gross revenue', data.shopGrossRevenue],
    ['Shop COGS', data.shopCogs],
    ['Shop net profit', data.shopNetProfit],
    ['POS revenue', data.posRevenue],
    ['Online shop revenue', data.onlineShopRevenue],
    ['Cancelled / lost order value', data.shopLossAmount],
    ['Inventory at cost', data.inventoryValueCost],
    ['Inventory at retail', data.inventoryValueRetail],
    ['Low stock SKUs', data.lowStockCount],
    ['Out of stock SKUs', data.outOfStockCount],
    [],
    ['Product', 'Units sold', 'Revenue', 'COGS', 'Profit', 'Stock'],
    ...data.productSales.map((p) => [
      p.name,
      p.unitsSold,
      p.revenue,
      p.cogs,
      p.profit,
      p.stock,
    ]),
  ]
  return lines.map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export function downloadMoneyTrafficExcel(data: FinancialSummary) {
  const xml = buildMoneyTrafficExcelXml(data)
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `theos-art-money-traffic-${moneyTrafficFileStamp(data)}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadMoneyTrafficCsv(data: FinancialSummary) {
  const csv = '\uFEFF' + buildMoneyTrafficCsv(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `theos-art-money-traffic-${moneyTrafficFileStamp(data)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadMoneyTrafficPdf(data: FinancialSummary) {
  const doc = new jsPDF()
  const logoDataUrl = await loadReportLogoDataUrl()

  // Cover / letterhead page only — maximize space for metrics on the next page
  drawReportHeader(doc, {
    title: 'Money traffic & shop sales',
    subtitle: `Report range: ${rangeLabel(data)}`,
    logoDataUrl,
  })

  doc.addPage()
  const metricsTop = 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(58, 58, 58)
  doc.text('Key metrics', 14, metricsTop)

  autoTable(doc, {
    head: [['Metric', 'Value']],
    body: [
      ['Total website revenue', formatRwf(data.totalRevenue)],
      ['E-learning', formatRwf(data.learningRevenue)],
      ['Support', formatRwf(data.supportRevenue)],
      ['Shop gross', formatRwf(data.shopGrossRevenue)],
      ['Shop COGS', formatRwf(data.shopCogs)],
      ['Shop net profit', formatRwf(data.shopNetProfit)],
      ['POS sales', formatRwf(data.posRevenue)],
      ['Online shop', formatRwf(data.onlineShopRevenue)],
      ['Cancelled / lost', formatRwf(data.shopLossAmount)],
      ['Inventory (cost)', formatRwf(data.inventoryValueCost)],
      ['Inventory (retail)', formatRwf(data.inventoryValueRetail)],
      ['Low stock', String(data.lowStockCount)],
      ['Out of stock', String(data.outOfStockCount)],
      ['Pending receipts', String(data.pendingPaymentsCount)],
    ],
    startY: metricsTop + 4,
    theme: 'striped',
    headStyles: { fillColor: [58, 58, 58] },
    styles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  })

  doc.addPage()
  const productsTop = 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(58, 58, 58)
  doc.text('Detailed products', 14, productsTop)

  const productRows =
    data.productSales.length > 0
      ? data.productSales.slice(0, 120).map((p) => [
          p.name,
          String(p.unitsSold),
          formatRwf(p.revenue),
          formatRwf(p.cogs),
          formatRwf(p.profit),
          String(p.stock),
        ])
      : [['No products found in catalog or paid sales for this range.', '', '', '', '', '']]

  autoTable(doc, {
    head: [['Product', 'Units', 'Revenue', 'COGS', 'Profit', 'Stock']],
    body: productRows,
    startY: productsTop + 4,
    theme: 'striped',
    headStyles: { fillColor: [240, 138, 40] },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  })

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    drawReportFooter(doc, i, pageCount)
  }

  doc.save(`theos-art-money-traffic-${moneyTrafficFileStamp(data)}.pdf`)
}
