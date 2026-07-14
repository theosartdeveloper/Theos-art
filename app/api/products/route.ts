import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  attachProductCategories,
  normalizeProductRow,
  productWritePayload,
  productWritePayloadLegacySafe,
} from '@/lib/platform/products'

export async function GET(request: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    if (status === 'all') {
      await requireAdminPermission(PERMISSIONS.SHOP_PRODUCTS)
    }

    // Avoid PostgREST embeds (`category:categories(*)`) — legacy DBs often lack the FK.
    let query = supabaseAdmin.from('products').select('*')
    if (status === 'all') {
      // no status filter
    } else if (status) {
      query = query.eq('status', status)
    } else {
      query = query.eq('status', 'published')
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const withCategories = await attachProductCategories(supabaseAdmin, data ?? [])
    let products = withCategories.map((row) =>
      normalizeProductRow(row as Parameters<typeof normalizeProductRow>[0], row.category)
    )

    if (type) {
      products = products.filter((p) => p.category?.type === type)
    }

    return NextResponse.json(products)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission(PERMISSIONS.SHOP_PRODUCTS)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const payload = productWritePayload(body)
    if (!payload.name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }
    if (!payload.category_id) {
      return NextResponse.json({ error: 'Please select a category' }, { status: 400 })
    }

    let { data, error } = await supabaseAdmin.from('products').insert([payload]).select('*').single()

    // Graceful fallback when sale_unit / pack_quantity columns are not migrated yet.
    if (error && /sale_unit|pack_quantity|schema cache|column/i.test(error.message)) {
      const legacy = productWritePayloadLegacySafe(payload)
      const retry = await supabaseAdmin.from('products').insert([legacy]).select('*').single()
      data = retry.data
      error = retry.error
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const [withCategory] = await attachProductCategories(supabaseAdmin, [data])
    return NextResponse.json(
      normalizeProductRow(withCategory as Parameters<typeof normalizeProductRow>[0], withCategory.category),
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
