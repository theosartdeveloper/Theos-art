import { NextResponse } from 'next/server'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'
import { createHeroImageUploadTarget } from '@/lib/storage/hero-image-upload'

export async function POST(request: Request) {
  try {
    await requireAdminPermission(PERMISSIONS.SETTINGS_MANAGE)

    const body = await request.json()
    const target = await createHeroImageUploadTarget({
      name: String(body.file ?? ''),
      size: Number(body.size ?? 0),
      type: body.contentType ? String(body.contentType) : undefined,
    })

    if (!target.ok) {
      return NextResponse.json(
        { error: target.error, hint: target.hint },
        { status: target.status }
      )
    }

    return NextResponse.json({
      file: String(body.file ?? ''),
      signedUrl: target.signedUrl,
      path: target.path,
      publicUrl: target.publicUrl,
      contentType: target.contentType,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
