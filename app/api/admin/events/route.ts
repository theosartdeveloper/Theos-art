import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'

function toEventPayload(body: Record<string, unknown>) {
  const status = String(body.status ?? 'draft')
  const startDate = body.start_date ? String(body.start_date) : null
  const endDate = body.end_date ? String(body.end_date) : null
  const isPast =
    body.is_past !== undefined
      ? Boolean(body.is_past)
      : startDate
        ? new Date(startDate).getTime() < Date.now()
        : false

  return {
    title: String(body.title ?? '').trim(),
    description: String(body.description ?? '').trim() || null,
    event_type: String(body.event_type ?? 'art_event').trim() || 'art_event',
    start_date: startDate,
    end_date: endDate,
    location: String(body.location ?? '').trim() || null,
    image_url: body.image_url ? String(body.image_url) : null,
    is_past: isPast,
    status,
    updated_at: new Date().toISOString(),
  }
}

export async function GET() {
  try {
    await requireAdminPermission(PERMISSIONS.CONTENT_ANNOUNCEMENTS)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load events'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission(PERMISSIONS.CONTENT_ANNOUNCEMENTS)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const payload = toEventPayload(body)
    if (!payload.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.from('events').insert([payload]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create event'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
