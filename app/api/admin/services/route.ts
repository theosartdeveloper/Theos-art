import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'
import { DEFAULT_STUDIO_SERVICES } from '@/lib/company/constants'

export async function GET() {
  try {
    await requireAdminPermission(PERMISSIONS.CONTENT_SERVICES)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load services'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission(PERMISSIONS.CONTENT_SERVICES)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()

    if (body.seedDefaults) {
      const { count } = await supabaseAdmin.from('services').select('id', { count: 'exact', head: true })
      if ((count ?? 0) > 0) {
        return NextResponse.json({ error: 'Services already exist. Delete or edit them instead.' }, { status: 400 })
      }

      const rows = DEFAULT_STUDIO_SERVICES.map((service) => ({
        title: service.title,
        description: service.description,
        category: service.category,
        image_url: null,
        is_published: true,
      }))

      const { data, error } = await supabaseAdmin.from('services').insert(rows).select()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data ?? [], { status: 201 })
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert([
        {
          title: body.title,
          description: body.description,
          category: body.category ?? '',
          image_url: body.image_url ?? null,
          is_published: Boolean(body.is_published),
        },
      ])
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create service'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
