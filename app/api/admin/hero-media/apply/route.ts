import { NextResponse } from 'next/server'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'
import { applyHeroMediaUpdate, loadHeroMediaVersion } from '@/lib/media/hero-media-version'

/** After hero image/video uploads: bump cache version and switch playlist mode. */
export async function POST(request: Request) {
  try {
    await requireAdminPermission(PERMISSIONS.SETTINGS_MANAGE)
    const body = await request.json().catch(() => ({}))
    const modeRaw = String(body.mode ?? '').trim()
    const mode =
      modeRaw === 'videos' || modeRaw === 'images' ? (modeRaw as 'videos' | 'images') : null

    const result = await applyHeroMediaUpdate({ mode })
    return NextResponse.json({
      success: true,
      version: result.version,
      background_image: result.background_image,
      message: mode
        ? `Hero set to ${result.background_image} and cache refreshed (v=${result.version}).`
        : `Hero media cache refreshed (v=${result.version}).`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to apply hero media'
    const status = message === 'Unauthorized' || message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function GET() {
  try {
    await requireAdminPermission(PERMISSIONS.SETTINGS_MANAGE)
    const version = await loadHeroMediaVersion()
    return NextResponse.json({ version })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
