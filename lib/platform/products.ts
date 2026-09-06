import type { Category, Product } from '@/types/platform'

export type ProductSaleUnit = 'piece' | 'pack' | 'set'

export const PRODUCT_SALE_UNITS: { id: ProductSaleUnit; label: string; hint: string }[] = [
  { id: 'piece', label: 'Per piece', hint: 'Sold as a single item' },
  { id: 'pack', label: 'Pack', hint: 'Sold as a pack containing several pieces' },
  { id: 'set', label: 'Set / box', hint: 'Sold as a boxed set or kit' },
]

export function normalizeSaleUnit(value: unknown): ProductSaleUnit {
  const raw = String(value ?? 'piece').trim().toLowerCase()
  if (raw === 'pack' || raw === 'set' || raw === 'piece') return raw
  if (raw === 'pcs' || raw === 'each' || raw === 'item' || raw === 'unit') return 'piece'
  return 'piece'
}

export function normalizePackQuantity(value: unknown): number {
  const n = Math.round(Number(value ?? 1))
  return Number.isFinite(n) && n > 0 ? n : 1
}

export function formatProductUnitLabel(
  saleUnit: ProductSaleUnit,
  packQuantity: number
): string {
  if (saleUnit === 'piece' || packQuantity <= 1) return 'Per piece'
  if (saleUnit === 'pack') return `Pack of ${packQuantity}`
  return `Set of ${packQuantity}`
}

export type ProductAvailability = 'available' | 'low_stock' | 'out_of_stock'

export function getProductAvailability(
  stock: number,
  lowStockThreshold?: number | null
): ProductAvailability {
  if (!Number.isFinite(stock) || stock <= 0) return 'out_of_stock'
  const threshold =
    lowStockThreshold != null && Number.isFinite(lowStockThreshold) && lowStockThreshold > 0
      ? lowStockThreshold
      : 5
  if (stock <= threshold) return 'low_stock'
  return 'available'
}

export function formatProductAvailabilityLabel(status: ProductAvailability): string {
  if (status === 'out_of_stock') return 'Out of stock'
  if (status === 'low_stock') return 'Low stock'
  return 'Available'
}

export function productAvailabilityClass(status: ProductAvailability): string {
  if (status === 'out_of_stock') return 'bg-red-50 text-red-800 border-red-200'
  if (status === 'low_stock') return 'bg-amber-50 text-amber-900 border-amber-200'
  return 'bg-emerald-50 text-emerald-800 border-emerald-200'
}

export function formatProductStockLabel(
  stock: number,
  saleUnit: ProductSaleUnit,
  packQuantity: number
): string {
  if (stock <= 0) return 'Out of stock'
  const unitWord =
    saleUnit === 'pack' ? (stock === 1 ? 'pack' : 'packs') : saleUnit === 'set' ? (stock === 1 ? 'set' : 'sets') : stock === 1 ? 'piece' : 'pieces'
  if ((saleUnit === 'pack' || saleUnit === 'set') && packQuantity > 1) {
    return `${stock} ${unitWord} · ${packQuantity} pcs each`
  }
  return `${stock} ${unitWord} in stock`
}

type ProductRow = Record<string, unknown> & {
  id: string
  name: string
  images?: unknown
  image_url?: string | null
  specifications?: Record<string, unknown> | null
  category_id?: string | null
}

export function normalizeProductRow(
  row: ProductRow,
  category?: Category | null
): Product {
  const specs = (row.specifications && typeof row.specifications === 'object'
    ? row.specifications
    : {}) as Record<string, string>

  const saleUnit = normalizeSaleUnit(row.sale_unit ?? specs.sale_unit)
  const packQuantity = normalizePackQuantity(row.pack_quantity ?? specs.pack_quantity)

  const images = Array.isArray(row.images)
    ? (row.images as string[]).filter(Boolean)
    : row.image_url
      ? [String(row.image_url)]
      : []

  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    description: row.description != null ? String(row.description) : null,
    category_id: row.category_id != null ? String(row.category_id) : null,
    sku: row.sku != null ? String(row.sku) : null,
    price: Number(row.price ?? 0),
    discount: row.discount != null ? Number(row.discount) : null,
    stock: Number(row.stock ?? 0),
    low_stock_threshold:
      row.low_stock_threshold != null ? Number(row.low_stock_threshold) : null,
    images,
    specifications: {
      ...specs,
      sale_unit: saleUnit,
      pack_quantity: String(packQuantity),
    },
    status: (row.status as Product['status']) ?? 'draft',
    sale_unit: saleUnit,
    pack_quantity: packQuantity,
    category: category ?? null,
  }
}

export function productWritePayload(body: Record<string, unknown>) {
  const specsIn =
    body.specifications && typeof body.specifications === 'object'
      ? (body.specifications as Record<string, unknown>)
      : {}
  const saleUnit = normalizeSaleUnit(body.sale_unit ?? specsIn.sale_unit)
  const packQuantity = normalizePackQuantity(body.pack_quantity ?? specsIn.pack_quantity)

  const images = Array.isArray(body.images)
    ? body.images.map(String).filter(Boolean)
    : body.image_url
      ? [String(body.image_url)]
      : []

  return {
    name: String(body.name ?? '').trim(),
    description: String(body.description ?? '').trim() || null,
    price: Number(body.price ?? 0),
    cost_price: Number(body.cost_price ?? 0) || 0,
    stock: Math.max(0, Math.round(Number(body.stock ?? 0))),
    sku: String(body.sku ?? '').trim() || null,
    category_id: body.category_id ? String(body.category_id) : null,
    status: String(body.status ?? 'published'),
    discount: Number(body.discount ?? 0) || 0,
    images,
    sale_unit: saleUnit,
    pack_quantity: packQuantity,
    specifications: {
      ...Object.fromEntries(
        Object.entries(specsIn).map(([k, v]) => [k, String(v ?? '')])
      ),
      sale_unit: saleUnit,
      pack_quantity: String(packQuantity),
    },
  }
}

/** Insert/update without dedicated unit columns if the DB has not been migrated yet. */
export function productWritePayloadLegacySafe(payload: ReturnType<typeof productWritePayload>) {
  const { sale_unit: _u, pack_quantity: _p, ...rest } = payload
  return rest
}

export async function attachProductCategories<T extends { category_id?: string | null }>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: { from: (table: string) => any },
  rows: T[]
): Promise<(T & { category: Category | null })[]> {
  const ids = [...new Set(rows.map((r) => r.category_id).filter(Boolean))] as string[]
  if (ids.length === 0) {
    return rows.map((row) => ({ ...row, category: null }))
  }

  const { data } = await client.from('categories').select('*').in('id', ids)
  const byId = new Map(((data ?? []) as Category[]).map((cat) => [cat.id, cat]))
  return rows.map((row) => ({
    ...row,
    category: row.category_id ? byId.get(row.category_id) ?? null : null,
  }))
}
