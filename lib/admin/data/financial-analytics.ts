import { supabaseAdmin } from '@/lib/supabaseAdmin'

export type FinancialSummary = {
  totalRevenue: number
  learningRevenue: number
  supportRevenue: number
  shopGrossRevenue: number
  shopNetProfit: number
  shopCogs: number
  shopOrdersPaid: number
  shopOrdersPending: number
  shopOrdersCancelled: number
  shopLossAmount: number
  posRevenue: number
  onlineShopRevenue: number
  pendingPaymentsCount: number
  inventoryValueCost: number
  inventoryValueRetail: number
  lowStockCount: number
  outOfStockCount: number
  recentShopOrders: Array<{
    id: string
    order_number: string
    customer_name: string
    total_amount: number
    payment_status: string
    channel: string
    order_date: string
    profit?: number
  }>
  productSales: Array<{
    productId: string
    name: string
    unitsSold: number
    revenue: number
    cogs: number
    profit: number
    stock: number
    costPrice: number
    retailPrice: number
  }>
  dailyTraffic: Array<{
    date: string
    shopRevenue: number
    learningRevenue: number
    supportRevenue: number
    total: number
  }>
  range: { from: string | null; to: string | null }
}

const APPROVED_PAYMENT = ['approved', 'Paid']
const PAID_ORDER = ['paid', 'approved']
const PENDING_ORDER = ['unpaid', 'pending_review', 'gateway_pending']
const CANCELLED_ORDER = ['cancelled', 'canceled', 'rejected', 'refunded']

function dayKey(iso: string): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

