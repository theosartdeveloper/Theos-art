import { HERO_IMAGE_FILES } from '@/lib/media/hero-images'
import {
  createSignedPutUrl,
  getMediaPublicBaseUrl,
  storageConfigHint,
  storageConfigured,
  uploadObject,
} from '@/lib/storage/object-storage'

export const HERO_IMAGE_MAX_BYTES = 25 * 1024 * 1024

const ALLOWED = new Map<string, string>(
  HERO_IMAGE_FILES.map((item) => [item.file, 'image/png'])
)

function contentTypeForName(name: string, fallback?: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.png')) return 'image/png'
  return fallback || ALLOWED.get(name) || 'image/png'
}

export function validateHeroImageFile(file: {
  name: string
  size: number
}): { ok: true; contentType: string; path: string } | { ok: false; error: string } {
  if (!ALLOWED.has(file.name)) {
    return { ok: false, error: 'Invalid hero image filename — use hero-01.png … hero-05.png' }
  }
  if (file.size > HERO_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `File must be under ${Math.round(HERO_IMAGE_MAX_BYTES / 1024 / 1024)} MB`,
    }
  }
  if (file.size < 200) {
    return { ok: false, error: 'File looks empty or corrupted' }
  }
  return {
    ok: true,
    contentType: contentTypeForName(file.name),
    path: `hero/${file.name}`,
  }
}

export async function createHeroImageUploadTarget(file: {
  name: string
  size: number
  type?: string
}): Promise<
  | { ok: true; signedUrl: string; path: string; publicUrl: string; contentType: string }
  | { ok: false; error: string; status: number; hint?: string }
> {
  if (!storageConfigured()) {
    return { ok: false, error: 'Storage not configured', status: 500, hint: storageConfigHint() }
  }

  const validation = validateHeroImageFile(file)
  if (!validation.ok) {
    return { ok: false, error: validation.error, status: 400 }
  }

  const contentType = contentTypeForName(file.name, file.type)

  try {
    const target = await createSignedPutUrl(validation.path, contentType, 3600)
    return {
      ok: true,
      signedUrl: target.signedUrl,
      path: target.path,
      publicUrl: target.publicUrl,
      contentType,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not create upload URL',
      status: 500,
      hint: storageConfigHint(),
    }
  }
}

export async function uploadHeroImageFile(
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const validation = validateHeroImageFile({ name: fileName, size: buffer.length })
  if (!validation.ok) return { ok: false, error: validation.error }

  try {
    const result = await uploadObject(validation.path, buffer, contentType, { upsert: true })
    return { ok: true, url: result.url }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Upload failed' }
  }
}

export function getHeroImagesPublicBaseUrl(): string {
  const mediaBase = getMediaPublicBaseUrl()
  if (mediaBase) return `${mediaBase}/hero`

  const explicit = process.env.NEXT_PUBLIC_HERO_IMAGES_BASE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? ''
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/platform-media/hero`
  }

  return '/hero'
}
