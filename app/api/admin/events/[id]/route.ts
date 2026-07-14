import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'

function toEventPayload(body: Record<string, unknown>, partial = false) {
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (!partial || body.title !== undefined) update.title = String(body.title ?? '').trim()
  if (!partial || body.description !== undefined) {
    update.description = String(body.description ?? '').trim() || null
  }
  if (!partial || body.event_type !== undefined) {
    update.event_type = String(body.event_type ?? 'art_event').trim() || 'art_event'
  }
  if (!partial || body.start_date !== undefined) {
    update.start_date = body.start_date ? String(body.start_date) : null
  }
  if (!partial || body.end_date !== undefined) {
    update.end_date = body.end_date ? String(body.end_date) : null
  }
  if (!partial || body.location !== undefined) {
    update.location = String(body.location ?? '').trim() || null
  }
  if (!partial || body.image_url !== undefined) {
    update.image_url = body.image_url ? String(body.image_url) : null
  }
  if (!partial || body.status !== undefined) {
    update.status = String(body.status ?? 'draft')
  }
  if (!partial || body.is_past !== undefined) {
    update.is_past = Boolean(body.is_past)
  } else if (update.start_date) {
    update.is_past = new Date(String(update.start_date)).getTime() < Date.now()
  }

  return update
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(PERMISSIONS.CONTENT_ANNOUNCEMENTS)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const payload = toEventPayload(body, true)
    if (payload.title !== undefined && !String(payload.title).trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update event'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission(PERMISSIONS.CONTENT_ANNOUNCEMENTS)
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete event'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
