import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { requireAdminAccess } from '@/app/actions/admin-context'
import { logAdminAction } from '@/lib/admin/audit-log'

async function verifyStoredPassword(password: string, stored: string | null | undefined) {
  if (!stored) return false
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
    return bcrypt.compare(password, stored)
  }
  return password === stored
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminAccess()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    if (!session.user.id || session.user.id === 'legacy-admin') {
      return NextResponse.json(
        { error: 'Sign in with your admin email account to change your password.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const currentPassword = String(body.currentPassword ?? '')
    const newPassword = String(body.newPassword ?? '')
    const confirmPassword = String(body.confirmPassword ?? '')

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    if (confirmPassword && confirmPassword !== newPassword) {
      return NextResponse.json({ error: 'New password and confirmation do not match.' }, { status: 400 })
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password.' },
        { status: 400 }
      )
    }

    const { data: user, error: loadError } = await supabaseAdmin
      .from('users')
      .select('id, password_hash')
      .eq('id', session.user.id)
      .maybeSingle()

    if (loadError || !user) {
      return NextResponse.json({ error: 'Could not load your account.' }, { status: 500 })
    }

    const matches = await verifyStoredPassword(currentPassword, user.password_hash)
    if (!matches) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await logAdminAction({
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      action: 'change_own_password',
      module: 'security',
      targetType: 'user',
      targetId: session.user.id,
      summary: 'Changed own admin password',
    })

    return NextResponse.json({ success: true, message: 'Password updated.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
