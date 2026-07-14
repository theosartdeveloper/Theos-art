import { NextResponse } from 'next/server'
import { requireAdminPermission } from '@/app/actions/admin-context'
import { PERMISSIONS } from '@/lib/admin/permissions'
import { HERO_IMAGE_FILES } from '@/lib/media/hero-images'
import {
  getHeroImagesPublicBaseUrl,
  uploadHeroImageFile,
} from '@/lib/storage/hero-image-upload'
import { listObjectNames, objectExists, storageConfigHint, storageConfigured } from '@/lib/storage/object-storage'

const ALLOWED_NAMES = new Set<string>(HERO_IMAGE_FILES.map((f) => f.file))

/** Server-side fallback upload (small files) when browser→R2 CORS fails. */
export async function POST(request: Request) {
  try {
    await requireAdminPermission(PERMISSIONS.SETTINGS_MANAGE)

    if (!storageConfigured()) {
      return NextResponse.json({ error: 'Storage not configured', hint: storageConfigHint() }, { status: 500 })
    }

    const formData = await request.formData()
    const results: { file: string; url?: string; error?: string }[] = []

    for (const { file: expectedName } of HERO_IMAGE_FILES) {
      const entry = formData.get(expectedName)
      if (!(entry instanceof File) || entry.size === 0) continue

      if (!ALLOWED_NAMES.has(expectedName)) {
        results.push({ file: expectedName, error: 'Invalid filename' })
        continue
      }

      const contentType = entry.type || 'image/png'
      const buffer = Buffer.from(await entry.arrayBuffer())
      const uploaded = await uploadHeroImageFile(expectedName, buffer, contentType)
      if (!uploaded.ok) {
        results.push({ file: expectedName, error: uploaded.error })
        continue
      }
      results.push({ file: expectedName, url: uploaded.url })
    }

    const uploaded = results.filter((r) => r.url)
    if (!uploaded.length) {
      return NextResponse.json(
        { error: 'No image files received.', results },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${uploaded.length} hero image(s).`,
      baseUrl: getHeroImagesPublicBaseUrl(),
      results,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    const status = message === 'Unauthorized' || message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

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
