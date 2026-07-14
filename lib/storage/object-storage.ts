import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const SUPABASE_BUCKET = 'platform-media'
const SUPABASE_PUBLIC_MARKER = `/storage/v1/object/public/${SUPABASE_BUCKET}/`

let r2Client: S3Client | null = null

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  )
}

/** True when R2 credentials and a public base URL are both available. */
export function isR2Ready(): boolean {
  return isR2Configured() && Boolean(getMediaPublicBaseUrl())
}

export function getR2BucketName(): string {
  return process.env.R2_BUCKET_NAME?.trim() || 'platform-media'
}

/** Public CDN / r2.dev base, e.g. https://media.theosart.com or https://pub-xxx.r2.dev */
export function getMediaPublicBaseUrl(): string | null {
  const base =
    process.env.R2_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ||
    null
  return base ? base.replace(/\/$/, '') : null
}

function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 is not configured')
  }
  if (!r2Client) {
    const accountId = process.env.R2_ACCOUNT_ID!.trim()
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
      },
    })
  }
  return r2Client
}

export function getPublicUrl(path: string): string {
  const normalized = path.replace(/^\//, '')
  const mediaBase = getMediaPublicBaseUrl()
  if (isR2Configured()) {
    if (!mediaBase) {
      throw new Error(
        'R2 credentials are set but R2_PUBLIC_BASE_URL / NEXT_PUBLIC_R2_PUBLIC_BASE_URL is missing. See scripts/43-r2-setup.md'
      )
    }
    return `${mediaBase}/${normalized}`
  }
  if (!supabaseAdmin) {
    throw new Error('Storage not configured — set R2 env vars or Supabase')
  }
  const { data } = supabaseAdmin.storage.from(SUPABASE_BUCKET).getPublicUrl(normalized)
  return data.publicUrl
}

export function parseObjectPath(publicUrl: string): string | null {
  if (!publicUrl?.trim()) return null

  const mediaBase = getMediaPublicBaseUrl()
  if (mediaBase && publicUrl.startsWith(mediaBase)) {
    const path = publicUrl.slice(mediaBase.length).replace(/^\//, '').split('?')[0]
    return path ? decodeURIComponent(path) : null
  }

  const idx = publicUrl.indexOf(SUPABASE_PUBLIC_MARKER)
  if (idx === -1) return null
  const path = publicUrl.slice(idx + SUPABASE_PUBLIC_MARKER.length).split('?')[0]
  return path ? decodeURIComponent(path) : null
}

export function isSupabaseStorageUrl(publicUrl: string): boolean {
  return publicUrl.includes(SUPABASE_PUBLIC_MARKER)
}

export async function uploadObject(
  path: string,
  body: Buffer | Uint8Array,
  contentType: string,
  options?: { upsert?: boolean }
): Promise<{ url: string; path: string; provider: 'r2' | 'supabase' }> {
  const normalized = path.replace(/^\//, '')

  if (isR2Configured()) {
    const client = getR2Client()
    await client.send(
      new PutObjectCommand({
        Bucket: getR2BucketName(),
        Key: normalized,
        Body: body,
        ContentType: contentType,
      })
    )
    return { url: getPublicUrl(normalized), path: normalized, provider: 'r2' }
  }

  if (!supabaseAdmin) {
    throw new Error('Storage not configured — add R2 credentials to Vercel')
  }

  const { error } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).upload(normalized, body, {
    contentType,
    upsert: options?.upsert ?? false,
  })
  if (error) throw new Error(error.message)

  return { url: getPublicUrl(normalized), path: normalized, provider: 'supabase' }
}

export async function createSignedPutUrl(
  path: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<{ signedUrl: string; publicUrl: string; path: string }> {
  const normalized = path.replace(/^\//, '')

  if (isR2Configured()) {
    const client = getR2Client()
    // Do NOT sign Content-Type into the URL. Signing it forces the browser to send the
    // exact header; any mismatch (or CORS blocking that header) shows up as a
    // generic "Network error" on XMLHttpRequest. Object type is still set by the
    // Content-Type header the client sends on PUT.
    const command = new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: normalized,
    })
    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: expiresInSeconds,
      unsignableHeaders: new Set(['content-type', 'content-length']),
    })
    return {
      signedUrl,
      publicUrl: getPublicUrl(normalized),
      path: normalized,
    }
  }

  if (!supabaseAdmin) {
    throw new Error('Storage not configured — add R2 credentials to Vercel')
  }

  const { data, error } = await supabaseAdmin.storage
    .from(SUPABASE_BUCKET)
    .createSignedUploadUrl(normalized)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Could not create upload URL')
  }

  // Quiet unused param when using Supabase path
  void contentType

  return {
    signedUrl: data.signedUrl,
    publicUrl: getPublicUrl(normalized),
    path: normalized,
  }
}

export async function deleteObjectByUrl(publicUrl: string): Promise<void> {
  const path = parseObjectPath(publicUrl)
  if (!path) return

  if (isR2Configured() && !isSupabaseStorageUrl(publicUrl)) {
    const client = getR2Client()
    await client.send(
      new DeleteObjectCommand({
        Bucket: getR2BucketName(),
        Key: path,
      })
    )
    return
  }

  if (supabaseAdmin) {
    await supabaseAdmin.storage.from(SUPABASE_BUCKET).remove([path])
  }
}

export async function objectExists(path: string): Promise<boolean> {
  const normalized = path.replace(/^\//, '')

  if (isR2Configured()) {
    try {
      const client = getR2Client()
      await client.send(
        new HeadObjectCommand({
          Bucket: getR2BucketName(),
          Key: normalized,
        })
      )
      return true
    } catch {
      return false
    }
  }

  if (!supabaseAdmin) return false

  const folder = normalized.includes('/') ? normalized.slice(0, normalized.lastIndexOf('/')) : ''
  const name = normalized.includes('/') ? normalized.slice(normalized.lastIndexOf('/') + 1) : normalized
  const { data } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).list(folder || undefined, {
    limit: 100,
  })
  return (data ?? []).some((item) => item.name === name)
}

export async function listObjectNames(prefix: string): Promise<string[]> {
  const normalizedPrefix = prefix.replace(/^\//, '').replace(/\/?$/, '/')

  if (isR2Configured()) {
    const client = getR2Client()
    const { Contents } = await client.send(
      new ListObjectsV2Command({
        Bucket: getR2BucketName(),
        Prefix: normalizedPrefix,
      })
    )
    return (Contents ?? [])
      .map((item) => item.Key?.slice(normalizedPrefix.length))
      .filter((name): name is string => Boolean(name))
  }

  if (!supabaseAdmin) return []

  const folder = normalizedPrefix.replace(/\/$/, '')
  const { data } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).list(folder, { limit: 200 })
  return (data ?? []).map((item) => item.name)
}

export function storageConfigured(): boolean {
  return isR2Configured() || Boolean(supabaseAdmin)
}

export function storageConfigHint(): string {
  if (isR2Ready()) return 'Files are stored on Cloudflare R2.'
  if (isR2Configured()) {
    return 'R2 credentials found — add R2_PUBLIC_BASE_URL and NEXT_PUBLIC_R2_PUBLIC_BASE_URL (custom domain or pub-*.r2.dev), then redeploy. See scripts/43-r2-setup.md'
  }
  return 'Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_BASE_URL in Vercel. See scripts/43-r2-setup.md'
}
