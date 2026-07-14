import { NextResponse } from 'next/server'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'
import { isResendConfigured, EMAIL_FROM } from '@/lib/email/core'

export async function GET() {
  try {
    await requireAdminPermission(PERMISSIONS.SETTINGS_MANAGE)
    return NextResponse.json({
      configured: isResendConfigured(),
      from: EMAIL_FROM,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