function inRange(iso: string | null | undefined, from: string | null, to: string | null): boolean {
  if (!iso) return false
  const d = dayKey(iso)
  if (!d) return false
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

export async function loadFinancialSummary(options?: {
  from?: string | null
  to?: string | null
}): Promise<FinancialSummary> {
  const from = options?.from?.trim() || null
  const to = options?.to?.trim() || null

  const empty: FinancialSummary = {
    totalRevenue: 0,
    learningRevenue: 0,
    supportRevenue: 0,
    shopGrossRevenue: 0,
    shopNetProfit: 0,
    shopCogs: 0,
    shopOrdersPaid: 0,
    shopOrdersPending: 0,
    shopOrdersCancelled: 0,
    shopLossAmount: 0,
    posRevenue: 0,
    onlineShopRevenue: 0,
    pendingPaymentsCount: 0,
    inventoryValueCost: 0,
    inventoryValueRetail: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    recentShopOrders: [],
    productSales: [],
    dailyTraffic: [],
    range: { from, to },
  }

  if (!supabaseAdmin) return empty

  const { data: payments } = await supabaseAdmin
    .from('payments')
    .select(
      'amount, status, course_enrollment_id, support_subscription_id, order_id, created_at, reviewed_at, paid_at'
    )

  const approvedPayments = (payments ?? []).filter((p) => APPROVED_PAYMENT.includes(String(p.status)))
  const pendingPayments = (payments ?? []).filter((p) =>
    ['pending_review', 'gateway_pending', 'pending', 'Pending'].includes(String(p.status))
  )

  let learningRevenue = 0
  let supportRevenue = 0
  const dailyMap = new Map<string, { shop: number; learning: number; support: number }>()

  const bumpDay = (date: string, key: 'shop' | 'learning' | 'support', amount: number) => {
    if (!date) return
    const row = dailyMap.get(date) ?? { shop: 0, learning: 0, support: 0 }
    row[key] += amount
    dailyMap.set(date, row)
  }

  for (const p of approvedPayments) {
    const amount = Number(p.amount ?? 0)
    const stamp = String(p.reviewed_at || p.paid_at || p.created_at || '')
    if ((from || to) && !inRange(stamp, from, to)) continue

    const date = dayKey(stamp)
    if (p.course_enrollment_id) {
      learningRevenue += amount
      bumpDay(date, 'learning', amount)
    } else if (p.support_subscription_id) {
      supportRevenue += amount
      bumpDay(date, 'support', amount)
    }
  }

  const { data: allOrders } = await supabaseAdmin
    .from('orders')
    .select(
      'id, total_amount, payment_status, channel, order_number, customer_name, order_date, status, paid_at, created_at'
    )
    .order('order_date', { ascending: false })

  const paidOrders = (allOrders ?? []).filter((o) => {
    if (!PAID_ORDER.includes(String(o.payment_status))) return false
    const stamp = String(o.paid_at || o.order_date || o.created_at || '')
    if ((from || to) && !inRange(stamp, from, to)) return false
    return true
  })

  const pendingOrders = (allOrders ?? []).filter((o) =>
    PENDING_ORDER.includes(String(o.payment_status))
  )

  const cancelledOrders = (allOrders ?? []).filter((o) => {
    const cancelled =
      CANCELLED_ORDER.includes(String(o.status)) || CANCELLED_ORDER.includes(String(o.payment_status))
    if (!cancelled) return false
    const stamp = String(o.order_date || o.created_at || '')
    if ((from || to) && !inRange(stamp, from, to)) return false
    return true
  })

  let shopGrossRevenue = 0
  let shopCogs = 0
  let posRevenue = 0
  let onlineShopRevenue = 0
  let shopLossAmount = 0

  for (const order of cancelledOrders) {
    shopLossAmount += Number(order.total_amount ?? 0)
  }

  const paidIds = paidOrders.map((o) => String(o.id))
  const itemsByOrder = new Map<string, Array<{ product_id: string | null; product_name: string; quantity: number; unit_price: number; unit_cost: number; line_total: number }>>()

  if (paidIds.length > 0) {
    // Batch in chunks to avoid URL limits
    const chunkSize = 100
    for (let i = 0; i < paidIds.length; i += chunkSize) {
      const chunk = paidIds.slice(i, i + chunkSize)
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('order_id, product_id, product_name, quantity, unit_price, unit_cost, line_total')
        .in('order_id', chunk)

      for (const item of items ?? []) {
        const oid = String(item.order_id)
        const list = itemsByOrder.get(oid) ?? []
        list.push({
          product_id: item.product_id != null ? String(item.product_id) : null,
          product_name: String(item.product_name ?? 'Item'),
          quantity: Number(item.quantity ?? 0),
          unit_price: Number(item.unit_price ?? 0),
          unit_cost: Number(item.unit_cost ?? 0),
          line_total: Number(item.line_total ?? 0),
        })
        itemsByOrder.set(oid, list)
      }
    }
  }

  const productAgg = new Map<
    string,
    { name: string; unitsSold: number; revenue: number; cogs: number; productId: string }
  >()

  const orderProfits: Array<{ id: string; profit: number }> = []

  for (const order of paidOrders) {
    const total = Number(order.total_amount ?? 0)
    shopGrossRevenue += total
    if (order.channel === 'pos') posRevenue += total
    else onlineShopRevenue += total

    const stamp = String(order.paid_at || order.order_date || order.created_at || '')
    bumpDay(dayKey(stamp), 'shop', total)

    const items = itemsByOrder.get(String(order.id)) ?? []
    let orderCogs = 0
    for (const item of items) {
      const lineCogs = item.quantity * item.unit_cost
      const lineRevenue = item.line_total || item.quantity * item.unit_price
      orderCogs += lineCogs
      shopCogs += lineCogs

      const key = item.product_id || item.product_name
      const existing = productAgg.get(key) ?? {
        name: item.product_name,
        unitsSold: 0,
        revenue: 0,
        cogs: 0,
        productId: item.product_id || '',
      }
      existing.unitsSold += item.quantity
      existing.revenue += lineRevenue
      existing.cogs += lineCogs
      productAgg.set(key, existing)
    }
    orderProfits.push({ id: String(order.id), profit: total - orderCogs })
  }

  const shopNetProfit = shopGrossRevenue - shopCogs
  const totalRevenue = learningRevenue + supportRevenue + shopGrossRevenue

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, stock, price, discount, cost_price, low_stock_threshold, status')

  let inventoryValueCost = 0
  let inventoryValueRetail = 0
  let lowStockCount = 0
  let outOfStockCount = 0
  const stockById = new Map<string, { stock: number; cost: number; retail: number; name: string }>()

  for (const p of products ?? []) {
    const stock = Number(p.stock ?? 0)
    const cost = Number(p.cost_price ?? 0)
    const retail = Math.max(0, Number(p.price ?? 0) - Number(p.discount ?? 0))
    const threshold = Number(p.low_stock_threshold ?? 5)
    const active = !['archived', 'draft'].includes(String(p.status ?? ''))

    stockById.set(String(p.id), { stock, cost, retail, name: String(p.name ?? '') })

    if (active) {
      inventoryValueCost += stock * cost
      inventoryValueRetail += stock * retail
      if (stock <= 0) outOfStockCount += 1
      else if (stock <= threshold) lowStockCount += 1
    }
  }

  const productSales = Array.from(productAgg.values())
    .map((row) => {
      const stockInfo = stockById.get(row.productId)
      return {
        productId: row.productId,
        name: row.name || stockInfo?.name || 'Product',
        unitsSold: row.unitsSold,
        revenue: row.revenue,
        cogs: row.cogs,
        profit: row.revenue - row.cogs,
        stock: stockInfo?.stock ?? 0,
        costPrice: stockInfo?.cost ?? 0,
        retailPrice: stockInfo?.retail ?? 0,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)

  const profitById = new Map(orderProfits.map((p) => [p.id, p.profit]))

  const recentShopOrders = (allOrders ?? []).slice(0, 15).map((o) => ({
    id: String(o.id),
    order_number: String(o.order_number ?? ''),
    customer_name: String(o.customer_name ?? ''),
    total_amount: Number(o.total_amount ?? 0),
    payment_status: String(o.payment_status ?? 'unpaid'),
    channel: String(o.channel ?? 'online'),
    order_date: String(o.order_date ?? ''),
    profit: profitById.get(String(o.id)),
  }))

  const dailyTraffic = Array.from(dailyMap.entries())
    .map(([date, v]) => ({
      date,
      shopRevenue: v.shop,
      learningRevenue: v.learning,
      supportRevenue: v.support,
      total: v.shop + v.learning + v.support,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalRevenue,
    learningRevenue,
    supportRevenue,
    shopGrossRevenue,
    shopNetProfit,
    shopCogs,
    shopOrdersPaid: paidOrders.length,
    shopOrdersPending: pendingOrders.length,
    shopOrdersCancelled: cancelledOrders.length,
    shopLossAmount,
    posRevenue,
    onlineShopRevenue,
    pendingPaymentsCount: pendingPayments.length,
    inventoryValueCost,
    inventoryValueRetail,
    lowStockCount,
    outOfStockCount,
    recentShopOrders,
    productSales,
    dailyTraffic,
    range: { from, to },
  }
}
