import { NextResponse } from 'next/server'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'
import { HERO_IMAGE_FILES } from '@/lib/media/hero-images'
import { getHeroImagesPublicBaseUrl } from '@/lib/storage/hero-image-upload'
import { listObjectNames, objectExists, storageConfigHint, storageConfigured } from '@/lib/storage/object-storage'

export async function GET() {
  try {
    await requireAdminPermission(PERMISSIONS.SETTINGS_MANAGE)

    if (!storageConfigured()) {
      return NextResponse.json({ error: 'Storage not configured', hint: storageConfigHint() }, { status: 500 })
    }

    const base = getHeroImagesPublicBaseUrl()
    const namesOnStorage = new Set(await listObjectNames('hero/'))

    const files = await Promise.all(
      HERO_IMAGE_FILES.map(async ({ file, label }) => {
        const exists = namesOnStorage.has(file) || (await objectExists(`hero/${file}`))
        return { file, label, url: `${base}/${file}`, exists }
      })
    )

    return NextResponse.json({ baseUrl: base, files })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Forbidden'
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
